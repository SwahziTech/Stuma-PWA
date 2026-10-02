const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Find x1 code
const pos = bundle.indexOf('x1=({onNavigate');
console.log('x1 index:', pos);
if (pos !== -1) {
  console.log(bundle.substring(pos, pos + 4000));
}
