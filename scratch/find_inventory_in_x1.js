const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Start = content.indexOf('x1=({onNavigate:s})=>{');
let pos = x1Start;
while ((pos = content.indexOf('inventory', pos + 1)) !== -1 && pos < x1Start + 30000) {
  console.log('Pos:', pos);
  console.log(content.slice(Math.max(0, pos - 50), Math.min(content.length, pos + 100)));
  console.log('---');
}
