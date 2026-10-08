const fs = require('fs');

let prodCode = fs.readFileSync('scratch/current_prod_code.js', 'utf8').replace(/\r\n/g, '\n');
console.log('Normalized prodCode length:', prodCode.length);

const datePickerPattern = 'style: { background: "transparent", border: "none", color: "#f8fafc", fontFamily: "var(--font-mono)", fontSize: "13.5px", fontWeight: 600, outline: "none", cursor: "pointer" }\n              })\n            ]\n          })\n        ]\n      }),';

const idx = prodCode.indexOf(datePickerPattern);
console.log('datePickerPattern idx:', idx);
if (idx !== -1) {
  console.log('Found! Next 100 chars:');
  console.log(prodCode.slice(idx + datePickerPattern.length, idx + datePickerPattern.length + 100));
}
