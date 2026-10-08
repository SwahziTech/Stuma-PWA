const fs = require('fs');
const content = fs.readFileSync('scratch/build_prod_code.js', 'utf8');

// Find all matches of he===
const matches = [...content.matchAll(/he\s*===\s*["']([^"']+)["']/g)];
console.log('Matches for he=== in build_prod_code.js:');
for (const m of matches) {
  console.log(m[1]);
}

// Find occurrences of Pe(
console.log('Occurrences of Pe(:');
let idx = 0;
while ((idx = content.indexOf('Pe(', idx)) !== -1) {
  console.log(content.slice(Math.max(0, idx - 40), Math.min(content.length, idx + 80)));
  idx += 3;
}
