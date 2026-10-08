const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Start = 613784;
console.log('100 chars before x1Start:');
console.log(bundle.slice(x1Start - 100, x1Start));
