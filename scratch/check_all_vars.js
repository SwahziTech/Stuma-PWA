const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Start = bundle.indexOf('x1=({onNavigate:s})=>');
const _1Start = bundle.indexOf('_1=({prefillItemId:s');

const identifiers = [
  'DashboardSalesRecordView',
  'ProductionCapacityPlannerView',
  'Ka', 'ii', 'o', 'B', 'qa', 'fc', 'lt', 'Pa', 'si', 'pc', 'Vt', 'Wl', 'ns'
];

for (const id of identifiers) {
  const def = bundle.indexOf(id + '=');
  const constDef = bundle.indexOf('const ' + id);
  const letDef = bundle.indexOf('let ' + id);
  const varDef = bundle.indexOf('var ' + id);
  const fnDef = bundle.indexOf('function ' + id);
  const minPos = [def, constDef, letDef, varDef, fnDef].filter(p => p !== -1);
  console.log(id, 'first seen at:', minPos.length ? Math.min(...minPos) : 'NOT FOUND');
}
