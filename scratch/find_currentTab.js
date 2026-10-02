const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Find where currentTab or o1 is used
const idx = bundle.indexOf('currentTab');
let pos = 0;
while ((pos = bundle.indexOf('currentTab', pos)) !== -1) {
  console.log('--- Pos:', pos, '---');
  console.log(bundle.substring(Math.max(0, pos - 100), Math.min(bundle.length, pos + 250)));
  pos += 10;
  if (pos > 500000) break;
}
