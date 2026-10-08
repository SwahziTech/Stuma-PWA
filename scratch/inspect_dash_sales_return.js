const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const p = 613784;
const retPos = bundle.indexOf('return o.jsxs("div"', p);
console.log('retPos:', retPos);
console.log(bundle.slice(retPos, retPos + 1200));
