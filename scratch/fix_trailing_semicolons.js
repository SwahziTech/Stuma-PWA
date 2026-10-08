const fs = require('fs');
const vm = require('vm');
const { execSync } = require('child_process');

console.log('Fixing trailing semicolons to commas in assets/index-hgjhj-0G.js...');

let bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// 1. Fix DashboardSalesRecordView ending before x1
const oldDashEnding = `          }, sale.id || (sale.batch_id + "_" + sale.item_id));\n        })\n      })\n    ]\n  });\n};\n\nx1=({onNavigate:s})=>{`;
const newDashEnding = `          }, sale.id || (sale.batch_id + "_" + sale.item_id));\n        })\n      })\n    ]\n  });\n},\n\nx1=({onNavigate:s})=>{`;

if (!bundle.includes(oldDashEnding)) {
  console.log('Searching for regex match for DashboardSalesRecordView ending...');
  bundle = bundle.replace(
    /(\n\s*\}\);\s*\}\s*;\s*\n+)(x1\s*=\s*\(\{onNavigate:s\}\)=>)/,
    '\n  });\n},\n\n$2'
  );
} else {
  bundle = bundle.replace(oldDashEnding, newDashEnding);
}

// 2. Fix ProductionCapacityPlannerView ending before _1
const oldPlannerEnding = `              }, item.id);\n            })\n          })\n        ]\n      })\n    ]\n  });\n};\n\n_1=({prefillItemId:s,onClearPrefill:t,onSuccess:r})=>{`;
const newPlannerEnding = `              }, item.id);\n            })\n          })\n        ]\n      })\n    ]\n  });\n},\n\n_1=({prefillItemId:s,onClearPrefill:t,onSuccess:r})=>{`;

if (!bundle.includes(oldPlannerEnding)) {
  console.log('Searching for regex match for ProductionCapacityPlannerView ending...');
  bundle = bundle.replace(
    /(\n\s*\}\);\s*\}\s*;\s*\n+)(_1\s*=\s*\(\{prefillItemId:s)/,
    '\n  });\n},\n\n$2'
  );
} else {
  bundle = bundle.replace(oldPlannerEnding, newPlannerEnding);
}

// Verify with vm.Script
try {
  new vm.Script(bundle);
  console.log('✓ vm.Script syntax validation PASSED!');
} catch (e) {
  console.error('✗ Syntax error:', e);
  process.exit(1);
}

fs.writeFileSync('assets/index-hgjhj-0G.js', bundle, 'utf8');
console.log('✓ Written fixed bundle to assets/index-hgjhj-0G.js');

execSync('node scratch/bump_cache.js', { stdio: 'inherit' });
console.log('✓ Cache bumped!');
