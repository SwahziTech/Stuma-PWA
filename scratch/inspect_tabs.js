const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Look for navigation or tab buttons or labels
const re = /["'](?:production|sales|ledger|inventory|stock|raw|material|materials|dashboard|settings)["']/gi;
let match;
const found = new Set();
while ((match = re.exec(bundle)) !== null) {
  found.add(match[0]);
}
console.log('Found keywords in quotes:', Array.from(found));

// Look for tab definitions or nav items
const navMatches = bundle.match(/\{[^}]*id:\s*["'][^"']+["'][^}]*label:\s*["'][^"']+["'][^}]*\}/gi);
if (navMatches) {
  console.log('Nav matches:', navMatches.slice(0, 10));
}

// Search for tab state or buttons
const tabMatches = bundle.match(/tab[s]?/gi);
console.log('Total tab occurrences:', tabMatches ? tabMatches.length : 0);
