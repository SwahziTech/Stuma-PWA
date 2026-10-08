const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Idx = content.indexOf('x1=');
const _1Idx = content.indexOf('_1=');

console.log('x1 starts at:', x1Idx, '_1 starts at:', _1Idx);

// Let's print the structure of x1
const x1Code = content.slice(x1Idx, _1Idx);

// Look for sub-views or modes in x1:
console.log('Matches for L=== in x1:');
const matches = [...x1Code.matchAll(/L===["']([^"']+)["']/g)];
for (const m of matches) {
  console.log('Mode:', m[1]);
}
