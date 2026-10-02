const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const startMarker = 'RawMaterialMasterView = ({ rawMaterials: materials';
const startIdx = bundle.indexOf(startMarker);
const endMarker = 'x1=({onNavigate:s})=>';
const endIdx = bundle.indexOf(endMarker, startIdx);

console.log('startIdx:', startIdx);
console.log('endIdx:', endIdx);

if (startIdx !== -1 && endIdx !== -1) {
  console.log('Found RawMaterialMasterView between', startIdx, 'and', endIdx);
}
