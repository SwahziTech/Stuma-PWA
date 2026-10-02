const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = bundle.indexOf('localStorage.removeItem(Xl)');
console.log('Xl pos:', pos);
if (pos !== -1) {
  console.log(bundle.substring(pos - 400, pos + 200));
}
