const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

['_1', 'b1', 'x1'].forEach(comp => {
  let idx = 0;
  while ((idx = code.indexOf(comp, idx)) !== -1) {
    const snippet = code.substring(Math.max(0, idx - 10), Math.min(code.length, idx + 30));
    if (snippet.includes(comp + '=') || snippet.includes(comp + ' =')) {
      console.log(`Found ${comp} assignment at ${idx}:`, snippet);
    }
    idx += comp.length;
  }
});
