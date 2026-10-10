const fs = require('fs');
const prod = fs.readFileSync('scratch/current_prod_code.js', 'utf8');

// Test Cement input regex
const cementRegex = /(children:\s*"Cement bags"\s*\}\),\s*o\.jsx\("input",\s*\{)([\s\S]*?)(placeholder:\s*""\s*\}\))/;
console.log('Cement regex match:', cementRegex.test(prod));

// Test Pcs input regex
const pcsRegex = /(children:\s*"Actual physical counted pcs"\s*\}\),\s*o\.jsx\("input",\s*\{)([\s\S]*?)(placeholder:\s*""\s*\}\))/;
console.log('Pcs regex match:', pcsRegex.test(prod));

// Test Residual input regex
const resRegex = /(o\.jsx\("input",\s*\{[\s\S]*?value:\s*item\.quantity_pcs,[\s\S]*?handleUpdateResidualQty\(item\.id,\s*val\);[\s\S]*?\}\s*\}\))/;
console.log('Res regex match:', resRegex.test(prod));

// Test Modal section 2 regex
const modalSec2Regex = /(children:\s*"2\. Total Raw Materials Consumed"\s*\}\),\s*)(o\.jsxs\("div",\s*\{\s*style:\s*\{\s*display:\s*"grid",\s*gridTemplateColumns:\s*"repeat\(auto-fit)/;
console.log('Modal Sec 2 regex match:', modalSec2Regex.test(prod));
