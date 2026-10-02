const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Find a1 definition (before o1 or around 460000)
const idx = bundle.indexOf('a1=');
let pos = 0;
while ((pos = bundle.indexOf('a1=', pos)) !== -1) {
  console.log('--- a1 at', pos, '---');
  console.log(bundle.substring(Math.max(0, pos - 50), Math.min(bundle.length, pos + 400)));
  pos += 3;
}
