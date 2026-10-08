const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const buildProd = fs.readFileSync('scratch/build_prod_code.js', 'utf8');

const _1Idx = bundle.indexOf('_1=');
const b1Idx = bundle.indexOf('b1=');

console.log('Bundle _1 length:', b1Idx - _1Idx);
console.log('buildProd length:', buildProd.length);

// Check if buildProd has the exact component
const compStart = buildProd.indexOf('_1=');
const compCode = buildProd.slice(compStart).trim();
console.log('compCode length:', compCode.length);
console.log('Matches bundle:', bundle.slice(_1Idx, b1Idx).trim() === compCode);
