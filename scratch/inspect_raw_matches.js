const fs = require('fs');

const k1 = fs.readFileSync('scratch/current_k1_code.js', 'utf8');
console.log('--- current_k1_code matches: ---');
const k1Lines = k1.split('\n');
k1Lines.forEach((l, idx) => {
  if (/raw[_\s\-]?material/i.test(l)) {
    console.log(`Line ${idx+1}: ${l.substring(0, 120)}`);
  }
});

const bLedger = fs.readFileSync('scratch/build_ledger_code.js', 'utf8');
console.log('--- build_ledger_code matches: ---');
const bLines = bLedger.split('\n');
bLines.forEach((l, idx) => {
  if (/raw[_\s\-]?material/i.test(l)) {
    console.log(`Line ${idx+1}: ${l.substring(0, 120)}`);
  }
});
