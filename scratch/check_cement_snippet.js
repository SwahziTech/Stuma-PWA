const fs = require('fs');
const prod = fs.readFileSync('scratch/current_prod_code.js', 'utf8');
const idx = prod.indexOf('Cement bags');
console.log('Snippet around Cement bags:');
console.log(prod.slice(idx - 20, idx + 700));
