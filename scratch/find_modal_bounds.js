const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Start = 502530;
const x1End = 530829;
const x1Code = bundle.substring(x1Start, x1End);

const modalIdx = x1Code.indexOf('H&&o.jsx("div",{className:"modal-overlay"');
console.log('modalIdx in x1Code:', modalIdx);
if (modalIdx !== -1) {
  console.log('Modal code:');
  console.log(x1Code.substring(modalIdx));
}
