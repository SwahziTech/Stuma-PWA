const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const startMarker = 'L==="raw_materials"&&o.jsxs("div"';
const startIdx = bundle.indexOf(startMarker);
console.log('startIdx:', startIdx);

// Find where L==="inventory" starts right after L==="raw_materials"
const endMarker = 'L==="inventory"&&o.jsxs(o.Fragment';
const endIdx = bundle.indexOf(endMarker, startIdx);
console.log('endIdx:', endIdx);

if (startIdx !== -1 && endIdx !== -1) {
  console.log('Current L===raw_materials content:');
  console.log(bundle.substring(startIdx, endIdx));
}
