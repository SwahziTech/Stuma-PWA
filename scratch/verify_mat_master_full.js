const fs = require('fs');

const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Verify all 13 materials exist in the Fl definition
const expectedMaterials = [
  "cement",
  "mchanga_laini",
  "mchanga_mweupe",
  "mchanga_mnene",
  "dust",
  "chipping",
  "kokoto",
  "dawa",
  "rangi_red",
  "rangi_black",
  "mafuta",
  "steel_r6",
  "steel_10mm"
];

console.log('--- Verifying Fl definition ---');
expectedMaterials.forEach(key => {
  const hasKey = bundle.includes(`key:"${key}"`);
  console.log(`Material ${key}: ${hasKey ? 'FOUND' : 'MISSING'}`);
  if (!hasKey) process.exit(1);
});

// Verify RawMaterialMasterView is declared and called
console.log('--- Verifying RawMaterialMasterView ---');
console.log('RawMaterialMasterView definition:', bundle.includes('RawMaterialMasterView = ({ rawMaterials: materials'));
console.log('RawMaterialMasterView usage in x1:', bundle.includes('L==="raw_materials"&&o.jsx(RawMaterialMasterView'));

// Verify updateRawMaterialMaster is provided
console.log('--- Verifying updateRawMaterialMaster ---');
console.log('updateRawMaterialMaster definition:', bundle.includes('updateRawMaterialMaster=B.useCallback'));
console.log('updateRawMaterialMaster in provider:', bundle.includes('updateRawMaterialMaster:updateRawMaterialMaster'));

// Verify enhanced addRawMaterialStock
console.log('--- Verifying addRawMaterialStock ---');
console.log('addRawMaterialStock updated parameters:', bundle.includes('le=B.useCallback(async(V,J,ie,priceVal,totalCostVal,sourceVal,customDate)=>'));

// Verify syntax
console.log('--- Verifying bundle syntax ---');
require('child_process').execSync('node --check assets/index-hgjhj-0G.js');
console.log('✓ Syntax is 100% VALID!');
