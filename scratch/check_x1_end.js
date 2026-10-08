const fs = require('fs');
const content = fs.readFileSync('scratch/assembled_new_x1.js', 'utf8');

console.log('Length:', content.length);
console.log('Last 300 chars:');
console.log(content.slice(-300));
