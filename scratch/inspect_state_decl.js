const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Find where [x, setX] or [w, setW] or items/movements are initialized
const providerPos = 426937;
console.log('--- Search before providerPos ---');
console.log(bundle.slice(providerPos - 8000, providerPos - 4000));
