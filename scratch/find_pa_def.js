const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

let pos = content.indexOf('function Pa(');
if (pos === -1) pos = content.indexOf('Pa=(');
if (pos === -1) pos = content.indexOf('const Pa=');
console.log('Pa pos:', pos);
if (pos !== -1) {
  console.log(content.slice(pos, pos + 300));
}
