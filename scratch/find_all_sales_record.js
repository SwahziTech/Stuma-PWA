const fs = require('fs');
const code = fs.readFileSync('scratch/assembled_new_x1.js', 'utf8');

let pos = 0;
while ((pos = code.indexOf('sales_record', pos)) !== -1) {
  console.log('sales_record at:', pos);
  console.log(code.slice(pos - 30, pos + 80));
  pos += 12;
}
