const fs = require('fs');
const prodCode = fs.readFileSync('scratch/current_prod_code.js', 'utf8');

const regex = /modal/gi;
let m;
while ((m = regex.exec(prodCode)) !== null) {
  console.log('Pos:', m.index, 'snippet:', prodCode.slice(Math.max(0, m.index - 40), Math.min(prodCode.length, m.index + 80)));
}
