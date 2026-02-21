# ThreadHunt Pay — ADI Payments Component

> A Stripe-like payment stack for ADI Chain. Merchants price in USD or AED. Buyers pay in $ADI from anywhere in the world — no banks, no FX fees, no restrictions.

---

## What We Built

ThreadHunt Pay is a production-ready payment acceptance service for merchants on ADI Chain, built as part of a global secondhand fashion marketplace. It demonstrates the full merchant-to-buyer payment lifecycle entirely on-chain.

### Three Pillars

| Pillar | What it does |
|--------|-------------|
| **Global Payments** | Buyers in Nigeria, Brazil, Indonesia, Pakistan, ETC pay in ADI — no Visa/Mastercard restrictions |
| **NFT Package Tracking** | Every purchase mints a ShipmentNFT as a digital twin of the package, tracked on-chain |
| **Escrow Protection** | ADI held in smart contract until buyer confirms delivery. Auto-refund after 30 days |

---

## Architecture

```
contracts/
├── MockAdiToken.sol      ERC-20 test token (replace with real ADI on mainnet)
├── OracleAdapter.sol     Fiat → ADI rate conversion (USD, AED)
├── AdiInvoice.sol        Invoice creation, escrow, delivery confirmation, refunds
└── ShipmentNFT.sol       ERC-721 package tracking NFT

threadhunt-v2/            Next.js 14 frontend
├── src/app/
│   ├── page.tsx          Home / Discover
│   ├── product/[id]/     Product detail with Blockchain Protection card
│   ├── order/[id]/       Order summary + wallet connect + QR code
│   ├── track/[tokenId]/  Cosmic NFT tracking screen
│   ├── sell/             Seller onboarding
│   └── profile/          Buyer profile + purchase history
└── src/components/
    ├── QRCode.tsx        QR code for mobile wallet payments
    └── BottomNav.tsx     Navigation

cli.js                    Stripe-like merchant CLI
script/
├── deploy.js             Deploy all contracts
├── demo.js               End-to-end demo script
└── updateRates.js        Update fiat/ADI rates
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MetaMask browser extension

### 1. Clone and install

```bash
git clone <your-repo>
cd ethdenver2026
npm install
```

### 2. Start local blockchain

```bash
npx hardhat node
```

### 3. Deploy contracts (new terminal)

```bash
npx hardhat run script/deploy.js --network localhost
```

This deploys all 4 contracts and saves addresses to `deployments.json`.

### 4. Run the full demo

```bash
npx hardhat run script/demo.js --network localhost
```

Demonstrates: invoice creation → ADI escrow → NFT minting → tracking updates → delivery confirmation → escrow release.

### 5. Start the frontend (new terminal)

```bash
cd threadhunt-v2
npm install
cp .env.local.example .env.local
# Paste contract addresses from deployments.json into .env.local
npm run dev
```

Open **http://localhost:3000**

### 6. Configure MetaMask

- Network name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Import a test wallet using a private key from the hardhat node output

---

## Merchant CLI

A Stripe-like CLI for merchant onboarding and invoice management.

```bash
# Setup
node cli.js config --key 0xYOUR_PRIVATE_KEY

# Check status
node cli.js status

# Create an invoice
node cli.js invoice:create --merchant 0xf39F... --amount 85.00 --currency USD

# List all invoices
node cli.js invoice:list --merchant 0xf39F...

# Get live ADI quote for an invoice
node cli.js invoice:quote --id 1

# Check current rates
node cli.js rates

# Update rates (admin only)
node cli.js rates:set --currency USD --rate 4.0

# Update shipment tracking
node cli.js shipment:ship     --token 1
node cli.js shipment:transit  --token 1
node cli.js shipment:deliver  --token 1
```

---

## Smart Contracts

### AdiInvoice.sol

Core payment contract with escrow logic.

```solidity
// Create invoice (merchant sets price in fiat)
createInvoice(address merchant, uint256 fiatAmountMinor, bytes32 currency, uint64 expiresAt)

