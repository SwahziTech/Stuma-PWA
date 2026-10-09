const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const comps = ['_1', 'b1', 'w1', 'S1', 'k1', 'x1', 'a1', 'o1', 'l1'];
for (const comp of comps) {
  const re = new RegExp(`(?:const|function)\\s+${comp}\\s*[:=]`, 'g');
  let m;
  while ((m = re.exec(code)) !== null) {
    console.log(`\nFound ${comp} at ${m.index}:`);
    console.log(code.substring(m.index, m.index + 300).replace(/\n/g, ' '));
  }
}
