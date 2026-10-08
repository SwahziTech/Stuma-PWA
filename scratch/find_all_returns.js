const fs = require('fs');
const prodCode = fs.readFileSync('scratch/current_prod_code.js', 'utf8');

const regex = /return\s+o\.jsx[s]?\("div",\s*\{/g;
let m;
while ((m = regex.exec(prodCode)) !== null) {
  console.log('Pos:', m.index, 'snippet:', prodCode.slice(m.index, m.index + 120));
}
