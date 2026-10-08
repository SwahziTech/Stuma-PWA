const fs = require('fs');

let x1Script = fs.readFileSync('scratch/build_new_x1.js', 'utf8');
x1Script = x1Script.replace('const DashboardSalesRecordView =', 'DashboardSalesRecordView =');
fs.writeFileSync('scratch/build_new_x1.js', x1Script, 'utf8');

let prodScript = fs.readFileSync('scratch/build_new_prod.js', 'utf8');
prodScript = prodScript.replace('const ProductionCapacityPlannerView =', 'ProductionCapacityPlannerView =');
fs.writeFileSync('scratch/build_new_prod.js', prodScript, 'utf8');

console.log('Updated build_new_x1.js and build_new_prod.js to remove const prefix');
