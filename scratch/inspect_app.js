const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

console.log('Bundle length:', bundle.length);

// Look for navigation tabs
const tabsRegex = /label:\s*["']([^"']+)["']/g;
const labels = new Set();
let match;
while ((match = tabsRegex.exec(bundle)) !== null) {
  labels.add(match[1]);
}
console.log('Labels found:', Array.from(labels));

// Look for reset buttons in the app
const resetRegex = /<button[^>]*>[^<]*Reset[^<]*<\/button>/gi;
const resetButtons = bundle.match(resetRegex);
console.log('Reset buttons in JSX:', resetButtons);

// Search for baseline in JSX or handlers
const baselineMatches = [];
let idx = 0;
while ((idx = bundle.indexOf('Baseline', idx)) !== -1) {
  baselineMatches.push(bundle.slice(Math.max(0, idx - 80), Math.min(bundle.length, idx + 120)));
  idx += 8;
  if (baselineMatches.length > 15) break;
}
console.log('Baseline snippets:\n', baselineMatches.join('\n---\n'));
