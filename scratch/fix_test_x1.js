const fs = require('fs');

let x1Script = fs.readFileSync('scratch/build_new_x1.js', 'utf8');
x1Script = x1Script.replace(
  'try {\n  new vm.Script(newX1Code);',
  'try {\n  let testCode = "var DashboardSalesRecordView, x1; " + newX1Code.trim(); if (testCode.endsWith(",")) testCode = testCode.slice(0, -1); testCode += ";";\n  new vm.Script(testCode);'
);
fs.writeFileSync('scratch/build_new_x1.js', x1Script, 'utf8');
console.log('Fixed build_new_x1.js validation line');
