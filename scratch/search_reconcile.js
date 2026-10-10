const fs = require('fs');
const b = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const idx = b.indexOf('// 1. Reconcile Finished Goods Catalog');
console.log(b.slice(idx, idx + 1500));
