const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = bundle.indexOf('x1=({onNavigate');
const sub = bundle.substring(pos, pos + 25000);
const hIdx = sub.indexOf('H&&');
console.log('H&& idx:', hIdx);
if (hIdx !== -1) {
  console.log(sub.substring(hIdx, hIdx + 3000));
}
