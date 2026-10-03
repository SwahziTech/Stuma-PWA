const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Start = content.indexOf('x1=({onNavigate:s})=>{');
console.log(content.slice(x1Start, x1Start + 1200));
