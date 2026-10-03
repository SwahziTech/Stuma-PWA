const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const startTarget = 'L==="inventory"&&o.jsxs(o.Fragment,{children:[';
const startIdx = content.indexOf(startTarget);
console.log('startIdx:', startIdx);

const openParenIdx = content.indexOf('(', startIdx);
let depth = 0;
let endIdx = -1;
for (let i = openParenIdx; i < content.length; i++) {
  if (content[i] === '(') depth++;
  else if (content[i] === ')') {
    depth--;
    if (depth === 0) {
      endIdx = i + 1;
      break;
    }
  }
}

console.log('endIdx:', endIdx);
console.log('Total length of L===inventory:', endIdx - startIdx);
console.log('End of L===inventory looks like:');
console.log(content.slice(endIdx - 100, endIdx + 100));
