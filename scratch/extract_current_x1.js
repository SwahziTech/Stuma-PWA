const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Idx = bundle.indexOf('x1=');
const _1Idx = bundle.indexOf('_1=');

const currentX1 = bundle.slice(x1Idx, _1Idx);
fs.writeFileSync('scratch/current_x1_code.js', currentX1, 'utf8');
console.log('Saved current x1 code, length:', currentX1.length);
