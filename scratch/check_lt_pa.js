const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Check lt and Pa scope
console.log('lt definition:');
const ltIdx = content.indexOf('lt=');
console.log(content.slice(ltIdx - 50, ltIdx + 200));

console.log('Pa definition:');
const paIdx = content.indexOf('Pa=');
console.log(content.slice(paIdx - 50, paIdx + 200));
