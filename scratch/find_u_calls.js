const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const prodIdx = code.indexOf('_1=({prefillItemId:s,onClearPr');
const prodCode = code.substring(prodIdx, prodIdx + 107000);

// Find where `u(` or `await u(` is called in prodCode
let pos = 0;
while (true) {
  const m = prodCode.indexOf('await u(', pos);
  if (m === -1) break;
  console.log(`\nProd await u( at relative ${m}:`);
  console.log(prodCode.substring(Math.max(0, m - 150), Math.min(prodCode.length, m + 400)).replace(/\n/g, ' '));
  pos = m + 8;
}

const salesIdx = code.indexOf('b1=({prefillItemId:s,onClearPr');
const salesCode = code.substring(salesIdx, salesIdx + 98000);
pos = 0;
while (true) {
  const m = salesCode.indexOf('await u(', pos);
  if (m === -1) break;
  console.log(`\nSales await u( at relative ${m}:`);
  console.log(salesCode.substring(Math.max(0, m - 150), Math.min(salesCode.length, m + 400)).replace(/\n/g, ' '));
  pos = m + 8;
}
