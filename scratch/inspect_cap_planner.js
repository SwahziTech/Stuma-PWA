const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const startIdx = content.indexOf('L==="capacity_planner"&&');
console.log('startIdx:', startIdx);
if (startIdx !== -1) {
  console.log(content.slice(startIdx, startIdx + 3000));
}
