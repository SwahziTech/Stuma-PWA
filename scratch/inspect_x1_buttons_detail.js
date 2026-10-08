const fs = require('fs');
const code = fs.readFileSync('scratch/current_x1_code.js', 'utf8');

console.log('--- Head of x1 (first 1000 chars) ---');
console.log(code.slice(0, 1000));

console.log('--- Top buttons in x1 ---');
const btnIdx = code.indexOf('gridTemplateColumns:"repeat(3, 1fr)"');
console.log(code.slice(btnIdx - 50, btnIdx + 1600));
