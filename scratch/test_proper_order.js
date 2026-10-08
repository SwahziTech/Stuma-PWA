const fs = require('fs');

let prodCode = fs.readFileSync('scratch/current_prod_code.js', 'utf8').replace(/\r\n/g, '\n');

// 1. Replaces
const oldVtDestructure = 'const {items:a, movements:c, addMovementsBatch:u, staffName:d, adminSettings:f} = Vt();';
const newVtDestructure = 'const {items:a, movements:c, addMovementsBatch:u, staffName:d, adminSettings:f, totalFactoryMolds:totalMolds, todayMoldsInUse:moldsUsed, overallMoldUtilizationPct:moldsPct} = Vt();\n  const [prodTab, setProdTab] = B.useState("batch_logging");';
prodCode = prodCode.replace(oldVtDestructure, newVtDestructure);

const oldHeaderTitle = 'children: "Batch Production Logging"';
const newHeaderTitle = 'children: prodTab === "capacity_planner" ? "Production Capacity Planner" : "Batch Production Logging"';
prodCode = prodCode.replace(oldHeaderTitle, newHeaderTitle);

const oldHeaderBadge = 'children: "Adaptive Recipe Engine"';
const newHeaderBadge = 'children: prodTab === "capacity_planner" ? "Fleet & Mix Engine" : "Adaptive Recipe Engine"';
prodCode = prodCode.replace(oldHeaderBadge, newHeaderBadge);

const oldHeaderSub = 'children: "Dynamic proportional recipe scaling & multi-output residual calibration"';
const newHeaderSub = 'children: prodTab === "capacity_planner" ? "Simulate mold turnaround cycles, production limits & material demand" : "Dynamic proportional recipe scaling & multi-output residual calibration"';
prodCode = prodCode.replace(oldHeaderSub, newHeaderSub);

// 2. NOW compute datePickerIdx and datePickerEnd
const datePickerPattern = 'style: { background: "transparent", border: "none", color: "#f8fafc", fontFamily: "var(--font-mono)", fontSize: "13.5px", fontWeight: 600, outline: "none", cursor: "pointer" }\n              })\n            ]\n          })\n        ]\n      }),';

const datePickerIdx = prodCode.indexOf(datePickerPattern);
console.log('datePickerIdx after replaces:', datePickerIdx);
const datePickerEnd = datePickerIdx + datePickerPattern.length;

console.log('Snippet around datePickerEnd:');
console.log(prodCode.slice(datePickerEnd - 30, datePickerEnd + 50));
