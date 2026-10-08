const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const b1Idx = content.indexOf('b1=');
const w1Idx = content.indexOf('w1=');
const salesCode = content.slice(b1Idx, w1Idx);

const batchIdx = salesCode.indexOf('dispatch_out');
console.log(salesCode.slice(batchIdx - 200, batchIdx + 800));
