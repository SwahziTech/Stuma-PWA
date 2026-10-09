const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const idx = code.indexOf('setManageTab');
console.log('setManageTab found at:', idx);
if (idx !== -1) {
  console.log(code.substring(Math.max(0, idx - 200), Math.min(code.length, idx + 400)));
}
