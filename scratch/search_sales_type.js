const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const b1Idx = content.indexOf('b1=');
const w1Idx = content.indexOf('w1=');
const salesCode = content.slice(b1Idx, w1Idx);

console.log('--- Search for type: in salesCode ---');
let pos = 0;
while ((pos = salesCode.indexOf('type:', pos)) !== -1) {
  console.log(salesCode.slice(pos - 20, pos + 80));
  pos += 5;
}
