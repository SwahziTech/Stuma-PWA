const fs = require('fs');
const prodCode = fs.readFileSync('scratch/current_prod_code.js', 'utf8');

// Find where modal-backdrop or modals start towards the end of _1
const modalIdx = prodCode.indexOf('className: "modal-backdrop"');
console.log('modalIdx:', modalIdx);
if (modalIdx !== -1) {
  console.log(prodCode.slice(modalIdx - 150, modalIdx + 150));
}
