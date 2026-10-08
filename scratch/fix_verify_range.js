const fs = require('fs');

let verifyCode = fs.readFileSync('scratch/verify_all.js', 'utf8');
verifyCode = verifyCode.replace(
  "const x1Snippet = bundle.slice(x1Idx, x1Idx + 4500);",
  "const _1Pos = bundle.indexOf('_1=({prefillItemId:s'); const x1Snippet = bundle.slice(x1Idx, _1Pos);"
);
fs.writeFileSync('scratch/verify_all.js', verifyCode, 'utf8');
console.log('Updated verify_all.js to use full x1 component range');
