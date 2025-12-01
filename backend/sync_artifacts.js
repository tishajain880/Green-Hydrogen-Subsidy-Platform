const fs = require('fs');
const path = require('path');

function findRepoRoot(startDir) {
  let cur = startDir;
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(cur, 'smart-contracts');
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return cur;
    const parent = path.resolve(cur, '..');
    if (parent === cur) break;
    cur = parent;
  }
  return null;
}

const start = __dirname; // backend folder
const repoRoot = findRepoRoot(start);
if (!repoRoot) {
  console.error('Could not find repo root containing smart-contracts from', start);
  process.exit(2);
}

const artifacts = [
  ['SubsidyManager.sol', 'SubsidyManager.json'],
  ['TestToken.sol', 'TestToken.json'],
];

for (const [dir, file] of artifacts) {
  const src = path.join(repoRoot, 'smart-contracts', 'artifacts', 'contracts', dir, file);
  const destDir = path.join(__dirname, 'smart-contracts', 'artifacts', 'contracts', dir);
  const dest = path.join(destDir, file);
  try {
    if (!fs.existsSync(src)) {
      console.error('Source not found:', src);
      continue;
    }
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
    console.log('Copied', src, '->', dest);
  } catch (err) {
    console.error('Failed to copy', src, '->', dest, err.message);
  }
}
