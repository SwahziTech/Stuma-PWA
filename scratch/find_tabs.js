const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Search for tab identifiers and navigation
const tabMatches = code.match(/['"`](dashboard|production|inventory|sales|ledger|materials|raw_materials|settings|baseline|finished_goods)['"`]/gi) || [];
console.log('Tab keywords:', Array.from(new Set(tabMatches)));

// Let's search for currentTab or activeTab state
const activeTabRegex = /\[[a-zA-Z0-9_$]+,\s*[a-zA-Z0-9_$]+\]\s*=\s*B\.useState\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
let m;
while ((m = activeTabRegex.exec(code)) !== null) {
  console.log('State with string initial value:', m[0]);
}

// Let's find where tabs are rendered in the main App component
const navMatches = code.match(/id:\s*['"`]([a-zA-Z0-9_-]+)['"`],\s*label:\s*['"`]([^'"`]+)['"`]/g) || [];
console.log('Navigation items:', navMatches);
