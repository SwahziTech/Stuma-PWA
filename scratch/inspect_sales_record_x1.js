const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const p = bundle.indexOf('L==="sales_record"&&');
console.log('pos:', p);
if (p !== -1) {
  console.log(bundle.slice(p, p + 1000));
}
