const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = bundle.indexOf('le=B.useCallback');
console.log('le pos:', pos);
console.log(bundle.substring(pos, pos + 2500));
