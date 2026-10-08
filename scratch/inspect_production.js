const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const _1Idx = content.indexOf('_1=');
const b1Idx = content.indexOf('b1=');

console.log('_1 starts at:', _1Idx, 'b1 starts at:', b1Idx);
const prodCode = content.slice(_1Idx, b1Idx);
console.log('Production code length:', prodCode.length);
console.log('Production code head:', prodCode.slice(0, 1500));
