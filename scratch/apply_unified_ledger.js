const fs = require('fs');
const vm = require('vm');

const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const k1Idx = bundle.indexOf('k1=');
const c1Idx = bundle.indexOf('C1=', k1Idx);

if (k1Idx === -1 || c1Idx === -1) {
  console.error('ERROR: Could not find k1 or C1 boundary in bundle!');
  process.exit(1);
}

console.log('k1 starts at:', k1Idx, 'and C1 starts at:', c1Idx);
console.log('Current k1 length:', c1Idx - k1Idx);

// Backup
fs.writeFileSync('scratch/bundle_backup_before_ledger_unified.js', bundle);
console.log('✓ Created backup in scratch/bundle_backup_before_ledger_unified.js');

let newK1 = fs.readFileSync('scratch/new_k1_code.txt', 'utf8').trim();
if (!newK1.endsWith(',')) {
  newK1 += ',';
}

const newBundle = bundle.slice(0, k1Idx) + newK1 + bundle.slice(c1Idx);

// Validate bundle syntax
try {
  // Check parsing
  new vm.Script(newBundle);
  console.log('✓ SUCCESS: Complete updated bundle syntax is valid JavaScript!');
} catch (err) {
  console.error('ERROR in bundle syntax:', err);
  process.exit(1);
}

// Write updated bundle
fs.writeFileSync('assets/index-hgjhj-0G.js', newBundle);
console.log('✓ Successfully written updated bundle to assets/index-hgjhj-0G.js');

// Bump cache in index.html
const indexHtml = fs.readFileSync('index.html', 'utf8');
const newTs = Date.now();
const updatedHtml = indexHtml.replace(/index-hgjhj-0G\.js\?v=\d+/, 'index-hgjhj-0G.js?v=' + newTs);
fs.writeFileSync('index.html', updatedHtml);
console.log('✓ Updated index.html cache bust with v=' + newTs);

// Bump cache in service-worker.js
const sw = fs.readFileSync('service-worker.js', 'utf8');
const updatedSw = sw.replace(/const CACHE_NAME = ['"][^'"]+['"]/, `const CACHE_NAME = 'stumarcot-v${newTs}'`);
fs.writeFileSync('service-worker.js', updatedSw);
console.log('✓ Updated service-worker.js cache with stumarcot-v' + newTs);
