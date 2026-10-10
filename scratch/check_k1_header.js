const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const k1StartIdx = bundle.indexOf('k1=()=>{');
const c1StartIdx = bundle.indexOf('C1=()=>{', k1StartIdx);
const k1Code = bundle.slice(k1StartIdx, c1StartIdx);

const headIdx = k1Code.indexOf('Append-Only Ledger Log');
const retIdx = k1Code.lastIndexOf('return o.jsxs', headIdx);
console.log('retIdx:', retIdx);

// Look for header buttons around Append-Only Ledger Log
console.log('Snippet around header:');
console.log(k1Code.slice(headIdx, headIdx + 800));
