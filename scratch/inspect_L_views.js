const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Idx = content.indexOf('x1=');
const _1Idx = content.indexOf('_1=');
const x1Code = content.slice(x1Idx, _1Idx);

console.log('--- Search for L=== in x1Code ---');
let pos = 0;
while ((pos = x1Code.indexOf('L===', pos)) !== -1) {
  console.log('Found L=== at', pos);
  console.log(x1Code.slice(pos, pos + 120));
  pos += 4;
}
