const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const returnIdx = content.indexOf('return o.jsxs(', content.indexOf('x1=({onNavigate:s})=>{'));

console.log('--- Next 4000 chars of x1 return: ---');
console.log(content.slice(returnIdx + 2000, returnIdx + 6000));
