const fs = require('fs');
const vm = require('vm');

const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

console.log('Testing bundle refactoring logic...');

// Verify that bundle is initially valid JS
try {
  new vm.Script(bundle);
  console.log('✓ Initial bundle syntax is 100% valid');
} catch (e) {
  console.error('✗ Initial bundle syntax error:', e);
  process.exit(1);
}
