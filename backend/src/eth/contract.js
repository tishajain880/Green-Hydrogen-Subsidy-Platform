const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Helper to interact with local Hardhat-deployed contracts. Expects a `deployments.json`
// written by smart-contracts/scripts/deploy.js in the working directory where Hardhat was run.

const deploymentsPath = path.join(__dirname, '..', '..', 'smart-contracts', 'deployments.json');

function loadDeployments() {
  // fall back to project root /smart-contracts/deployments.json
  let p1 = path.join(process.cwd(), 'smart-contracts', 'deployments.json');
  let p2 = deploymentsPath;
  if (fs.existsSync(p1)) return JSON.parse(fs.readFileSync(p1));
  if (fs.existsSync(p2)) return JSON.parse(fs.readFileSync(p2));
  throw new Error('deployments.json not found. Run smart-contracts deploy script.');
}

function getProvider() {
  // connect to local Hardhat node
  return new ethers.providers.JsonRpcProvider(process.env.ETH_PROVIDER || 'http://127.0.0.1:8545');
}

async function getContracts(signerOrProvider) {
  const deployments = loadDeployments();
  const provider = signerOrProvider || getProvider();
  const abiManager = require(path.join(__dirname, '..', '..', 'smart-contracts', 'artifacts', 'contracts', 'SubsidyManager.sol', 'SubsidyManager.json'));
  const abiToken = require(path.join(__dirname, '..', '..', 'smart-contracts', 'artifacts', 'contracts', 'TestToken.sol', 'TestToken.json'));
  const manager = new ethers.Contract(deployments.SubsidyManager, abiManager.abi, provider);
  const token = new ethers.Contract(deployments.TestToken, abiToken.abi, provider);
  return { manager, token };
}

async function markMilestoneComplete(projectId, index, signer) {
  const provider = getProvider();
  const wallet = signer || provider.getSigner();
  const contracts = await getContracts(wallet);
  const tx = await contracts.manager.connect(wallet).markMilestoneComplete(ethers.utils.formatBytes32String(projectId), index);
  const receipt = await tx.wait();
  return receipt;
}

async function createProjectOnChain(projectId, producerAddress, tokenAddress, totalSubsidy, signer) {
  const provider = getProvider();
  const wallet = signer || provider.getSigner();
  const contracts = await getContracts(wallet);
  const tx = await contracts.manager.connect(wallet).createProject(ethers.utils.formatBytes32String(projectId), producerAddress, tokenAddress, totalSubsidy);
  const receipt = await tx.wait();
  return receipt;
}

module.exports = {
  getProvider,
  getContracts,
  loadDeployments,
  markMilestoneComplete,
  createProjectOnChain
};
