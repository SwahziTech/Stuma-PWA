const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Check all occurrences of `type:` in movements creation
const typeRegex = /type:\s*['"`]([a-zA-Z0-9_-]+)['"`]/g;
const typesFound = new Set();
let m;
while ((m = typeRegex.exec(code)) !== null) {
  typesFound.add(m[1]);
}
console.log('All `type:` values found in bundle:', Array.from(typesFound));

// Check sales movements creation specifically
const salesIdx = code.indexOf('b1=({prefillItemId:s,onClearPr');
const salesCode = code.substring(salesIdx, salesIdx + 98000);
const salesTypes = new Set();
while ((m = typeRegex.exec(salesCode)) !== null) {
  salesTypes.add(m[1]);
}
console.log('Types in Sales module:', Array.from(salesTypes));

// Check production movements creation specifically
const prodIdx = code.indexOf('_1=({prefillItemId:s,onClearPr');
const prodCode = code.substring(prodIdx, prodIdx + 107000);
const prodTypes = new Set();
while ((m = typeRegex.exec(prodCode)) !== null) {
  prodTypes.add(m[1]);
}
console.log('Types in Production module:', Array.from(prodTypes));

// Check baseline / opening balance movements creation specifically
const baseIdx = code.indexOf(',w1=()=>');
const baseCode = code.substring(baseIdx, baseIdx + 15000);
const baseTypes = new Set();
while ((m = typeRegex.exec(baseCode)) !== null) {
  baseTypes.add(m[1]);
}
console.log('Types in Baseline module:', Array.from(baseTypes));
