const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Start = content.indexOf('x1=({onNavigate:s})=>{');
const returnIdx = content.indexOf('return o.jsxs(', x1Start);
const returnSlice = content.slice(returnIdx, returnIdx + 3000);

console.log(returnSlice);
