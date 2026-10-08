const fs = require('fs');
const prodCode = fs.readFileSync('scratch/current_prod_code.js', 'utf8');

const mainReturnIdx = 29700;
console.log(prodCode.slice(mainReturnIdx, mainReturnIdx + 2000));
