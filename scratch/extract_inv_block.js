const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const startIdx = 624413;
const endIdx = 636082;
const invCode = content.slice(startIdx, endIdx);

fs.writeFileSync('scratch/inventory_block_original.js', invCode, 'utf8');
console.log('Saved inventory_block_original.js, length:', invCode.length);
