const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const PharmaTrace = await hre.ethers.getContractFactory("PharmaTrace");
  const contract = await PharmaTrace.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("PharmaTrace deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});