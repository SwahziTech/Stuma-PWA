const fs = require('fs');
const vm = require('vm');

let content = fs.readFileSync('scratch/assembled_new_x1.js', 'utf8').trim();
if (content.endsWith(',')) content = content.slice(0, -1);

try {
  new vm.Script('var x1; ' + content + ';');
  console.log('✓ Validated new x1 component: 100% SUCCESS!');
} catch (e) {
  console.error('Validation error:', e);
}
