const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Idx = bundle.indexOf('x1=({onNavigate:s})=>');
const _1Idx = bundle.indexOf('_1=({prefillItemId:s');
const b1Idx = bundle.indexOf('b1=({prefillItemId:s');

console.log('x1Idx:', x1Idx);
console.log('_1Idx:', _1Idx);
console.log('b1Idx:', b1Idx);
