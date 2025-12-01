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
  // Support ethers v6 and v5 API shapes
  if (ethers.JsonRpcProvider) {
    return new ethers.JsonRpcProvider(process.env.ETH_PROVIDER || 'http://127.0.0.1:8545');
  }
  return new ethers.providers.JsonRpcProvider(process.env.ETH_PROVIDER || 'http://127.0.0.1:8545');
}

async function getContracts(signerOrProvider) {
  const deployments = loadDeployments();
  const provider = getProvider();
  const runner = signerOrProvider || provider;
  // Prefer artifacts located at the project root `smart-contracts/artifacts` (common workspace layout).
  // Fall back to backend/smart-contracts if present (older layout).
  // Prefer the repo root `smart-contracts/artifacts` first (this is where Hardhat writes by default).
  // Next prefer process.cwd() layout, then the backend-copied layout.
  const repoRootArtifacts = path.join(__dirname, '..', '..', '..', 'smart-contracts', 'artifacts', 'contracts');
  const cwdArtifacts = path.join(process.cwd(), 'smart-contracts', 'artifacts', 'contracts');
  const backendArtifacts = path.join(__dirname, '..', '..', 'smart-contracts', 'artifacts', 'contracts');
  const artifactPaths = [repoRootArtifacts, cwdArtifacts, backendArtifacts];

  function loadAbi(contractPathSegments) {
    const tried = [];
    for (const base of artifactPaths) {
      const p = path.join(base, ...contractPathSegments);
      tried.push(p);
      if (fs.existsSync(p)) {
        try {
          const raw = fs.readFileSync(p, 'utf8');
          return JSON.parse(raw);
        } catch (err) {
          throw new Error(`Failed to read/parse artifact at ${p}: ${err.message}`);
        }
      }
    }
    throw new Error(`Could not find contract artifact. Tried paths:\n${tried.join('\n')}`);
  }

  const abiManager = loadAbi(['SubsidyManager.sol', 'SubsidyManager.json']);
  const abiToken = loadAbi(['TestToken.sol', 'TestToken.json']);
  const manager = new ethers.Contract(deployments.SubsidyManager, abiManager.abi, runner);
  const token = new ethers.Contract(deployments.TestToken, abiToken.abi, runner);
  return { manager, token };
}

function formatBytes32StringSafe(str) {
  // Produce a canonical bytes32 hex string (0x-prefixed) from a JS string.
  // Avoid relying on ethers utils shape (v5 vs v6). Use Buffer which is available in Node.
  const s = String(str || '');
  const buf = Buffer.alloc(32);
  const src = Buffer.from(s, 'utf8');
  if (src.length > 32) throw new Error('Value too long for bytes32');
  src.copy(buf, 0, 0, src.length);
  return '0x' + buf.toString('hex');
}

async function markMilestoneComplete(projectId, index, signer) {
  const provider = getProvider();
  const wallet = signer || (process.env.DEPLOYER_PRIVATE_KEY ? new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider) : (provider.getSigner ? provider.getSigner() : null));
  if (!wallet) throw new Error('No signer available to send transaction. Set DEPLOYER_PRIVATE_KEY in server env.');
  const contracts = await getContracts(wallet);
  try {
    console.log('[eth/contract] markMilestoneComplete using address', wallet.address || wallet._address || '(unknown)');
  } catch (e) {}
  const projectIdBytes = formatBytes32StringSafe(projectId);
  const tx = await contracts.manager.markMilestoneComplete(projectIdBytes, index);
  const receipt = await tx.wait();
  return receipt;
}

async function createProjectOnChain(projectId, producerAddress, tokenAddress, totalSubsidy, signer) {
  const provider = getProvider();
  const wallet = signer || (process.env.DEPLOYER_PRIVATE_KEY ? new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider) : (provider.getSigner ? provider.getSigner() : null));
  if (!wallet) throw new Error('No signer available to send transaction. Set DEPLOYER_PRIVATE_KEY in server env.');
  const contracts = await getContracts(wallet);
  try {
    console.log('[eth/contract] createProjectOnChain using address', wallet.address || wallet._address || '(unknown)');
  } catch (e) {}
  // support ethers v6 (formatBytes32String at top-level) and v5 (utils.formatBytes32String)
  // Ensure project id is encoded as bytes32 hex string regardless of ethers version
  const projectIdBytes = formatBytes32StringSafe(projectId);
  const tx = await contracts.manager.createProject(projectIdBytes, producerAddress, tokenAddress, totalSubsidy);
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
