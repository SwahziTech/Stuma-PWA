const fs = require('fs');
const code = fs.readFileSync('scratch/assembled_new_x1.js', 'utf8');

const sIdx = code.indexOf('L==="sales_record"');
console.log('Around sales_record:');
console.log(code.slice(Math.max(0, sIdx - 200), sIdx + 300));
