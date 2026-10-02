const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

let pos = 0;
while ((pos = bundle.indexOf('cementBags', pos + 1)) !== -1) {
  console.log('cementBags at:', pos);
  console.log(bundle.substring(Math.max(0, pos - 100), Math.min(bundle.length, pos + 250)));
}
