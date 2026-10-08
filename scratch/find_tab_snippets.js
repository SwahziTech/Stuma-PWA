const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

['production', 'sales', 'ledger', 'baseline'].forEach(tab => {
  let idx = 0;
  const positions = [];
  while ((idx = bundle.indexOf(`'${tab}'`, idx)) !== -1) {
    positions.push(idx);
    idx += tab.length + 2;
  }
  console.log(`Single-quoted tab '${tab}' positions:`, positions.length, positions.slice(0, 5));
});

// Let's inspect around position 716344 and 725041 and 733031
[716344, 725041, 733031].forEach(pos => {
  console.log(`\n=== Snippet around ${pos} ===`);
  console.log(bundle.slice(pos - 150, pos + 250));
});
