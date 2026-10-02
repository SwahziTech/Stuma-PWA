const fs = require('fs');

const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const oldJkStart = bundle.indexOf('[j,k]=B.useState(()=>{const V=localStorage.getItem(Xl);');
const oldJkEnd = bundle.indexOf('[A,L]=B.useState(()=>{const V=localStorage.getItem(Zl);');

console.log('oldJkStart:', oldJkStart);
console.log('oldJkEnd:', oldJkEnd);
console.log('Starts with:', bundle.substring(oldJkStart, oldJkStart + 30));
console.log('Ends with:', bundle.substring(oldJkEnd - 30, oldJkEnd));
console.log('Followed by:', bundle.substring(oldJkEnd, oldJkEnd + 30));
