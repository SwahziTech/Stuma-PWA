const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Find Production tab submit logic
// In _1 (Production tab), what function is called when submitting production?
const prodIdx = code.indexOf('_1=({prefillItemId:s,onClearPr');
const prodCode = code.substring(prodIdx, prodIdx + 107000);

console.log('--- Production submit search ---');
const subMatches = prodCode.match(/(?:handleSubmit|handleLogProduction|addMovement|addMovementsBatch)[^;{}]*/g) || [];
console.log('Production matches:', subMatches.slice(0, 20));

// Let's search for addMovement or addMovementsBatch inside _1
let pos = 0;
while (true) {
  const m = prodCode.indexOf('addMovement', pos);
  if (m === -1) break;
  console.log(`\naddMovement at relative ${m}:`);
  console.log(prodCode.substring(Math.max(0, m - 100), Math.min(prodCode.length, m + 300)).replace(/\n/g, ' '));
  pos = m + 11;
}

// In b1 (Sales tab), what function is called when submitting sales?
const salesIdx = code.indexOf('b1=({prefillItemId:s,onClearPr');
const salesCode = code.substring(salesIdx, salesIdx + 98000);
pos = 0;
while (true) {
  const m = salesCode.indexOf('addMovement', pos);
  if (m === -1) break;
  console.log(`\nSales addMovement at relative ${m}:`);
  console.log(salesCode.substring(Math.max(0, m - 100), Math.min(salesCode.length, m + 300)).replace(/\n/g, ' '));
  pos = m + 11;
}
