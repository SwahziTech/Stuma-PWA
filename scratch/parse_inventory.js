const fs = require('fs');
const inv = fs.readFileSync('scratch/inventory_block_original.js', 'utf8');

const prefix = 'L==="inventory"&&o.jsxs(o.Fragment,{children:[';
const suffix = ']})';
const inner = inv.slice(prefix.length, inv.length - suffix.length);

let depthParen = 0, depthBrace = 0, depthBracket = 0;
let itemStarts = [0];
for (let i = 0; i < inner.length; i++) {
  const c = inner[i];
  if (c === '(') depthParen++;
  else if (c === ')') depthParen--;
  else if (c === '{') depthBrace++;
  else if (c === '}') depthBrace--;
  else if (c === '[') depthBracket++;
  else if (c === ']') depthBracket--;
  else if (c === ',' && depthParen === 0 && depthBrace === 0 && depthBracket === 0) {
    itemStarts.push(i + 1);
  }
}

const child1 = inner.substring(itemStarts[0], itemStarts[1] - 1);
const child2 = inner.substring(itemStarts[1], itemStarts[2] - 1);
const child3 = inner.substring(itemStarts[2], itemStarts[3] - 1);
const child4 = inner.substring(itemStarts[3]);

fs.writeFileSync('scratch/child1_critical.js', child1);
fs.writeFileSync('scratch/child2_velocity.js', child2);
fs.writeFileSync('scratch/child3_search.js', child3);
fs.writeFileSync('scratch/child4_catalog.js', child4);
console.log('Successfully saved child1, child2, child3, child4 to scratch/');
