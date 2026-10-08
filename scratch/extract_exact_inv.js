const fs = require('fs');
const x1Code = fs.readFileSync('scratch/current_x1_code.js', 'utf8');

const invStart = x1Code.indexOf('L==="inventory"&&o.jsxs(o.Fragment,{children:[');
const modalStart = x1Code.indexOf('H&&o.jsx("div",{className:"modal-backdrop"');

console.log('invStart:', invStart);
console.log('modalStart:', modalStart);

const invBlock = x1Code.slice(invStart, modalStart);
console.log('invBlock length:', invBlock.length);
console.log('invBlock starts with:', invBlock.slice(0, 100));
console.log('invBlock ends with:', invBlock.slice(-100));

fs.writeFileSync('scratch/exact_inv_block.js', invBlock, 'utf8');
console.log('Saved scratch/exact_inv_block.js');
