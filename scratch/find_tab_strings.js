const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Search where the main tabs/views are rendered
// Let's check where 'production', 'sales', 'ledger', 'baseline' are rendered
['production', 'sales', 'ledger', 'baseline'].forEach(tab => {
  let idx = 0;
  const positions = [];
  while ((idx = bundle.indexOf(`"${tab}"`, idx)) !== -1) {
    positions.push(idx);
    idx += tab.length + 2;
  }
  console.log(`Tab "${tab}" positions:`, positions.length, positions.slice(0, 5));
});
