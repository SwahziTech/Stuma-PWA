const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Start = bundle.indexOf('x1=({onNavigate');
const nextComp = bundle.indexOf(',_1=({prefillItemId');

console.log('x1Start:', x1Start, 'nextComp:', nextComp);
const x1Code = bundle.substring(x1Start, nextComp);

const rawStart = x1Code.indexOf('L==="raw_materials"&&');
console.log('rawStart in x1Code:', rawStart);

const modalStart = x1Code.indexOf('H&&o.jsx("div",{className:"modal-overlay"');
console.log('modalStart in x1Code:', modalStart);

console.log('Tail of x1Code:');
console.log(x1Code.substring(modalStart));
