const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Find movements state in AppProvider
const pos = content.indexOf('stumarcot_movements');
console.log('stumarcot_movements pos:', pos);
if (pos !== -1) {
  console.log(content.slice(pos - 100, pos + 300));
}
