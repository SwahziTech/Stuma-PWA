const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

console.log('--- BOTTOM NAV (around 471400) ---');
console.log(bundle.slice(471400, 472500));

console.log('\n--- MAIN CONTENT / ROUTER (around 951500) ---');
console.log(bundle.slice(951500, 952800));
