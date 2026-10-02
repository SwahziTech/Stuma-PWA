const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = bundle.indexOf('Pa=');
console.log('Pa= pos:', pos);
if (pos !== -1) {
  console.log(bundle.substring(pos, pos + 2500));
}
