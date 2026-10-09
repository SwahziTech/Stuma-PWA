const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Function to find component definitions: const _1=, const b1=, etc.
const comps = ['_1', 'b1', 'w1', 'S1', 'k1', 'x1', 'v1', 'o1', 'a1', 'l1'];
for (const comp of comps) {
  const match = code.match(new RegExp(`const\\s+${comp}\\s*=\\s*\\(`));
  if (match) {
    const idx = match.index;
    console.log(`\n=================== Component ${comp} (at index ${idx}) ===================`);
    console.log(code.substring(idx, idx + 400).replace(/\n/g, ' '));
  }
}
