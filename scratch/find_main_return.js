const fs = require('fs');
const content = fs.readFileSync('scratch/build_prod_code.js', 'utf8');

// Find all occurrences of return o.jsxs("div", { className: "page-container" or similar
const matches = [...content.matchAll(/return\s+o\.jsx[s]?\([^)]*className:\s*["'][^"']+["']/g)];
for (const m of matches) {
  console.log(m[0]);
}

// Search for the main return
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return o.jsxs("div"') || lines[i].includes('return o.jsx("div"')) {
    console.log(`Line ${i}:`, lines[i].slice(0, 100));
  }
}
