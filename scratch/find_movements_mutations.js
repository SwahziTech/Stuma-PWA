const fs = require('fs');
const b = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
let idx = 0;
while ((idx = b.indexOf('.from("movements")', idx)) !== -1) {
  console.log(b.slice(idx - 100, idx + 300));
  console.log('---');
  idx += 17;
}
