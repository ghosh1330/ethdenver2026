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
  const [admin] = await ethers.getSigners();

  const deplPath = path.join(__dirname, "..", "deployments.json");
  const depl = JSON.parse(fs.readFileSync(deplPath, "utf8"));
  const oracle = await ethers.getContractAt("OracleAdapter", depl.OracleAdapter);

  const usdPerAdi = process.env.USD_RATE ?? "4.0";
  const aedPerAdi = process.env.AED_RATE ?? "1.09";

  const usdRate = toRate(usdPerAdi, 100);
  const aedRate = toRate(aedPerAdi, 100);

  const USD = ethers.encodeBytes32String("USD");
  const AED = ethers.encodeBytes32String("AED");

  console.log(`Updating rates as ${admin.address}…`);
  await (await oracle.setRate(USD, usdRate)).wait();
  console.log(`USD rate set: ${usdRate}`);
  await (await oracle.setRate(AED, aedRate)).wait();
  console.log(`AED rate set: ${aedRate}`);
  console.log("✅ Rates updated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});