const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const TestToken = await hre.ethers.getContractFactory("TestToken");
  const initialSupply = hre.ethers.utils.parseEther("1000000");
  const token = await TestToken.deploy(initialSupply);
  await token.deployed();
  console.log("TestToken deployed to:", token.address);

  const SubsidyManager = await hre.ethers.getContractFactory("SubsidyManager");
  const manager = await SubsidyManager.deploy();
  await manager.deployed();
  console.log("SubsidyManager deployed to:", manager.address);

  // Transfer some tokens to manager to allow releases
  const amountToFund = hre.ethers.utils.parseEther("500000");
  const tx = await token.transfer(manager.address, amountToFund);
  await tx.wait();
  console.log("Funded manager with tokens");

  // Save deployed addresses for backend to pick up
  const fs = require('fs');
  const deployments = {
    TestToken: token.address,
    SubsidyManager: manager.address
  };
  fs.writeFileSync('deployments.json', JSON.stringify(deployments, null, 2));
  console.log('Wrote deployments.json');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
