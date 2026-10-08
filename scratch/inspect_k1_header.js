const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const p = bundle.indexOf('k1=');
const returnIdx = bundle.indexOf('return ', p + 500);
console.log('k1 return snippet:');
console.log(bundle.slice(returnIdx, returnIdx + 1500));
