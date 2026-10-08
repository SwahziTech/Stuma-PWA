const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Find occurrences of sale_out or sales movements
console.log('--- Search for sale_out ---');
let pos = 0;
while ((pos = content.indexOf('sale_out', pos)) !== -1) {
  console.log('Pos:', pos);
  console.log(content.slice(pos - 60, pos + 100));
  pos += 8;
}
