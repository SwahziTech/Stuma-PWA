const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const m1 = bundle.match(/Xl\s*=\s*["'][^"']+["']/);
const m2 = bundle.match(/Zl\s*=\s*["'][^"']+["']/);
console.log('Xl:', m1 ? m1[0] : 'not found');
console.log('Zl:', m2 ? m2[0] : 'not found');
