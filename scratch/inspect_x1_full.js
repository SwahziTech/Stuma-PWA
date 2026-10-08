const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Idx = content.indexOf('x1=(');
const invIdx = content.indexOf('L==="inventory"', x1Idx);

console.log('x1 starts at:', x1Idx, 'and L==="inventory" starts at:', invIdx);
console.log('--- Content between x1 and L==="inventory": ---');
console.log(content.slice(x1Idx, invIdx));
