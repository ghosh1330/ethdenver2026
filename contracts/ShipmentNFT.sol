// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ShipmentNFT
 * @notice Every ThreadHunt purchase mints one NFT that acts as the
 *         digital twin of the physical package.  The seller advances
 *         the status on-chain; the buyer (NFT holder) can always see
 *         exactly where their parcel is — even when outside USPS/FedEx
 *         coverage.
 *
 * Status lifecycle:
 *   0  Packed      – seller has packaged the item
 *   1  Shipped     – handed to carrier / in transit
 *   2  InTransit   – at intermediate facility
 *   3  Delivered   – confirmed delivered to buyer
 */
contract ShipmentNFT is ERC721, Ownable {

    // ── Enums & structs ────────────────────────────────────────────────────

    enum ShipmentStatus { Packed, Shipped, InTransit, Delivered }

    struct Shipment {
        uint256 invoiceId;      // links back to AdiInvoice
        address seller;         // can push status updates
        address buyer;          // NFT owner / recipient
        string  itemName;       // human-readable item description
        string  origin;         // e.g. "Tokyo, Japan"
        string  destination;    // e.g. "New York, USA"
        ShipmentStatus status;
        uint256 mintedAt;
        uint256 deliveredAt;    // 0 until delivered
    }

    // ── State ──────────────────────────────────────────────────────────────

    uint256 public nextTokenId = 1;

    /// tokenId → Shipment
    mapping(uint256 => Shipment) public shipments;

    /// invoiceId → tokenId  (1-to-1)
    mapping(uint256 => uint256) public invoiceToToken;

    /// address authorised to mint (= AdiInvoice contract)
    address public minter;

    // ── Events ─────────────────────────────────────────────────────────────

    event ShipmentMinted(
        uint256 indexed tokenId,
        uint256 indexed invoiceId,
        address indexed buyer,
        address seller,
        string  itemName,
        string  origin,
        string  destination
    );

    event StatusUpdated(
        uint256 indexed tokenId,
        ShipmentStatus  oldStatus,
        ShipmentStatus  newStatus,
        address         updatedBy
    );

    // ── Constructor ────────────────────────────────────────────────────────

    constructor(address initialOwner)
        ERC721("ThreadHunt Shipment", "THS")
        Ownable(initialOwner)
    {}

    // ── Minter management ─────────────────────────────────────────────────

    /// @notice Set the address allowed to mint (should be AdiInvoice)
    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    // ── Core functions ─────────────────────────────────────────────────────

    /**
     * @notice Mint a shipment NFT for a completed purchase.
     *         Called by AdiInvoice immediately after payment is confirmed.
     * @return tokenId  The newly minted token ID shown to the buyer.
     */
    function mintShipment(
        uint256 invoiceId,
        address seller,
        address buyer,
        string  calldata itemName,
        string  calldata origin,
        string  calldata destination
    ) external returns (uint256 tokenId) {
        require(msg.sender == minter || msg.sender == owner(), "ShipmentNFT: not authorised");
        require(invoiceToToken[invoiceId] == 0, "ShipmentNFT: already minted for this invoice");

        tokenId = nextTokenId++;

        shipments[tokenId] = Shipment({
            invoiceId:   invoiceId,
            seller:      seller,
            buyer:       buyer,
            itemName:    itemName,
            origin:      origin,
            destination: destination,
            status:      ShipmentStatus.Packed,
            mintedAt:    block.timestamp,
            deliveredAt: 0
        });

        invoiceToToken[invoiceId] = tokenId;

        _safeMint(buyer, tokenId);

        emit ShipmentMinted(tokenId, invoiceId, buyer, seller, itemName, origin, destination);
    }

    /**
     * @notice Seller advances the shipment status.
     *         Status can only move forward (Packed→Shipped→InTransit→Delivered).
     */
    function updateStatus(uint256 tokenId, ShipmentStatus newStatus) external {
        Shipment storage s = shipments[tokenId];
        require(s.seller != address(0),          "ShipmentNFT: token not found");
        require(msg.sender == s.seller,           "ShipmentNFT: only seller can update");
        require(uint8(newStatus) > uint8(s.status), "ShipmentNFT: status can only advance");

        ShipmentStatus old = s.status;
        s.status = newStatus;

        if (newStatus == ShipmentStatus.Delivered) {
            s.deliveredAt = block.timestamp;
        }

        emit StatusUpdated(tokenId, old, newStatus, msg.sender);
    }

    // ── Views ───────────────────────────────────────────────────────────────

    function getShipment(uint256 tokenId) external view returns (Shipment memory) {
        return shipments[tokenId];
    }

    function getTokenByInvoice(uint256 invoiceId) external view returns (uint256) {
        return invoiceToToken[invoiceId];
    }

    function statusLabel(uint256 tokenId) external view returns (string memory) {
        ShipmentStatus s = shipments[tokenId].status;
        if (s == ShipmentStatus.Packed)    return "Packed";
        if (s == ShipmentStatus.Shipped)   return "Shipped";
        if (s == ShipmentStatus.InTransit) return "In Transit";
        if (s == ShipmentStatus.Delivered) return "Delivered";
        return "Unknown";
    }
}
