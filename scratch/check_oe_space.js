const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const target = 'for (const D of u)';
console.log('Occurrences of target with space:', bundle.split(target).length - 1);
const idx = bundle.indexOf(target);
if (idx !== -1) {
  console.log(bundle.substring(idx - 20, idx + 100));
}
