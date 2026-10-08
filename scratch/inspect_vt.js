const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const vtIdx = content.indexOf('Vt=');
console.log('Vt starts at:', vtIdx);
if (vtIdx !== -1) {
  console.log(content.slice(vtIdx - 200, vtIdx + 1200));
}
