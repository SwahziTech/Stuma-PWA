const fs = require('fs');
const x1Code = fs.readFileSync('scratch/current_x1_code.js', 'utf8');

const hIdx = x1Code.indexOf('H&&');
console.log('H&& pos:', hIdx);
if (hIdx !== -1) {
  console.log(x1Code.slice(hIdx - 50, hIdx + 200));
}
