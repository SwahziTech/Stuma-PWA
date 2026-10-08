const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const b1Idx = content.indexOf('b1=');
const w1Idx = content.indexOf('w1=');

console.log('b1 starts at:', b1Idx, 'w1 starts at:', w1Idx);
const salesCode = content.slice(b1Idx, w1Idx);
console.log('Sales code length:', salesCode.length);
console.log('Sales code head:', salesCode.slice(0, 1000));
