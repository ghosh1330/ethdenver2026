// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./OracleAdapter.sol";
import "./ShipmentNFT.sol";

/**
 * @title AdiInvoice  (v2 — with Escrow + NFT Tracking)
 * @notice Handles ThreadHunt purchases on ADI chain.
 *
 * Flow:
 *   1. Seller creates invoice (fiat price + currency).
 *   2. Buyer calls payInvoice() — ADI held in THIS contract (escrow).
 *   3. ShipmentNFT is minted for the buyer automatically.
 *   4. Seller ships and updates NFT status on-chain.
 *   5a. Buyer calls confirmDelivery() → ADI released to seller.
 *   5b. OR buyer calls claimRefund() after ESCROW_PERIOD if not delivered
 *       → ADI returned to buyer.
 */
contract AdiInvoice is Ownable {
    using SafeERC20 for IERC20;

    // ── Constants ──────────────────────────────────────────────────────────

    /// @notice How long buyer must wait before claiming a refund (30 days)
    uint256 public constant ESCROW_PERIOD = 30 days;

    // ── Enums & structs ────────────────────────────────────────────────────

    enum InvoiceStatus {
        Pending,      // 0 – waiting for payment
        Paid,         // 1 – paid, funds in escrow
        Delivered,    // 2 – buyer confirmed delivery, funds released
        Refunded,     // 3 – buyer claimed refund
        Cancelled     // 4 – cancelled before payment
    }

    struct Invoice {
        address merchant;
        address payer;
        uint256 fiatAmountMinor;
        bytes32 currency;
        uint64  expiresAt;
        uint256 adiAmount;
        uint256 rateUsed;
        uint256 paidAt;         // timestamp of payment (for escrow timer)
        uint256 shipmentTokenId;// ShipmentNFT token ID (0 if not minted)
        InvoiceStatus status;
    }

    // ── State ──────────────────────────────────────────────────────────────

    OracleAdapter public oracle;
    IERC20        public adiToken;
    ShipmentNFT   public shipmentNFT;

    uint256 public nextInvoiceId = 1;
    mapping(uint256 => Invoice) public invoices;
    mapping(address => uint256[]) public merchantInvoices;
    mapping(address => uint256[]) public buyerInvoices;

    // ── Events ─────────────────────────────────────────────────────────────

    event InvoiceCreated(
        uint256 indexed invoiceId,
        address indexed merchant,
        uint256 fiatAmount,
        bytes32 currency,
        uint64  expiresAt
    );

    event InvoicePaid(
        uint256 indexed invoiceId,
        address indexed merchant,
        address indexed payer,
        uint256 fiatAmount,
        bytes32 currency,
        uint256 adiAmount,
        uint256 rateUsed,
        uint256 shipmentTokenId
    );

    event DeliveryConfirmed(
        uint256 indexed invoiceId,
        address indexed merchant,
        uint256 adiAmount
    );

    event RefundClaimed(
        uint256 indexed invoiceId,
        address indexed buyer,
        uint256 adiAmount
    );

    event InvoiceCancelled(uint256 indexed invoiceId);

    // ── Constructor ────────────────────────────────────────────────────────

    constructor(
        address initialOwner,
        address _oracle,
        address _adiToken,
        address _shipmentNFT
    ) Ownable(initialOwner) {
        oracle      = OracleAdapter(_oracle);
        adiToken    = IERC20(_adiToken);
        shipmentNFT = ShipmentNFT(_shipmentNFT);
    }

    // ── Invoice creation ───────────────────────────────────────────────────

    function createInvoice(
        address merchant,
        uint256 fiatAmountMinor,
        bytes32 currency,
        uint64  expiresAt
    ) external returns (uint256 invoiceId) {
        require(merchant != address(0), "AdiInvoice: zero merchant");
        require(fiatAmountMinor > 0,    "AdiInvoice: zero amount");

        invoiceId = nextInvoiceId++;
        invoices[invoiceId] = Invoice({
            merchant:         merchant,
            payer:            address(0),
            fiatAmountMinor:  fiatAmountMinor,
            currency:         currency,
            expiresAt:        expiresAt,
            adiAmount:        0,
            rateUsed:         0,
            paidAt:           0,
            shipmentTokenId:  0,
            status:           InvoiceStatus.Pending
        });
        merchantInvoices[merchant].push(invoiceId);

        emit InvoiceCreated(invoiceId, merchant, fiatAmountMinor, currency, expiresAt);
    }

    // ── Payment — funds go into escrow ─────────────────────────────────────

    /**
     * @notice Pay an invoice. ADI is held in this contract until delivery
     *         is confirmed or a refund is claimed.
     * @param invoiceId   The invoice to pay.
     * @param itemName    Name of the item (stored on NFT).
     * @param origin      Shipping origin city/country.
     * @param destination Buyer's destination city/country.
     */
    function payInvoice(
        uint256 invoiceId,
        string calldata itemName,
        string calldata origin,
        string calldata destination
    ) external {
        Invoice storage inv = invoices[invoiceId];

        require(inv.merchant != address(0), "AdiInvoice: invoice not found");
        require(inv.status == InvoiceStatus.Pending, "AdiInvoice: invoice not pending");
        require(
            inv.expiresAt == 0 || block.timestamp <= inv.expiresAt,
            "AdiInvoice: invoice expired"
        );

        uint256 rate      = oracle.getRate(inv.currency);
        uint256 adiAmount = oracle.getQuote(inv.fiatAmountMinor, inv.currency);

        // ── CEI: update state before external calls ──────────────────────
        inv.status    = InvoiceStatus.Paid;
        inv.payer     = msg.sender;
        inv.adiAmount = adiAmount;
        inv.rateUsed  = rate;
        inv.paidAt    = block.timestamp;

        buyerInvoices[msg.sender].push(invoiceId);

        // ── Pull ADI into escrow (this contract) ─────────────────────────
        adiToken.safeTransferFrom(msg.sender, address(this), adiAmount);

        // ── Mint shipment NFT for buyer ───────────────────────────────────
        uint256 tokenId = 0;
        if (address(shipmentNFT) != address(0)) {
            tokenId = shipmentNFT.mintShipment(
                invoiceId,
                inv.merchant,
                msg.sender,
                itemName,
                origin,
                destination
            );
            inv.shipmentTokenId = tokenId;
        }

        emit InvoicePaid(
            invoiceId,
            inv.merchant,
            msg.sender,
            inv.fiatAmountMinor,
            inv.currency,
            adiAmount,
            rate,
            tokenId
        );
    }

    // ── Delivery confirmation — releases escrow to seller ──────────────────

    /**
     * @notice Buyer confirms they received the package.
     *         Releases escrowed ADI to the merchant.
     */
    function confirmDelivery(uint256 invoiceId) external {
        Invoice storage inv = invoices[invoiceId];

        require(inv.payer == msg.sender,           "AdiInvoice: only buyer can confirm");
        require(inv.status == InvoiceStatus.Paid,  "AdiInvoice: not in escrow");

        inv.status = InvoiceStatus.Delivered;

        adiToken.safeTransfer(inv.merchant, inv.adiAmount);

        emit DeliveryConfirmed(invoiceId, inv.merchant, inv.adiAmount);
    }

    // ── Refund — buyer claims back after escrow period ─────────────────────

    /**
     * @notice Buyer claims a refund if package never arrived.
     *         Only callable after ESCROW_PERIOD (30 days) from payment.
     */
    function claimRefund(uint256 invoiceId) external {
        Invoice storage inv = invoices[invoiceId];

        require(inv.payer == msg.sender,          "AdiInvoice: only buyer can refund");
        require(inv.status == InvoiceStatus.Paid, "AdiInvoice: not in escrow");
        require(
            block.timestamp >= inv.paidAt + ESCROW_PERIOD,
            "AdiInvoice: escrow period not over"
        );

        inv.status = InvoiceStatus.Refunded;

        adiToken.safeTransfer(inv.payer, inv.adiAmount);

        emit RefundClaimed(invoiceId, inv.payer, inv.adiAmount);
    }

    // ── Cancel ─────────────────────────────────────────────────────────────

    function cancelInvoice(uint256 invoiceId) external {
        Invoice storage inv = invoices[invoiceId];
        require(inv.merchant == msg.sender,             "AdiInvoice: not merchant");
        require(inv.status == InvoiceStatus.Pending,    "AdiInvoice: not pending");
        inv.status = InvoiceStatus.Cancelled;
        emit InvoiceCancelled(invoiceId);
    }

    // ── Views ───────────────────────────────────────────────────────────────

    function getInvoice(uint256 invoiceId) external view returns (Invoice memory) {
        return invoices[invoiceId];
    }

    function getMerchantInvoices(address merchant) external view returns (uint256[] memory) {
        return merchantInvoices[merchant];
    }

    function getBuyerInvoices(address buyer) external view returns (uint256[] memory) {
        return buyerInvoices[buyer];
    }

    function quoteInvoice(uint256 invoiceId)
        external view
        returns (uint256 adiAmount, uint256 rate)
    {
        Invoice storage inv = invoices[invoiceId];
        require(inv.merchant != address(0), "AdiInvoice: invoice not found");
        rate      = oracle.getRate(inv.currency);
        adiAmount = oracle.getQuote(inv.fiatAmountMinor, inv.currency);
    }

    function canRefund(uint256 invoiceId) external view returns (bool) {
        Invoice storage inv = invoices[invoiceId];
        return (
            inv.status == InvoiceStatus.Paid &&
            block.timestamp >= inv.paidAt + ESCROW_PERIOD
        );
    }

    // ── Admin ───────────────────────────────────────────────────────────────

    function setOracle(address _oracle) external onlyOwner {
        oracle = OracleAdapter(_oracle);
    }

    function setShipmentNFT(address _shipmentNFT) external onlyOwner {
        shipmentNFT = ShipmentNFT(_shipmentNFT);
    }
}
