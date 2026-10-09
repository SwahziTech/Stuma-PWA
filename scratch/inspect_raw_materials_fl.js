const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Find definition of Fl
const start = code.indexOf(',Fl=') + 4;
let depth = 0, end = start;
for (let i = start; i < code.length; i++) {
  if (code[i] === '[') depth++;
  else if (code[i] === ']') {
    depth--;
    if (depth === 0) { end = i + 1; break; }
  }
}
const rawMaterials = eval(code.substring(start, end));
console.log('Total default raw materials:', rawMaterials.length);
console.log('Sample item:', rawMaterials[0]);
console.log('All keys and names:');
rawMaterials.forEach(m => {
  console.log(`- no: ${m.no}, key: "${m.key}", category: "${m.category}", name: "${m.name}", swahili: "${m.nameSwahili}", unit: "${m.unit}", purchaseUnit: "${m.purchaseUnit}", unitRatio: ${m.unitRatio}`);
});
