const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const p = bundle.indexOf('b1=');
const returnIdx = bundle.indexOf('return o.jsxs("div"', p);
console.log('b1 return at:', returnIdx);
console.log(bundle.slice(returnIdx, returnIdx + 1500));
