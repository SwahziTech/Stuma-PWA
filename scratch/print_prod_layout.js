const fs = require('fs');
const content = fs.readFileSync('scratch/build_prod_code.js', 'utf8');

const lines = content.split('\n');
console.log('Lines 830 to 920:');
console.log(lines.slice(830, 920).join('\n'));
