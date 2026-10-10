const fs = require('fs');
const b = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const regex = /\.from\(["']movements["']\)\.select\([^)]*\)/g;
let match;
while ((match = regex.exec(b)) !== null) {
  console.log(b.slice(match.index - 300, match.index + 200));
}
