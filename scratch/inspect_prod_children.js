const fs = require('fs');
const prodCode = fs.readFileSync('scratch/current_prod_code.js', 'utf8');

// Find all top-level children in the return statement of _1
const returnIdx = prodCode.lastIndexOf('return o.jsxs("div",');
console.log('Return statement at:', returnIdx);

// Look at the children of this top div
const afterReturn = prodCode.slice(returnIdx);
console.log('Length of return statement:', afterReturn.length);

// Find occurrences of modals or major sections
const matches = [...afterReturn.matchAll(/o\.jsx[s]?\((?:[a-zA-Z0-9_$]+|"div")[^)]*className:\s*["']([^"']+)["']/g)];
console.log('Major elements in return:');
for (const m of matches) {
  console.log('Class:', m[1]);
}
