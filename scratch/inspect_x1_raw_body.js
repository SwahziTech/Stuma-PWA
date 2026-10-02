const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos1 = bundle.indexOf('L==="raw_materials"');
const pos2 = bundle.indexOf('L==="raw_materials"', pos1 + 1);
console.log('pos2:', pos2);
if (pos2 !== -1) {
  console.log(bundle.substring(pos2, pos2 + 4000));
}
