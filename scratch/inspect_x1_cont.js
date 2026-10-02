const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = bundle.indexOf('x1=({onNavigate');
console.log(bundle.substring(pos + 4000, pos + 10000));
