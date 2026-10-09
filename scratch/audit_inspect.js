const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');
console.log('Bundle size in bytes:', code.length);

// 1. Search for Supabase references
const regexSb = /supabase/gi;
let match;
const positions = [];
while ((match = regexSb.exec(code)) !== null) {
  positions.push(match.index);
}
console.log('Total occurrences of "supabase":', positions.length);

// 2. Search for createClient
const regexClient = /createClient/gi;
const clientPositions = [];
while ((match = regexClient.exec(code)) !== null) {
  clientPositions.push(match.index);
}
console.log('Total occurrences of "createClient":', clientPositions.length);
clientPositions.forEach((pos, i) => {
  console.log(`\n--- createClient [${i}] at ${pos} ---`);
  console.log(code.substring(Math.max(0, pos - 150), Math.min(code.length, pos + 250)));
});

// 3. Search for localStorage
const regexLS = /localStorage/gi;
const lsPositions = [];
while ((match = regexLS.exec(code)) !== null) {
  lsPositions.push(match.index);
}
console.log('\nTotal occurrences of "localStorage":', lsPositions.length);

// 4. Search for table names in Supabase queries: .from('...') or .from("...")
const fromMatches = [];
const regexFrom = /\.from\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
while ((match = regexFrom.exec(code)) !== null) {
  fromMatches.push(match[1]);
}
console.log('\nSupabase tables queried via .from():', Array.from(new Set(fromMatches)));
