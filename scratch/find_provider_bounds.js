const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Find function bc() and Ht()
const bcIdx = code.indexOf('function bc()');
const htIdx = code.indexOf('function Ht()');
const ovIdx = code.indexOf('function Ov(');
const bvIdx = code.indexOf('Bv=({children:s})=>{');
const vtIdx = code.indexOf('Vt=()=>{const s=B.useContext(Wp)');

console.log('bcIdx:', bcIdx);
console.log('htIdx:', htIdx);
console.log('ovIdx:', ovIdx);
console.log('bvIdx:', bvIdx);
console.log('vtIdx:', vtIdx);

console.log('\n--- Helper functions area (from bcIdx to bvIdx) ---');
console.log(code.substring(bcIdx, bcIdx + 300));
console.log('...\n', code.substring(bvIdx - 200, bvIdx));
