const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Find where rawMaterials is initialized or defined
const matches = [];
let pos = 0;
while ((pos = bundle.indexOf('rawMaterials', pos)) !== -1) {
  matches.push(pos);
  pos += 12;
}

console.log('rawMaterials found at positions:', matches);
matches.forEach(p => {
  console.log('--- Pos', p, '---');
  console.log(bundle.substring(Math.max(0, p - 100), Math.min(bundle.length, p + 250)));
});
