const fs = require('fs');
const content = fs.readFileSync('scratch/build_prod_code.js', 'utf8');

// Find return statement of _1
const returnIdx = content.lastIndexOf('return ');
console.log('Return at:', returnIdx);
console.log(content.slice(returnIdx, returnIdx + 2000));
