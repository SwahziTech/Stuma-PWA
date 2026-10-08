const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Idx = content.indexOf('x1=');
const match = content.slice(x1Idx, x1Idx + 2000).match(/lt\([a-zA-Z0-9_$]+\)/);
console.log('lt call in x1:', match ? match[0] : null);

// find where lt is defined before x1
let pos = content.indexOf('lt=(');
if (pos === -1) pos = content.indexOf('const lt=');
if (pos === -1) pos = content.indexOf('function lt(');
console.log('lt definition pos:', pos);
if (pos !== -1) {
  console.log(content.slice(pos, pos + 300));
}
