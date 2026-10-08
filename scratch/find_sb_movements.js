const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const regex = /\.from\(["']movements["']\)/g;
let m;
while ((m = regex.exec(bundle)) !== null) {
  console.log('Match at', m.index);
  console.log(bundle.slice(m.index - 50, m.index + 200));
  console.log('---');
}
