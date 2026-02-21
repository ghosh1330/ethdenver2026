const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer, merchantSigner, payerSigner] = await ethers.getSigners();

  const deplPath = path.join(__dirname, "..", "deployments.json");
  if (!fs.existsSync(deplPath)) throw new Error("deployments.json not found – run deploy.js first");
  const depl = JSON.parse(fs.readFileSync(deplPath, "utf8"));

  console.log("Loaded deployment:");
  console.log("  OracleAdapter:", depl.OracleAdapter);
  console.log("  ShipmentNFT: ", depl.ShipmentNFT);
  console.log("  AdiInvoice:  ", depl.AdiInvoice);
  console.log("  AdiToken:    ", depl.AdiToken);
  console.log();

  const oracle      = await ethers.getContractAt("OracleAdapter", depl.OracleAdapter);
  const invoice     = await ethers.getContractAt("AdiInvoice",    depl.AdiInvoice);
  const token       = await ethers.getContractAt("MockAdiToken",  depl.AdiToken);
  const shipmentNFT = await ethers.getContractAt("ShipmentNFT",   depl.ShipmentNFT);

  const merchant = merchantSigner ?? deployer;
  const payer    = payerSigner    ?? deployer;

  console.log("Merchant:", merchant.address);
  console.log("Payer:   ", payer.address);
  console.log();

  // Mint test ADI to payer
  const bal = await token.balanceOf(payer.address);
  if (bal === 0n) {
    await (await token.connect(deployer).mint(payer.address, ethers.parseEther("10000"))).wait();
    console.log("Minted 10,000 ADI to payer");
  }
  console.log("Payer balance (before):", ethers.formatEther(await token.balanceOf(payer.address)), "ADI");
  console.log("Merchant balance (before):", ethers.formatEther(await token.balanceOf(merchant.address)), "ADI\n");

  // ── Step 1: Create invoice ─────────────────────────────────────────────
  const CURRENCY   = ethers.encodeBytes32String("USD");
  const FIAT_MINOR = 8500n; // $85.00
  const EXPIRES_AT = 0n;

  console.log("Creating invoice: $85.00 USD for merchant", merchant.address);
  const createTx = await invoice.connect(deployer).createInvoice(
    merchant.address, FIAT_MINOR, CURRENCY, EXPIRES_AT
  );
  const createReceipt = await createTx.wait();
  const createdEvent = createReceipt.logs
    .map(log => { try { return invoice.interface.parseLog(log); } catch { return null; } })
    .find(e => e?.name === "InvoiceCreated");
  const invoiceId = createdEvent.args.invoiceId;
  console.log("✅ Invoice created! ID:", invoiceId.toString());
  console.log();

  // ── Step 2: Quote ──────────────────────────────────────────────────────
  const [adiAmount] = await invoice.quoteInvoice(invoiceId);
  console.log("ADI quote:", ethers.formatEther(adiAmount), "ADI for $85.00 USD\n");

  // ── Step 3: Approve + Pay (with shipment details) ──────────────────────
  console.log("Approving ADI spend…");
  await (await token.connect(payer).approve(depl.AdiInvoice, adiAmount)).wait();
  console.log("✅ Approved\n");

  console.log("Paying invoice — funds go into ESCROW, NFT will be minted…");
  const payTx = await invoice.connect(payer).payInvoice(
    invoiceId,
    "Vintage Denim Jacket",   // itemName
    "Tokyo, Japan",            // origin
    "New York, USA"            // destination
  );
  const payReceipt = await payTx.wait();

  const paidEvent = payReceipt.logs
    .map(log => { try { return invoice.interface.parseLog(log); } catch { return null; } })
    .find(e => e?.name === "InvoicePaid");
  const tokenId = paidEvent.args.shipmentTokenId;

  console.log("✅ Payment confirmed — ADI held in escrow");
  console.log("🎨 ShipmentNFT minted! Token ID:", tokenId.toString());
  console.log();

  // ── Step 4: Check NFT ─────────────────────────────────────────────────
  const shipment = await shipmentNFT.getShipment(tokenId);
  console.log("─────────────── ShipmentNFT ───────────────────");
  console.log("  Token ID:   ", tokenId.toString());
  console.log("  Item:       ", shipment.itemName);
  console.log("  Origin:     ", shipment.origin);
  console.log("  Destination:", shipment.destination);
  console.log("  Status:     ", await shipmentNFT.statusLabel(tokenId));
  console.log("  NFT Owner:  ", await shipmentNFT.ownerOf(tokenId));
  console.log("───────────────────────────────────────────────");
  console.log();

  // ── Step 5: Seller updates tracking ───────────────────────────────────
  console.log("Seller updates status → Shipped…");
  await (await shipmentNFT.connect(merchant).updateStatus(tokenId, 1)).wait();
  console.log("  Status:", await shipmentNFT.statusLabel(tokenId));

  console.log("Seller updates status → In Transit…");
  await (await shipmentNFT.connect(merchant).updateStatus(tokenId, 2)).wait();
  console.log("  Status:", await shipmentNFT.statusLabel(tokenId));
  console.log();

  // ── Step 6: Buyer confirms delivery → escrow released ─────────────────
  console.log("Buyer confirms delivery — releasing escrow to merchant…");
  await (await invoice.connect(payer).confirmDelivery(invoiceId)).wait();
  console.log("✅ Escrow released!");
  console.log();

  // ── Step 7: Final balances ─────────────────────────────────────────────
  console.log("Payer balance (after):   ", ethers.formatEther(await token.balanceOf(payer.address)), "ADI");
  console.log("Merchant balance (after):", ethers.formatEther(await token.balanceOf(merchant.address)), "ADI");
  console.log("Final NFT status:        ", await shipmentNFT.statusLabel(tokenId));
  console.log();
  console.log("🎉 Full demo complete! Escrow + NFT tracking working end-to-end.");
}

main().catch((err) => { console.error(err); process.exit(1); });