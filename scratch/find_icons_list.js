const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Find icon definitions or look at scratch/check_icons.js
if (fs.existsSync('scratch/check_icons.js')) {
  console.log(fs.readFileSync('scratch/check_icons.js', 'utf8'));
}

// Let's search for icon components in the bundle
const matches = content.match(/const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:e\(\s*["']([A-Za-z0-9]+)["']|\(0,\s*[a-zA-Z0-9_$]+\.createLucideIcon\)\(["']([A-Za-z0-9]+)["'])/g) || [];
console.log('Sample icon defs:', matches.slice(0, 20));
