const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = bundle.indexOf('Fl=');
console.log('Fl= index:', pos);
if (pos !== -1) {
  console.log(bundle.substring(pos - 100, pos + 2500));
}
