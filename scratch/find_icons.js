const fs = require('fs');
const b = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const regex = /([a-zA-Z0-9_$]+)\s*=\s*Re\("([^"]+)"/g;
let match;
const icons = [];
while ((match = regex.exec(b)) !== null) {
  icons.push({ varName: match[1], iconName: match[2] });
}
console.log('Total icons found:', icons.length);
console.log(icons.filter(i => /undo|rotate|refresh|history|arrow|back/i.test(i.iconName)));
