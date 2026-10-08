const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const vtIdx = content.indexOf('Vt=');
console.log(content.slice(vtIdx - 800, vtIdx + 100));
