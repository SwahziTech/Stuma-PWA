const fs = require('fs');
const prod = fs.readFileSync('scratch/current_prod_code.js', 'utf8');
const idx = prod.indexOf('item.quantity_pcs');
const start = prod.lastIndexOf('o.jsx("input"', idx);
const end = prod.indexOf('placeholder', idx) + 30;
console.log('START:', start, 'END:', end);
console.log(prod.slice(start, end));
