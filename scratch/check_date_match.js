const fs = require('fs');
const prodCode = fs.readFileSync('scratch/current_prod_code.js', 'utf8');

const regex = /style:\s*\{\s*background:\s*"transparent",\s*border:\s*"none"/g;
let m;
while ((m = regex.exec(prodCode)) !== null) {
  console.log('Match at', m.index);
  console.log(prodCode.slice(m.index - 50, m.index + 200));
}
