const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

let pos = bundle.indexOf('resetAllRawMaterialsToZero');
console.log('resetAllRawMaterialsToZero pos:', pos);
if (pos !== -1) {
  console.log('Snippet around resetAllRawMaterialsToZero:\n', bundle.slice(pos - 300, pos + 500));
}

// Let's also check the bottom navigation items or main views
const navIndex = bundle.indexOf('activeTab');
console.log('activeTab occurrences:');
let i = 0;
while ((i = bundle.indexOf('activeTab', i)) !== -1) {
  console.log(bundle.slice(Math.max(0, i - 100), Math.min(bundle.length, i + 150)));
  console.log('----------------');
  i += 9;
}
