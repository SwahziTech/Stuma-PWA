const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = bundle.indexOf('Wp.Provider');
console.log('Wp.Provider pos:', pos);
console.log(bundle.substring(pos - 100, pos + 500));