// Buyer pays — ADI held in escrow, ShipmentNFT minted
payInvoice(uint256 invoiceId, string itemName, string origin, string destination)

// Buyer confirms delivery — releases escrow to merchant
confirmDelivery(uint256 invoiceId)

// Buyer claims refund after 30 days if no delivery
claimRefund(uint256 invoiceId)

// Get live ADI quote for any invoice
quoteInvoice(uint256 invoiceId) → (uint256 adiAmount, uint256 rate)
```

**Invoice statuses:** `Pending` → `Paid` (escrow) → `Delivered` or `Refunded`

### OracleAdapter.sol

On-chain fiat-to-ADI conversion. Rates set by admin, fetched at time of payment.

```solidity
getRate(bytes32 currency) → uint256        // e.g. "USD" → ADI per cent
getQuote(uint256 fiatMinor, bytes32 currency) → uint256  // fiat amount → ADI wei
setRate(bytes32 currency, uint256 rate)    // admin only
```

**Current rates:** `1 USD = 4 ADI` | `1 AED = 1.09 ADI`

### ShipmentNFT.sol

ERC-721 NFT minted on every purchase. Acts as the digital twin of the physical package.

```solidity
// Minted automatically by AdiInvoice on payment
mintShipment(uint256 invoiceId, address seller, address buyer, string itemName, string origin, string destination)

// Seller advances tracking status on-chain
updateStatus(uint256 tokenId, ShipmentStatus newStatus)

// Status enum: Packed(0) → Shipped(1) → InTransit(2) → Delivered(3)
```

---

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Home — product grid with global payment banner |
| `/product/[id]` | Product detail — specs, Blockchain Protection card, Pay/Offer buttons |
| `/order/[id]` | Order summary — price breakdown, wallet connect OR QR code payment |
| `/track/[tokenId]` | NFT tracking — cosmic animation, status timeline, confirm delivery |
| `/sell` | Seller onboarding |
| `/profile` | Buyer profile — purchases, tracking buttons, XP |

---

## Payment Flow

```
Buyer selects item
       ↓
Order page loads live ADI quote from OracleAdapter
       ↓
Buyer connects MetaMask OR scans QR code
       ↓
AdiInvoice.createInvoice() ← merchant address + fiat amount
       ↓
Buyer approves ADI spend
       ↓
AdiInvoice.payInvoice() ← ADI pulled into escrow
       ↓
ShipmentNFT.mintShipment() ← NFT minted to buyer wallet
       ↓
Seller ships item, calls updateStatus() at each milestone
       ↓
Buyer confirms delivery → confirmDelivery() → escrow releases to merchant
       OR
30 days pass without confirmation → claimRefund() → ADI returned to buyer
```

---

## Why ADI Chain?

| Problem | Traditional | ThreadHunt Pay |
|---------|------------|----------------|
| Buyer in Nigeria wants to pay US merchant | Visa blocks transaction | Pay in ADI, no restrictions |
| FX conversion fees | 3–8% markup | Zero — priced in fiat, settled in ADI |
| "Did my package ship?" | Dependent on carrier APIs | On-chain NFT, always verifiable |
| Merchant gets paid before delivery | Buyer has no recourse | Escrow holds until confirmed |
| Payment dispute | Bank chargeback (weeks) | Smart contract auto-refund (instant) |

---

## Testnet Deployment

To deploy to ADI testnet, add to `.env`:

```
PRIVATE_KEY=0xYOUR_KEY
RPC_URL=https://rpc-testnet.adilabs.io
CHAIN_ID=1234
```

Then run:
```bash
npx hardhat run script/deploy.js --network adiTestnet
```

---

## Tech Stack

- **Smart contracts:** Solidity 0.8.20, Hardhat, OpenZeppelin
- **Frontend:** Next.js 14, TypeScript, ethers.js v6, Tailwind CSS
- **Fonts:** Playfair Display + Outfit
- **CLI:** Node.js, ethers.js v6

---

## License

MIT — open source, reusable across the ADI ecosystem.
