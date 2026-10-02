const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = bundle.indexOf('x1=({onNavigate');
console.log('Preceding 100 chars:');
console.log(bundle.substring(pos - 100, pos));
