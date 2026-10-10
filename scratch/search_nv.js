const fs = require('fs');
const b = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const regex = /[^a-zA-Z0-9_$]Nv\([^)]*\)/g;
let match;
while ((match = regex.exec(b)) !== null) {
  console.log(b.slice(match.index - 50, match.index + 200));
}
