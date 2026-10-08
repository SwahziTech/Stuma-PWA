const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Find default or sample movements
const pos = content.indexOf('INITIAL_MOVEMENTS');
console.log('INITIAL_MOVEMENTS pos:', pos);
if (pos !== -1) {
  console.log(content.slice(pos, pos + 500));
}
