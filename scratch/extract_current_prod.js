const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const _1Idx = bundle.indexOf('_1=');
const b1Idx = bundle.indexOf('b1=');

const currentProd = bundle.slice(_1Idx, b1Idx);
fs.writeFileSync('scratch/current_prod_code.js', currentProd, 'utf8');
console.log('Saved current prod code, length:', currentProd.length);
