const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

let p = 0;
while ((p = bundle.indexOf('resetAllRawMaterialsToZero', p)) !== -1) {
  console.log('Pos:', p);
  console.log(bundle.slice(Math.max(0, p - 100), Math.min(bundle.length, p + 250)));
  console.log('===');
  p += 'resetAllRawMaterialsToZero'.length;
}
