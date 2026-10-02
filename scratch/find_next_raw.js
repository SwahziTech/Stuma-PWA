const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

let pos = 508500;
while ((pos = bundle.indexOf('raw_materials', pos + 1)) !== -1) {
  console.log('Pos:', pos);
  console.log(bundle.substring(pos - 50, pos + 250));
  if (pos > 530000) break;
}
