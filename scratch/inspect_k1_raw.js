const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const k1Pos = bundle.indexOf('k1=()');
console.log('k1Pos:', k1Pos);

const sub = bundle.substring(k1Pos, k1Pos + 35000);
const rawIdx = sub.indexOf('Raw Material Ledger Logs');
console.log('rawIdx in k1:', rawIdx);
if (rawIdx !== -1) {
  console.log(sub.substring(rawIdx - 200, rawIdx + 2000));
}
