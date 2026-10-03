const fs = require('fs');
const vm = require('vm');

console.log('--- Removing the first 5 top cards from DASHBOARD TAB ---');

let bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const returnTarget = 'return o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"14px"},children:[';
const returnIdx = bundle.indexOf(returnTarget);
if (returnIdx === -1) {
  throw new Error('Could not find x1 returnTarget in bundle');
}

const targetStart = returnIdx + returnTarget.length;

const tabsTarget = 'o.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"6px",background:"var(--bg-surface-elevated)"';
const tabsIdx = bundle.indexOf(tabsTarget, targetStart);
if (tabsIdx === -1) {
  throw new Error('Could not find tabsTarget in bundle');
}

console.log('Removing characters between index', targetStart, 'and', tabsIdx);
console.log('Removed length:', tabsIdx - targetStart);

// Remove the slice
bundle = bundle.slice(0, targetStart) + bundle.slice(tabsIdx);

// Validate JS syntax
try {
  new vm.Script(bundle);
  console.log('✓ Syntax validation PASSED: bundle is 100% valid JavaScript');
} catch (err) {
  console.error('✗ Syntax Error:', err);
  process.exit(1);
}

// Write back to assets/index-hgjhj-0G.js
fs.writeFileSync('assets/index-hgjhj-0G.js', bundle, 'utf8');
console.log('✓ Successfully updated assets/index-hgjhj-0G.js');

// Bump cache
require('./bump_cache.js');
console.log('✓ Cache bumped successfully');
