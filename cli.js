#!/usr/bin/env node
/**
 * ThreadHunt Pay — Merchant CLI
 * A Stripe-like CLI for ADI Chain payment management.
 *
 * Usage:
 *   node cli.js help
 *   node cli.js status
 *   node cli.js invoice:create --merchant 0x... --amount 85.00 --currency USD
 *   node cli.js invoice:get --id 1
 *   node cli.js invoice:list --merchant 0x...
 *   node cli.js rates
 *   node cli.js rates:set --currency USD --rate 4.0
 */

const { ethers } = require("ethers");
const fs   = require("fs");
const path = require("path");

// ── Config ──────────────────────────────────────────────────────────────────

const CONFIG_PATH = path.join(__dirname, ".threadhunt-cli.json");
const DEPL_PATH   = path.join(__dirname, "deployments.json");

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

function loadDeployment() {
  if (!fs.existsSync(DEPL_PATH)) {
    fatal("deployments.json not found. Run: npx hardhat run script/deploy.js --network localhost");
  }
  return JSON.parse(fs.readFileSync(DEPL_PATH, "utf8"));
}

// ── ABIs (minimal) ──────────────────────────────────────────────────────────

const INVOICE_ABI = [
  "function createInvoice(address merchant, uint256 fiatAmountMinor, bytes32 currency, uint64 expiresAt) returns (uint256)",
  "function payInvoice(uint256 invoiceId, string itemName, string origin, string destination)",
  "function confirmDelivery(uint256 invoiceId)",
  "function claimRefund(uint256 invoiceId)",
  "function quoteInvoice(uint256 invoiceId) view returns (uint256 adiAmount, uint256 rate)",
  "function getInvoice(uint256 invoiceId) view returns (tuple(address merchant, address payer, uint256 fiatAmountMinor, bytes32 currency, uint64 expiresAt, uint256 adiAmount, uint256 rateUsed, uint256 paidAt, uint256 shipmentTokenId, uint8 status))",
  "function getMerchantInvoices(address merchant) view returns (uint256[])",
];

const ORACLE_ABI = [
  "function getRate(bytes32 currency) view returns (uint256)",
  "function setRate(bytes32 currency, uint256 rate)",
];

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
];

const SHIPMENT_ABI = [
  "function getShipment(uint256 tokenId) view returns (tuple(uint256 invoiceId, address seller, address buyer, string itemName, string origin, string destination, uint8 status, uint256 mintedAt, uint256 deliveredAt))",
  "function statusLabel(uint256 tokenId) view returns (string)",
  "function updateStatus(uint256 tokenId, uint8 newStatus)",
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS = ["Pending", "Paid", "Delivered", "Refunded", "Cancelled"];
const COLORS = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  cyan:   "\x1b[36m",
  red:    "\x1b[31m",
  purple: "\x1b[35m",
  gray:   "\x1b[90m",
};

const c = (color, text) => `${COLORS[color]}${text}${COLORS.reset}`;
const fatal = (msg) => { console.error(c("red", "✗ " + msg)); process.exit(1); };
const ok    = (msg) => console.log(c("green", "✓ ") + msg);
const info  = (msg) => console.log(c("cyan",  "→ ") + msg);
const head  = (msg) => console.log("\n" + c("bold", c("purple", msg)));
const row   = (k, v) => console.log(`  ${c("gray", k.padEnd(18))} ${v}`);

function parseArgs(argv) {
  const args = {}; let cmd = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith("--")) { args[argv[i].slice(2)] = argv[i+1]; i++; }
    else if (!cmd) cmd = argv[i];
  }
  return { cmd, args };
}

function toRate(adiPerFiatUnit) {
  const [whole, dec = ""] = String(adiPerFiatUnit).split(".");
  const PRECISION = 18;
  const decimals  = dec.padEnd(PRECISION, "0").slice(0, PRECISION);
  const numerator = BigInt(whole) * BigInt(10 ** PRECISION) + BigInt(decimals);
  return (numerator / 100n).toString();
}

function decodeBytes32(b) {
  const hex = b.startsWith("0x") ? b.slice(2) : b;
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.slice(i, i + 2), 16);
    if (code === 0) break;
    str += String.fromCharCode(code);
  }
  return str;
}

async function getProvider() {
  const cfg = loadConfig();
  const rpc  = cfg.rpc || "http://127.0.0.1:8545";
  return new ethers.JsonRpcProvider(rpc);
}

async function getSigner() {
  const cfg = loadConfig();
  if (!cfg.privateKey) fatal("No private key configured. Run: node cli.js config --key YOUR_PRIVATE_KEY");
  const provider = await getProvider();
  return new ethers.Wallet(cfg.privateKey, provider);
}

// ── Commands ─────────────────────────────────────────────────────────────────

