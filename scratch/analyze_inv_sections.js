const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const startIdx = 624413;
const endIdx = 636082;
const invCode = content.slice(startIdx, endIdx);

// Look for the main blocks
const critIdx = invCode.indexOf('Critical Replenishment Alert');
const highIdx = invCode.indexOf('High-Velocity Operational Drivers');
const searchIdx = invCode.indexOf('search-wrapper');
const catCatalogIdx = invCode.indexOf('General Inventory Catalog');

console.log('critIdx in block:', critIdx);
console.log('highIdx in block:', highIdx);
console.log('searchIdx in block:', searchIdx);
console.log('catCatalogIdx in block:', catCatalogIdx);
