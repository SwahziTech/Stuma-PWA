const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const target = 'for(const D of u)S.set(D.key,D);';
console.log('Occurrences of target:', bundle.split(target).length - 1);
