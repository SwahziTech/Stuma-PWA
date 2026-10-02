const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = bundle.indexOf('x1=({onNavigate');
const sub = bundle.substring(pos, pos + 30000);
// Find end of x1 (search for the closing of x1)
const nextComp = sub.indexOf('_1=');
console.log('Next component (_1) at:', nextComp);
console.log(sub.substring(nextComp - 3000, nextComp));
