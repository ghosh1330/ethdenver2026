const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer, merchantSigner, payerSigner] = await ethers.getSigners();

  const deplPath = path.join(__dirname, "..", "deployments.json");
  if (!fs.existsSync(deplPath)) {
    throw new Error("deployments.json not found – run deploy.js first");
  }
  const depl = JSON.parse(fs.readFileSync(deplPath, "utf8"));
  console.log("Loaded deployment:");
  console.log("  OracleAdapter:", depl.OracleAdapter);
  console.log("  AdiInvoice:  ", depl.AdiInvoice);
  console.log("  AdiToken:    ", depl.AdiToken);
  console.log();

  const oracle  = await ethers.getContractAt("OracleAdapter", depl.OracleAdapter);
  const invoice = await ethers.getContractAt("AdiInvoice",    depl.AdiInvoice);
  const token   = await ethers.getContractAt("MockAdiToken",  depl.AdiToken);

  const merchant = merchantSigner ?? deployer;
  const payer    = payerSigner    ?? deployer;

  console.log("Deployer: ", deployer.address);
  console.log("Merchant: ", merchant.address);
  console.log("Payer:    ", payer.address);
  console.log();

  const payerBalance = await token.balanceOf(payer.address);
  if (payerBalance === 0n) {
    console.log("Minting 10,000 ADI to payer…");
    await (await token.connect(deployer).mint(payer.address, ethers.parseEther("10000"))).wait();
  }

  console.log("Payer ADI balance (before):", ethers.formatEther(await token.balanceOf(payer.address)));
  console.log("Merchant ADI balance (before):", ethers.formatEther(await token.balanceOf(merchant.address)));
  console.log();

  const CURRENCY   = ethers.encodeBytes32String("USD");
  const FIAT_MINOR = 999n;
  const EXPIRES_AT = 0n;

  console.log(`Creating invoice: $${Number(FIAT_MINOR) / 100} USD for merchant ${merchant.address}`);
  const createTx = await invoice.connect(deployer).createInvoice(
    merchant.address,
    FIAT_MINOR,
    CURRENCY,
    EXPIRES_AT
  );
  const createReceipt = await createTx.wait();

  const createdEvent = createReceipt.logs
    .map((log) => { try { return invoice.interface.parseLog(log); } catch { return null; } })
    .find((e) => e?.name === "InvoiceCreated");

  const invoiceId = createdEvent.args.invoiceId;
  console.log("✅ Invoice created! ID:", invoiceId.toString());
  console.log("   Tx:", createTx.hash);
  console.log();

  const [adiAmount, rate] = await invoice.quoteInvoice(invoiceId);
  console.log("ADI quote:");
  console.log("  Fiat amount: $" + (Number(FIAT_MINOR) / 100).toFixed(2) + " USD");
  console.log("  ADI amount: ", ethers.formatEther(adiAmount), "ADI");
  console.log("  Rate used:  ", rate.toString());
  console.log();

  console.log("Approving", ethers.formatEther(adiAmount), "ADI…");
  const approveTx = await token.connect(payer).approve(depl.AdiInvoice, adiAmount);
  await approveTx.wait();
  console.log("✅ Approval tx:", approveTx.hash);
  console.log();

  console.log("Paying invoice", invoiceId.toString(), "…");
  const payTx = await invoice.connect(payer).payInvoice(invoiceId);
  const payReceipt = await payTx.wait();
  console.log("✅ Payment tx:", payTx.hash);

  const paidEvent = payReceipt.logs
    .map((log) => { try { return invoice.interface.parseLog(log); } catch { return null; } })
    .find((e) => e?.name === "InvoicePaid");

  const ev = paidEvent.args;
  console.log();
  console.log("─────────────── InvoicePaid Event ───────────────");
  console.log("  invoiceId: ", ev.invoiceId.toString());
  console.log("  merchant:  ", ev.merchant);
  console.log("  payer:     ", ev.payer);
  console.log("  fiatAmount:", ev.fiatAmount.toString(), "cents");
  console.log("  currency:  ", ethers.decodeBytes32String(ev.currency));
  console.log("  adiAmount: ", ethers.formatEther(ev.adiAmount), "ADI");
  console.log("  rateUsed:  ", ev.rateUsed.toString());
  console.log("─────────────────────────────────────────────────");
  console.log();

  console.log("Payer ADI balance (after):   ", ethers.formatEther(await token.balanceOf(payer.address)));
  console.log("Merchant ADI balance (after):", ethers.formatEther(await token.balanceOf(merchant.address)));

  const inv = await invoice.getInvoice(invoiceId);
  console.log();
  console.log("Invoice status:", inv.status === 1n ? "PAID ✅" : `UNKNOWN (${inv.status})`);
  console.log();
  console.log("🎉 Demo complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});