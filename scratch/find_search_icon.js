const fs = require('fs');
const inv = fs.readFileSync('scratch/assembled_inventory.js', 'utf8');

const sIdx = inv.indexOf('search');
console.log('Search in assembled_inventory:');
console.log(inv.slice(sIdx - 100, sIdx + 200));
