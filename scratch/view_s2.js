const fs = require('fs');
const b = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const s2Idx = b.indexOf('2. Total Raw Materials Consumed');
const s3Idx = b.indexOf('3. Expected Inventory Additions');
console.log(b.slice(s2Idx - 10, s3Idx));
