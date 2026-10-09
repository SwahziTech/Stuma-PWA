const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'extracted_supabase_context.js'), 'utf8');

// Let's split by function declarations and variable declarations around the provider
console.log('--- Searching for key patterns in extracted context ---');

// Find all function names
const fnMatches = content.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/g) || [];
console.log('Functions:', fnMatches.slice(0, 30));

// Find all async function names
const asyncMatches = content.match(/async\s+function\s+([a-zA-Z0-9_$]+)\s*\(/g) || [];
console.log('Async Functions:', asyncMatches);

// Find all variable names initialized with localStorage or storage constants
const storageMatches = content.match(/[a-zA-Z0-9_$]+\s*=\s*["'][a-zA-Z0-9_$-]+["']/g) || [];
console.log('String constants:', storageMatches.filter(s => s.includes('stuma') || s.includes('item') || s.includes('move') || s.includes('local') || s.includes('raw')));
