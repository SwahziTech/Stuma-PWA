const fs = require('fs');

const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const oldFlStart = bundle.indexOf('Fl=[');
const oldFlEnd = bundle.indexOf('],ag=', oldFlStart) + 1;

console.log('Starts with:', bundle.substring(oldFlStart, oldFlStart + 10));
console.log('Ends with:', bundle.substring(oldFlEnd - 10, oldFlEnd));
console.log('Followed by:', bundle.substring(oldFlEnd, oldFlEnd + 10));
