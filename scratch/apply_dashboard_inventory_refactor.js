const fs = require('fs');
const vm = require('vm');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/index-hgjhj-0G.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

console.log('--- Applying Dashboard Finished Goods Inventory Refactor ---');

// 1. Update filter state in x1
const oldStateStr = '[k,A]=B.useState(!1),[L,W]=B.useState("inventory")';
const newStateStr = '[k,A]=B.useState("general"),[filterMenuOpen,setFilterMenuOpen]=B.useState(!1),[L,W]=B.useState("inventory")';

if (!bundle.includes(oldStateStr)) {
  console.log('Checking if state was already updated...');
  if (!bundle.includes(newStateStr)) {
    throw new Error('Could not find [k,A]=B.useState(!1) in bundle');
  }
} else {
  bundle = bundle.replace(oldStateStr, newStateStr);
  console.log('✓ Updated filter state [k,A] to "general" and added filterMenuOpen');
}

// 2. Add filteredOe and filteredG right after ue=...
const oldUeEnd = 'localeCompare(N.item.name)}),[t,E,b,k]),P=B.useMemo(';
const newUeEnd = 'localeCompare(N.item.name)}),[t,E,b,k]),filteredOe=B.useMemo(()=>oe.filter(T=>{const N=E==="All"||T.item.category===E,S=T.item.name.toLowerCase().includes(b.toLowerCase())||T.item.category.toLowerCase().includes(b.toLowerCase());return N&&S}),[oe,E,b]),filteredG=B.useMemo(()=>G.filter(T=>{const N=E==="All"||T.item.category===E,S=T.item.name.toLowerCase().includes(b.toLowerCase())||T.item.category.toLowerCase().includes(b.toLowerCase());return N&&S}),[G,E,b]),P=B.useMemo(';

if (bundle.includes(oldUeEnd)) {
  bundle = bundle.replace(oldUeEnd, newUeEnd);
  console.log('✓ Added filteredOe and filteredG useMemos to x1');
} else if (bundle.includes('filteredOe=B.useMemo')) {
  console.log('filteredOe already exists in bundle');
} else {
  throw new Error('Could not locate oldUeEnd pattern');
}

// Also adjust if(k) in ue.sort to if(k==="critical")
bundle = bundle.replace('sort((T,N)=>{if(k){if(T.is_low_stock&&!N.is_low_stock)', 'sort((T,N)=>{if(k==="critical"){if(T.is_low_stock&&!N.is_low_stock)');

// 3. Find boundaries of L==="inventory" in bundle
const x1Idx = bundle.indexOf('x1=(');
if (x1Idx === -1) throw new Error('x1=( not found');

const invPattern = 'L==="inventory"&&o.jsxs(o.Fragment,{children:[';
const invStartIdx = bundle.indexOf(invPattern, x1Idx);
if (invStartIdx === -1) throw new Error('L==="inventory" pattern not found');

// Find closing for L==="inventory"
let depthParen = 0, depthBrace = 0, depthBracket = 0;
let invEndIdx = -1;
const childStart = invStartIdx + invPattern.length;

for (let i = childStart; i < bundle.length; i++) {
  const c = bundle[i];
  if (c === '(') depthParen++;
  else if (c === ')') depthParen--;
  else if (c === '{') depthBrace++;
  else if (c === '}') depthBrace--;
  else if (c === '[') depthBracket++;
  else if (c === ']') depthBracket--;

  if (depthBracket === -1) {
    if (bundle.substr(i, 3) === ']})') {
      invEndIdx = i + 3;
      break;
    }
  }
}

if (invEndIdx === -1) throw new Error('Could not find closing of L==="inventory" block');
console.log('Found L==="inventory" from index', invStartIdx, 'to', invEndIdx);

// 4. Read the assembled inventory code
const assembledCode = fs.readFileSync(path.resolve(__dirname, 'assembled_inventory.js'), 'utf8');

// 5. Splice into bundle
bundle = bundle.slice(0, invStartIdx) + assembledCode + bundle.slice(invEndIdx);
console.log('✓ Spliced assembled inventory block into bundle');

// 6. Validate complete bundle syntax
try {
  new vm.Script(bundle);
  console.log('✓ Syntax validation PASSED: bundle is 100% valid JavaScript!');
} catch (err) {
  console.error('✗ Syntax validation FAILED:', err);
  process.exit(1);
}

// 7. Write to disk
fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log('✓ Written refactored bundle to assets/index-hgjhj-0G.js');

// 8. Run bump_cache.js
const { execSync } = require('child_process');
execSync('node scratch/bump_cache.js', { stdio: 'inherit' });
console.log('✓ Cache bumped and service worker updated successfully!');
