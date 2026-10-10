const fs = require('fs');
const b = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const k1 = b.slice(b.indexOf('k1=()'), b.indexOf('C1=()'));

const regex = /o\.jsx(?:s)?\("button",\s*\{([^}]+)\}/g;
let match;
const buttons = [];
while ((match = regex.exec(k1)) !== null) {
  buttons.push(match[1].replace(/\s+/g, ' ').slice(0, 150));
}
console.log('Buttons found in k1:', buttons);
