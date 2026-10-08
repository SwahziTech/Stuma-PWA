const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

console.log('qa definition:');
const pos = content.indexOf('qa=');
console.log(pos);
if (pos !== -1) {
  console.log(content.slice(pos - 30, pos + 100));
}
