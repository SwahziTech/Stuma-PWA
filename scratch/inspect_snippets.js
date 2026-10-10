const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const cIdx = bundle.indexOf('Cement bags');
console.log('--- Cement input snippet in bundle ---');
console.log(bundle.slice(cIdx, cIdx + 500));

const bAddIdx = bundle.indexOf('setStagedBatches');
console.log('--- Batch add snippet in bundle ---');
console.log(bundle.slice(bAddIdx, bAddIdx + 300));
