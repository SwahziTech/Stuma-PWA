const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = bundle.indexOf('L==="raw_materials"');
console.log('L==="raw_materials" index:', pos);
if (pos !== -1) {
  console.log(bundle.substring(pos, pos + 4000));
}
