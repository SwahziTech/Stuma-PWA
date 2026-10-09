const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Find [t,r]=B.useState("dashboard") or navigation bar
const idx = code.indexOf('B.useState("dashboard")');
console.log('Found main tab state at:', idx);
if (idx !== -1) {
  console.log(code.substring(idx - 200, idx + 4000));
}
