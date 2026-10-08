const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const idx = bundle.indexOf('DashboardSalesRecordView');
const before = bundle.slice(idx - 10000, idx);

// Search for 'const ', 'let ', 'var '
const lastConst = before.lastIndexOf('const ');
const lastLet = before.lastIndexOf('let ');
const lastVar = before.lastIndexOf('var ');

console.log('lastConst at:', lastConst);
console.log('lastLet at:', lastLet);
console.log('lastVar at:', lastVar);

const maxPos = Math.max(lastConst, lastLet, lastVar);
console.log('Declaration statement:', before.slice(maxPos, maxPos + 200));
