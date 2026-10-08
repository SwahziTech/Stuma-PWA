const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = bundle.indexOf('Bv=');
const before = bundle.slice(pos - 3000, pos);

const regex = /const\s+([a-zA-Z0-9_$]+)\s*=\s*["']([^"']+)["']/g;
let m;
while ((m = regex.exec(before)) !== null) {
  console.log(m[1], '=', m[2]);
}

// search specifically for ec=
let p = 0;
while ((p = bundle.indexOf('ec=', p)) !== -1) {
  console.log('ec= at', p, ':', bundle.slice(p - 10, p + 50));
  p += 3;
}
