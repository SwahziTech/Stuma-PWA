const fs = require('fs');
const vm = require('vm');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== STARTING MASTER REFACTOR: DASHBOARD + PRODUCTION CAPACITY PLANNER ===');

const bundlePath = path.resolve(__dirname, '../assets/index-hgjhj-0G.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

// 1. Create safety backup
const backupPath = path.resolve(__dirname, 'backup_bundle_before_dashboard_capacity.js');
fs.writeFileSync(backupPath, bundle, 'utf8');
console.log('✓ Created safety backup at:', backupPath);

// 2. Read new components
const newX1 = fs.readFileSync(path.resolve(__dirname, 'assembled_new_x1.js'), 'utf8').trim();
const newProd = fs.readFileSync(path.resolve(__dirname, 'assembled_new_prod.js'), 'utf8').trim();

// 3. Find boundaries in bundle
const x1Start = bundle.indexOf('x1=({onNavigate:s})=>');
if (x1Start === -1) throw new Error('Could not find x1Start in bundle');

const _1Start = bundle.indexOf('_1=({prefillItemId:s,onClearPrefill:t,onSuccess:r})=>');
if (_1Start === -1) throw new Error('Could not find _1Start in bundle');

const b1Start = bundle.indexOf('b1=({prefillItemId:s,onClearPrefill:t,onSuccess:r})=>');
if (b1Start === -1) throw new Error('Could not find b1Start in bundle');

console.log('Original offsets: x1Start =', x1Start, '_1Start =', _1Start, 'b1Start =', b1Start);

// Let's ensure proper punctuation at the ends
let cleanNewX1 = newX1;
if (!cleanNewX1.endsWith(',')) cleanNewX1 += ',';

let cleanNewProd = newProd;
if (!cleanNewProd.endsWith(',')) cleanNewProd += ',';

// Splicing:
// From 0 to x1Start + cleanNewX1 + cleanNewProd + from b1Start to end!
const newBundle = bundle.slice(0, x1Start) + cleanNewX1 + '\n' + cleanNewProd + '\n' + bundle.slice(b1Start);

console.log('✓ Spliced new x1 and new _1 into bundle');
console.log('New bundle length:', newBundle.length, '(difference:', newBundle.length - bundle.length, 'bytes)');

// 4. Complete Syntax Validation
console.log('Validating full bundle syntax with node vm.Script...');
try {
  new vm.Script(newBundle);
  console.log('🎉 FULL BUNDLE SYNTAX VALIDATION PASSED (100% VALID JAVASCRIPT)!');
} catch (err) {
  console.error('❌ Syntax validation failed on new bundle:', err);
  process.exit(1);
}

// 5. Write to assets/index-hgjhj-0G.js
fs.writeFileSync(bundlePath, newBundle, 'utf8');
console.log('✓ Written refactored bundle to', bundlePath);

// 6. Bump cache in index.html & service-worker.js
console.log('Bumping cache...');
execSync('node scratch/bump_cache.js', { stdio: 'inherit' });
console.log('✓ Cache bumped successfully!');
console.log('=== ALL REFACTORING COMPLETED CLEANLY ===');
