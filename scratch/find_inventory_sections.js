const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const terms = ['General Inventory', 'Critical Replenishment', 'Operational Drivers', 'High-Velocity'];
terms.forEach(t => {
  let idx = 0;
  while ((idx = content.indexOf(t, idx)) !== -1) {
    console.log('Found term:', t, 'at pos:', idx);
    console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 180)));
    console.log('--------------------------------------------------');
    idx += t.length;
  }
});
