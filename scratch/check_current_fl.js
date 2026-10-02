const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const flStart = bundle.indexOf('Fl=[');
const flEnd = bundle.indexOf('],ag=', flStart);
console.log('Fl length:', flEnd - flStart);
console.log(bundle.substring(flStart, flStart + 600));
