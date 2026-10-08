const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Idx = content.indexOf('x1=');
const _1Idx = content.indexOf('_1=');

const x1Code = content.slice(x1Idx, _1Idx);

// Find where the top buttons / header are in x1
const gridStart = x1Code.indexOf('gridTemplateColumns:"repeat(3, 1fr)"');
console.log('gridStart:', gridStart);
if (gridStart !== -1) {
  console.log(x1Code.slice(gridStart - 50, gridStart + 1500));
}
