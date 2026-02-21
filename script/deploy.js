const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

function toRate(adiPerFiatUnit, minorUnitsPerUnit = 100) {
  const [whole, dec = ""] = String(adiPerFiatUnit).split(".");
  const PRECISION = 18;
  const decimals  = dec.padEnd(PRECISION, "0").slice(0, PRECISION);
  const numerator = BigInt(whole) * BigInt(10 ** PRECISION) + BigInt(decimals);
  return (numerator / BigInt(minorUnitsPerUnit)).toString();
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance: ", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. MockAdiToken
  let adiTokenAddress = process.env.ADI_TOKEN_ADDRESS;
  let mockToken;
  if (!adiTokenAddress) {
    console.log("ADI_TOKEN_ADDRESS not set – deploying MockAdiToken…");
    const MockAdi = await ethers.getContractFactory("MockAdiToken");
    mockToken = await MockAdi.deploy(deployer.address);
    await mockToken.waitForDeployment();
    adiTokenAddress = await mockToken.getAddress();
    console.log("MockAdiToken deployed:", adiTokenAddress);
  }

  // 2. OracleAdapter
  const OracleAdapter = await ethers.getContractFactory("OracleAdapter");
  const oracle = await OracleAdapter.deploy(deployer.address);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("OracleAdapter deployed:", oracleAddress);

  const usdRate = toRate("4.0", 100);
  const aedRate = toRate("1.09", 100);
  const USD = ethers.encodeBytes32String("USD");
  const AED = ethers.encodeBytes32String("AED");
  await (await oracle.setRate(USD, usdRate)).wait();
  console.log("Rate USD set:", usdRate);
  await (await oracle.setRate(AED, aedRate)).wait();
  console.log("Rate AED set:", aedRate);

  // 3. ShipmentNFT
  const ShipmentNFT = await ethers.getContractFactory("ShipmentNFT");
  const shipmentNFT = await ShipmentNFT.deploy(deployer.address);
  await shipmentNFT.waitForDeployment();
  const shipmentNFTAddress = await shipmentNFT.getAddress();
  console.log("ShipmentNFT deployed:", shipmentNFTAddress);

  // 4. AdiInvoice (now takes shipmentNFT address)
  const AdiInvoice = await ethers.getContractFactory("AdiInvoice");
  const invoice = await AdiInvoice.deploy(
    deployer.address,
    oracleAddress,
    adiTokenAddress,
    shipmentNFTAddress
  );
  await invoice.waitForDeployment();
  const invoiceAddress = await invoice.getAddress();
  console.log("AdiInvoice deployed:", invoiceAddress);

  // 5. Authorize AdiInvoice to mint ShipmentNFTs
  await (await shipmentNFT.setMinter(invoiceAddress)).wait();
  console.log("ShipmentNFT minter set to AdiInvoice ✅");

  // 6. Save deployments
  const deployment = {
    network:       (await ethers.provider.getNetwork()).name,
    deployedAt:    new Date().toISOString(),
    deployer:      deployer.address,
    MockAdiToken:  mockToken ? adiTokenAddress : null,
    AdiToken:      adiTokenAddress,
    OracleAdapter: oracleAddress,
    ShipmentNFT:   shipmentNFTAddress,
    AdiInvoice:    invoiceAddress,
    rates: { USD: usdRate, AED: aedRate },
  };

  const outPath = path.join(__dirname, "..", "deployments.json");
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2));
  console.log("\n✅ Deployment saved to deployments.json");
  console.log(JSON.stringify(deployment, null, 2));
}

main().catch((err) => { console.error(err); process.exit(1); });