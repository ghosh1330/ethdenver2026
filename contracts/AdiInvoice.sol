// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./OracleAdapter.sol";

contract AdiInvoice is Ownable {
    using SafeERC20 for IERC20;

    enum InvoiceStatus { Pending, Paid, Expired, Cancelled }

    struct Invoice {
        address merchant;
        address payer;
        uint256 fiatAmountMinor;
        bytes32 currency;
        uint64  expiresAt;
        uint256 adiAmount;
        uint256 rateUsed;
        InvoiceStatus status;
    }

    OracleAdapter public oracle;
    IERC20        public adiToken;

    uint256 public nextInvoiceId = 1;
    mapping(uint256 => Invoice) public invoices;
    mapping(address => uint256[]) public merchantInvoices;

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
        uint256 rateUsed
    );

    event InvoiceCancelled(uint256 indexed invoiceId);

    constructor(address initialOwner, address _oracle, address _adiToken)
        Ownable(initialOwner)
    {
        oracle   = OracleAdapter(_oracle);
        adiToken = IERC20(_adiToken);
    }

    function createInvoice(
        address merchant,
        uint256 fiatAmountMinor,
        bytes32 currency,
        uint64  expiresAt
    ) external returns (uint256 invoiceId) {
        require(merchant != address(0), "AdiInvoice: zero merchant");
        require(fiatAmountMinor > 0,   "AdiInvoice: zero amount");
        // oracle.getQuote(fiatAmountMinor, currency);  ← ❌ REMOVED (BUG FIX)

        invoiceId = nextInvoiceId++;
        invoices[invoiceId] = Invoice({
            merchant:        merchant,
            payer:           address(0),
            fiatAmountMinor: fiatAmountMinor,
            currency:        currency,
            expiresAt:       expiresAt,
            adiAmount:       0,
            rateUsed:        0,
            status:          InvoiceStatus.Pending
        });
        merchantInvoices[merchant].push(invoiceId);

        emit InvoiceCreated(invoiceId, merchant, fiatAmountMinor, currency, expiresAt);
    }

    function payInvoice(uint256 invoiceId) external {
        Invoice storage inv = invoices[invoiceId];

        require(inv.merchant != address(0), "AdiInvoice: invoice not found");
        require(inv.status == InvoiceStatus.Pending, "AdiInvoice: invoice not pending");
        require(
            inv.expiresAt == 0 || block.timestamp <= inv.expiresAt,
            "AdiInvoice: invoice expired"
        );

        uint256 rate      = oracle.getRate(inv.currency);
        uint256 adiAmount = oracle.getQuote(inv.fiatAmountMinor, inv.currency);

        inv.status    = InvoiceStatus.Paid;
        inv.payer     = msg.sender;
        inv.adiAmount = adiAmount;
        inv.rateUsed  = rate;

        adiToken.safeTransferFrom(msg.sender, inv.merchant, adiAmount);

        emit InvoicePaid(
            invoiceId,
            inv.merchant,
            msg.sender,
            inv.fiatAmountMinor,
            inv.currency,
            adiAmount,
            rate
        );
    }

    function cancelInvoice(uint256 invoiceId) external {
        Invoice storage inv = invoices[invoiceId];
        require(inv.merchant == msg.sender, "AdiInvoice: not merchant");
        require(inv.status == InvoiceStatus.Pending, "AdiInvoice: not pending");
        inv.status = InvoiceStatus.Cancelled;
        emit InvoiceCancelled(invoiceId);
    }

    function getInvoice(uint256 invoiceId) external view returns (Invoice memory) {
        return invoices[invoiceId];
    }

    function getMerchantInvoices(address merchant) external view returns (uint256[] memory) {
        return merchantInvoices[merchant];
    }

    function quoteInvoice(uint256 invoiceId)
        external
        view
        returns (uint256 adiAmount, uint256 rate)
    {
        Invoice storage inv = invoices[invoiceId];
        require(inv.merchant != address(0), "AdiInvoice: invoice not found");
        rate      = oracle.getRate(inv.currency);
        adiAmount = oracle.getQuote(inv.fiatAmountMinor, inv.currency);
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = OracleAdapter(_oracle);
    }
}
