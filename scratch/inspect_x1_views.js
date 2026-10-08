const fs = require('fs');
const x1Code = fs.readFileSync('scratch/current_x1_code.js', 'utf8');

const btnStart = x1Code.indexOf('gridTemplateColumns:"repeat(3, 1fr)"');
const rawMatView = x1Code.indexOf('L==="raw_materials"&&');
const invView = x1Code.indexOf('L==="inventory"&&');

console.log('btnStart:', btnStart);
console.log('rawMatView:', rawMatView);
console.log('invView:', invView);
console.log('Between rawMatView and invView:');
console.log(x1Code.slice(rawMatView, invView));