async function cmdHelp() {
  console.log(`
${c("bold", c("purple", "ThreadHunt Pay — Merchant CLI"))}
${c("gray", "Stripe-like CLI for ADI Chain payments")}

${c("bold", "SETUP")}
  node cli.js config --key <PRIVATE_KEY>       Set your wallet private key
  node cli.js config --rpc <RPC_URL>           Set RPC endpoint (default: localhost)
  node cli.js status                           Show connected wallet + balances

${c("bold", "INVOICES")}
  node cli.js invoice:create                   Create a new payment invoice
    --merchant <address>                       Merchant wallet address
    --amount   <fiat>                          Amount e.g. 85.00
    --currency <USD|AED>                       Fiat currency
  node cli.js invoice:get    --id <n>          Get invoice details
  node cli.js invoice:list   --merchant <addr> List all merchant invoices
  node cli.js invoice:quote  --id <n>          Get live ADI quote for invoice

${c("bold", "SHIPMENTS")}
  node cli.js shipment:get   --token <n>       Get NFT shipment details
  node cli.js shipment:ship  --token <n>       Update status → Shipped
  node cli.js shipment:transit --token <n>     Update status → In Transit
  node cli.js shipment:deliver --token <n>     Update status → Delivered

${c("bold", "RATES")}
  node cli.js rates                            Show current fiat→ADI rates
  node cli.js rates:set --currency USD --rate 4.0   Update rate (admin only)

${c("bold", "EXAMPLES")}
  node cli.js invoice:create --merchant 0xf39F... --amount 85.00 --currency USD
  node cli.js invoice:list   --merchant 0xf39F...
  node cli.js shipment:ship  --token 1
`);
}

async function cmdConfig({ key, rpc }) {
  const cfg = loadConfig();
  if (key) { cfg.privateKey = key; ok("Private key saved"); }
  if (rpc) { cfg.rpc = rpc; ok(`RPC set to ${rpc}`); }
  if (!key && !rpc) { row("privateKey", cfg.privateKey ? "***" + cfg.privateKey.slice(-6) : "not set"); row("rpc", cfg.rpc || "http://127.0.0.1:8545"); }
  saveConfig(cfg);
}

async function cmdStatus() {
  head("ThreadHunt Pay — Status");
  const depl = loadDeployment();
  const provider = await getProvider();
  const network  = await provider.getNetwork();
  row("Network",      depl.network);
  row("Chain ID",     network.chainId.toString());
  row("AdiInvoice",   depl.AdiInvoice);
  row("ShipmentNFT",  depl.ShipmentNFT);
  row("OracleAdapter",depl.OracleAdapter);
  row("AdiToken",     depl.AdiToken);

  const cfg = loadConfig();
  if (cfg.privateKey) {
    const signer  = await getSigner();
    const address = await signer.getAddress();
    const token   = new ethers.Contract(depl.AdiToken, ERC20_ABI, provider);
    const bal     = await token.balanceOf(address);
    console.log();
    row("Wallet",  address);
    row("ADI Balance", ethers.formatEther(bal) + " ADI");
  } else {
    console.log();
    info("No wallet configured. Run: node cli.js config --key YOUR_PRIVATE_KEY");
  }
}

async function cmdInvoiceCreate({ merchant, amount, currency }) {
  if (!merchant) fatal("--merchant required");
  if (!amount)   fatal("--amount required");
  if (!currency) fatal("--currency required (USD or AED)");

  currency = currency.toUpperCase();
  if (!["USD","AED"].includes(currency)) fatal("Currency must be USD or AED");

  const signer = await getSigner();
  const depl   = loadDeployment();
  const contract = new ethers.Contract(depl.AdiInvoice, INVOICE_ABI, signer);
  const curr32   = ethers.encodeBytes32String(currency);
  const minor    = BigInt(Math.round(parseFloat(amount) * 100));

  info(`Creating invoice: ${currency} ${amount} for ${merchant}`);
  const tx      = await contract.createInvoice(merchant, minor, curr32, 0);
  const receipt = await tx.wait();

  let invoiceId = "?";
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "InvoiceCreated") { invoiceId = parsed.args.invoiceId.toString(); break; }
    } catch {}
  }

  head("Invoice Created");
  row("Invoice ID", invoiceId);
  row("Merchant",   merchant);
  row("Amount",     `${currency} ${amount}`);
  row("Tx Hash",    tx.hash);
  console.log();
  ok(`Invoice #${invoiceId} ready. Share this ID with your customer.`);
}

async function cmdInvoiceGet({ id }) {
  if (!id) fatal("--id required");
  const provider = await getProvider();
  const depl     = loadDeployment();
  const contract = new ethers.Contract(depl.AdiInvoice, INVOICE_ABI, provider);
  const inv      = await contract.getInvoice(BigInt(id));
  const [adiAmount] = inv.status === 0n ? await contract.quoteInvoice(BigInt(id)) : [inv.adiAmount];

  head(`Invoice #${id}`);
  row("Status",     c(inv.status === 1n ? "green" : "yellow", STATUS[Number(inv.status)]));
  row("Merchant",   inv.merchant);
  row("Payer",      inv.payer === ethers.ZeroAddress ? "not paid yet" : inv.payer);
  row("Amount",     `${decodeBytes32(inv.currency)} ${(Number(inv.fiatAmountMinor)/100).toFixed(2)}`);
  row("ADI Amount", ethers.formatEther(adiAmount) + " ADI");
  if (inv.shipmentTokenId > 0n) row("Shipment NFT", "#" + inv.shipmentTokenId.toString());
}

