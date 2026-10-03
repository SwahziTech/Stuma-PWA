const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const start = content.indexOf('L==="inventory"&&o.jsxs(o.Fragment,{children:[');
console.log('Start index:', start);

// Print 10,000 chars from start
console.log(content.slice(start, start + 10000));
