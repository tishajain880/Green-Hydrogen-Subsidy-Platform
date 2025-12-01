const fs = require('fs');
const path = require('path');

const repoRootArtifacts = path.join(__dirname, '..', '..', '..', 'smart-contracts', 'artifacts', 'contracts');
const cwdArtifacts = path.join(process.cwd(), 'smart-contracts', 'artifacts', 'contracts');
const backendArtifacts = path.join(__dirname, '..', '..', 'smart-contracts', 'artifacts', 'contracts');

const paths = [repoRootArtifacts, cwdArtifacts, backendArtifacts];
console.log('Paths to check:');
paths.forEach(p => console.log(p));

for (const base of paths) {
  const p = path.join(base, 'SubsidyManager.sol', 'SubsidyManager.json');
  console.log('\nChecking', p);
  console.log('exists:', fs.existsSync(p));
  if (fs.existsSync(p)) {
    try {
      const raw = fs.readFileSync(p, 'utf8');
      JSON.parse(raw);
      console.log('parse: OK');
    } catch (err) {
      console.log('parse: ERROR ->', err.message);
    }
  }
}
