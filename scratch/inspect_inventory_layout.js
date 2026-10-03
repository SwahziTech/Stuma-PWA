const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const start = content.indexOf('L==="inventory"&&o.jsxs("div"');
console.log('L===inventory starts at:', start);

console.log('--- Content of L===inventory (first 8000 chars): ---');
console.log(content.slice(start, start + 8000));
