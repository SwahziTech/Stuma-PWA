const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const o1Idx = content.indexOf('o1=');
console.log('o1 starts at:', o1Idx);
if (o1Idx !== -1) {
  console.log(content.slice(o1Idx, o1Idx + 1200));
}
