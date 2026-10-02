const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const comps = ['x1=', '_1=', 'b1=', 'w1=', 'S1=', 'k1=', 'C1='];
comps.forEach(c => {
  const pos = bundle.indexOf(c);
  console.log(c, 'at position:', pos);
});
