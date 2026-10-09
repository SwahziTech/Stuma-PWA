const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Find in Production (_1)
const prodIdx = code.indexOf('const res = await u(movementsToInsert);');
console.log('Production await u at:', prodIdx);
if (prodIdx !== -1) {
  console.log(code.substring(prodIdx - 100, prodIdx + 700));
}

// Find in Sales (b1)
const salesIdx = code.indexOf('const success = await u(movementsToInsert);');
console.log('\nSales await u at:', salesIdx);
if (salesIdx !== -1) {
  console.log(code.substring(salesIdx - 100, salesIdx + 700));
}
