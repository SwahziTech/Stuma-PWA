const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const jkStart = bundle.indexOf('[j,k]=B.useState(');
console.log(bundle.substring(jkStart, jkStart + 800));
