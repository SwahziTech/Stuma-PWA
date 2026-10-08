const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Find all occurrences of navigation tabs
console.log('--- Searching for navigation / app tabs ---');
const navMatches = content.match(/navItems\s*=\s*\[[^\]]+\]/g) || [];
console.log('navItems:', navMatches);

// Let's find where x1 is called
let idx = 0;
while ((idx = content.indexOf('x1', idx)) !== -1) {
  const snippet = content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 50));
  if (snippet.includes('<') || snippet.includes('jsx') || snippet.includes('jsxs') || snippet.includes('case') || snippet.includes('Component')) {
    console.log('x1 usage at', idx, ':', snippet);
  }
  idx += 2;
}
