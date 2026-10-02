const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Code = bundle.substring(502530, 530829);
// Find all icon components used in x1 (starts with lowercase/uppercase two chars like si, qa, pc, etc.)
const iconMatches = new Set(x1Code.match(/o\.jsx\(([a-zA-Z0-9_$]+),\s*\{[^}]*size:/g) || []);
console.log('Icons used in x1:', Array.from(iconMatches));
