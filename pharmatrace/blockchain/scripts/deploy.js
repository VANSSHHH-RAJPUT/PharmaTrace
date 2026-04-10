const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const PharmaTrace = await hre.ethers.getContractFactory("PharmaTrace");
  const pharmaTrace = await PharmaTrace.deploy();
  await pharmaTrace.waitForDeployment();

  const address = await pharmaTrace.getAddress();
  console.log("PharmaTrace deployed to:", address);
  console.log("Admin address:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});