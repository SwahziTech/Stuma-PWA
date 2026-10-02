const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = bundle.indexOf('[j,k]=B.useState(');
console.log('[j,k] pos:', pos);
console.log(bundle.substring(pos, pos + 500));
