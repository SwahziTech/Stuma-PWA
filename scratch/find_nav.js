const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Search around "Dashboard", "Production", "Sales", "Ledger"
const idx = bundle.indexOf('"Production"');
console.log('Production index:', idx);
if (idx !== -1) {
  console.log(bundle.substring(Math.max(0, idx - 500), Math.min(bundle.length, idx + 1000)));
}
