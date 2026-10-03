const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const regex = /["']dashboard["']/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const start = Math.max(0, match.index - 80);
  const end = Math.min(content.length, match.index + 120);
  console.log('Pos:', match.index);
  console.log(content.slice(start, end));
  console.log('-----------------------------');
}
