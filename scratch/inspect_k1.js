const fs = require('fs');
const b = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const k1 = b.slice(b.indexOf('k1=()'), b.indexOf('C1=()'));
const dispatchIdx = k1.indexOf('Dispatch / Adjust');
console.log('Dispatch index:', dispatchIdx);
if (dispatchIdx !== -1) {
  console.log(k1.slice(dispatchIdx - 300, dispatchIdx + 200));
}
