const fs = require('fs');
const content = fs.readFileSync('scratch/assembled_new_prod.js', 'utf8');

const lines = content.split('\n');
console.log('Lines 1345 to 1370:');
console.log(lines.slice(1345, 1370).map((l, i) => `${1346 + i}: ${l}`).join('\n'));
