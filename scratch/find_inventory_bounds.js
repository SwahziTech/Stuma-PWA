const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const startTarget = 'L==="inventory"&&o.jsxs(o.Fragment,{children:[';
const startIdx = content.indexOf(startTarget);
console.log('startIdx:', startIdx);

// Find the end of this L==="inventory" expression
// It ends where the children array ends or before the next top-level element
let depth = 0;
let endIdx = -1;
for (let i = startIdx; i < content.length; i++) {
  if (content[i] === '{' || content[i] === '[') depth++;
  else if (content[i] === '}' || content[i] === ']') depth--;
  if (depth === 0 && i > startIdx) {
    endIdx = i + 1;
    break;
  }
}
console.log('endIdx:', endIdx);
console.log('Total length of L===inventory:', endIdx - startIdx);
console.log('Full content of L===inventory:');
console.log(content.slice(startIdx, endIdx));
