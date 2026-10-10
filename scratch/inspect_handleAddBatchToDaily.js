const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const idx = bundle.indexOf('handleAddBatchToDaily =');
console.log('--- handleAddBatchToDaily snippet in bundle ---');
console.log(bundle.slice(idx, idx + 2500));
