const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = 416590;
console.log(bundle.substring(pos - 7000, pos - 3500));
