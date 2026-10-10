const fs = require('fs');
const b = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const defMatsIdx = b.indexOf('id: "mat-');
if (defMatsIdx !== -1) {
  console.log(b.slice(defMatsIdx - 50, defMatsIdx + 1200));
}
