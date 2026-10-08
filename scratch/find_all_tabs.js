const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Find all occurrences of L===" or currentTab or activeTab
const matches = [...bundle.matchAll(/L\s*===\s*["']([^"']+)["']/g)];
console.log('Tabs handled by L === :', Array.from(new Set(matches.map(m => m[1]))));

// Also find the navigation bar items (where users click to change tab)
const navIndex = bundle.indexOf('navItems');
if (navIndex !== -1) {
  console.log('navItems snippet:', bundle.slice(navIndex, navIndex + 400));
}

// Search for bottom nav or tab bar
const bottomNavRegex = /\[\{id:[\"'][a-zA-Z0-9_\-]+[\"'],label:/g;
const bottomNavMatches = [...bundle.matchAll(bottomNavRegex)];
bottomNavMatches.forEach(m => {
  console.log('Nav item list:', bundle.slice(m.index, m.index + 300));
});