async function cmdInvoiceList({ merchant }) {
  if (!merchant) fatal("--merchant required");
  const provider = await getProvider();
  const depl     = loadDeployment();
  const contract = new ethers.Contract(depl.AdiInvoice, INVOICE_ABI, provider);
  const ids      = await contract.getMerchantInvoices(merchant);

  if (ids.length === 0) { info("No invoices found for this merchant."); return; }

  head(`Invoices for ${merchant}`);
  for (const id of ids) {
    const inv = await contract.getInvoice(id);
    console.log(`  ${c("purple","#"+id.toString().padEnd(4))} ${STATUS[Number(inv.status)].padEnd(10)} ${decodeBytes32(inv.currency)} ${(Number(inv.fiatAmountMinor)/100).toFixed(2).padStart(8)}`);
  }
  console.log();
  info(`Total: ${ids.length} invoice(s)`);
}

async function cmdInvoiceQuote({ id }) {
  if (!id) fatal("--id required");
  const provider = await getProvider();
  const depl     = loadDeployment();
  const contract = new ethers.Contract(depl.AdiInvoice, INVOICE_ABI, provider);
  const [adiAmount, rate] = await contract.quoteInvoice(BigInt(id));
  head(`Quote for Invoice #${id}`);
  row("ADI Amount", ethers.formatEther(adiAmount) + " ADI");
  row("Rate",       rate.toString());
}

async function cmdRates() {
  const provider = await getProvider();
  const depl     = loadDeployment();
  const oracle   = new ethers.Contract(depl.OracleAdapter, ORACLE_ABI, provider);
  head("Current Fiat → ADI Rates");
  for (const currency of ["USD","AED"]) {
    const rate = await oracle.getRate(ethers.encodeBytes32String(currency));
    const adiPer1 = Number(rate) * 100 / 1e18;
    row(`1 ${currency} =`, `${adiPer1.toFixed(4)} ADI`);
  }
}

async function cmdRatesSet({ currency, rate }) {
  if (!currency) fatal("--currency required");
  if (!rate)     fatal("--rate required (ADI per 1 unit of fiat, e.g. 4.0 means $1 = 4 ADI)");
  const signer = await getSigner();
  const depl   = loadDeployment();
  const oracle = new ethers.Contract(depl.OracleAdapter, ORACLE_ABI, signer);
  const curr32 = ethers.encodeBytes32String(currency.toUpperCase());
  const rateWei = toRate(rate);
  await (await oracle.setRate(curr32, rateWei)).wait();
  ok(`Rate updated: 1 ${currency.toUpperCase()} = ${rate} ADI`);
}

async function cmdShipmentGet({ token }) {
  if (!token) fatal("--token required");
  const provider = await getProvider();
  const depl     = loadDeployment();
  const nft      = new ethers.Contract(depl.ShipmentNFT, SHIPMENT_ABI, provider);
  const s        = await nft.getShipment(BigInt(token));
  const label    = await nft.statusLabel(BigInt(token));
  head(`ShipmentNFT #${token}`);
  row("Status",      c("green", label));
  row("Item",        s.itemName);
  row("Origin",      s.origin);
  row("Destination", s.destination);
  row("Seller",      s.seller);
  row("Buyer",       s.buyer);
}

async function cmdShipmentUpdate(tokenId, newStatus, label) {
  const signer = await getSigner();
  const depl   = loadDeployment();
  const nft    = new ethers.Contract(depl.ShipmentNFT, SHIPMENT_ABI, signer);
  info(`Updating ShipmentNFT #${tokenId} → ${label}…`);
  await (await nft.updateStatus(BigInt(tokenId), newStatus)).wait();
  ok(`Status updated to: ${label}`);
}

// ── Router ───────────────────────────────────────────────────────────────────

async function main() {
  const { cmd, args } = parseArgs(process.argv);

  // Banner
  process.stdout.write(c("purple", c("bold", "⬡ ThreadHunt Pay CLI  ")));
  process.stdout.write(c("gray", "ADI Chain Payments\n"));

  switch (cmd) {
    case "help":            return cmdHelp();
    case "config":          return cmdConfig(args);
    case "status":          return cmdStatus();
    case "invoice:create":  return cmdInvoiceCreate(args);
    case "invoice:get":     return cmdInvoiceGet(args);
    case "invoice:list":    return cmdInvoiceList(args);
    case "invoice:quote":   return cmdInvoiceQuote(args);
    case "rates":           return cmdRates();
    case "rates:set":       return cmdRatesSet(args);
    case "shipment:get":    return cmdShipmentGet(args);
    case "shipment:ship":   return cmdShipmentUpdate(args.token, 1, "Shipped");
    case "shipment:transit":return cmdShipmentUpdate(args.token, 2, "In Transit");
    case "shipment:deliver":return cmdShipmentUpdate(args.token, 3, "Delivered");
    default:
      console.log(c("yellow", "Unknown command. Run: node cli.js help"));
  }
}

main().catch(e => fatal(e.message));
