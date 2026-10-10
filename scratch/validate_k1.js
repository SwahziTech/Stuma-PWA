const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('scratch/new_k1_code.txt', 'utf8');
try {
  let testCode = code.trim();
  if (testCode.endsWith(',')) testCode = testCode.slice(0, -1) + ';';
  new vm.Script('let k1;\n' + testCode.replace(/Vt\(\)/g, '({movements:[],items:[],staffName:"",rawMaterialMovements:[],rawMaterials:[]})'));
  console.log('✓ SUCCESS: new_k1_code.txt syntax is 100% valid JavaScript!');
} catch (err) {
  console.error('SYNTAX ERROR:', err);
}
