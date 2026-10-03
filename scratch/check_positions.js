const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

console.log('AppProvider le index:', content.indexOf('le=B.useCallback(async(V,J,ie,priceVal'));
console.log('RawMaterialMasterView index:', content.indexOf('RawMaterialMasterView = ({ rawMaterials: materials'));
console.log('handleSaveFullBaseline index:', content.indexOf('const handleSaveFullBaseline = async (e) => {'));
console.log('x1 RawMaterialMasterView invocation:', content.indexOf('RawMaterialMasterView,{rawMaterials:f'));
console.log('k1 start index:', content.indexOf('k1=()=>{'));
console.log('Raw Materials list in k1:', content.indexOf("d === 'raw_materials' && o.jsxs('div'") !== -1 ? 'found' : content.indexOf('d === "raw_materials" && o.jsxs("div"'));
