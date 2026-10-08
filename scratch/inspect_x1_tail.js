const fs = require('fs');
const x1Code = fs.readFileSync('scratch/current_x1_code.js', 'utf8');

const invView = x1Code.indexOf('L==="inventory"&&');
console.log('invView to end:', x1Code.length - invView);
// Let's print the last 500 characters of x1Code
console.log(x1Code.slice(-500));
