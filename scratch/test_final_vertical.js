const fs = require('fs');

const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Check vertical layout
console.log('Vertical flex container:', bundle.includes('style: { display: "flex", flexDirection: "column", gap: "10px", width: "100%" }'));

// Check trips formatting
console.log('Trips formatting present:', bundle.includes('mainDisplay: `${tripsStr} Trips`'));
console.log('ndoo subdetail present:', bundle.includes('subDetail: `${(m.currentBalance || 0).toLocaleString()} ndoo for production`'));

// Check direct edit in trips
console.log('Edit in Trips support:', bundle.includes('Stock Count (Trips)'));

// Check syntax
require('child_process').execSync('node --check assets/index-hgjhj-0G.js');
console.log('✓ Syntax is 100% VALID!');
