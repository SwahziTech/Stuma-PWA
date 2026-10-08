const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Start = 613784;
console.log('50 chars before x1Start:');
console.log(JSON.stringify(bundle.slice(x1Start - 50, x1Start)));
