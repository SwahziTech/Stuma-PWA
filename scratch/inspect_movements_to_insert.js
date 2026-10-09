const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const prodIdx = code.indexOf('_1=({prefillItemId:s,onClearPr');
const prodCode = code.substring(prodIdx, prodIdx + 107000);

const salesIdx = code.indexOf('b1=({prefillItemId:s,onClearPr');
const salesCode = code.substring(salesIdx, salesIdx + 98000);

console.log('--- Production movementsToInsert object construction ---');
const prodSub = prodCode.substring(29137 - 1200, 29137 + 100);
console.log(prodSub);

console.log('\n--- Sales movementsToInsert object construction ---');
const salesSub = salesCode.substring(25118 - 1200, 25118 + 100);
console.log(salesSub);
