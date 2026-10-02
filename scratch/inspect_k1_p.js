const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const k1Pos = bundle.indexOf('k1=()');
const sub = bundle.substring(k1Pos, k1Pos + 8000);

const pIdx = sub.indexOf('P=B.useMemo');
console.log('P=B.useMemo in k1:', pIdx);
if (pIdx !== -1) {
  console.log(sub.substring(pIdx, pIdx + 1200));
}
