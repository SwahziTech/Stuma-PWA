const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// 1. All localStorage getItem / setItem / removeItem
const lsUsage = [];
const regexLsCall = /localStorage\s*\.\s*(getItem|setItem|removeItem)\s*\(\s*['"`]([^'"`]+)['"`]/g;
let m;
while ((m = regexLsCall.exec(code)) !== null) {
  lsUsage.push({ method: m[1], key: m[2], index: m.index });
}

console.log('--- localStorage keys used ---');
const keySummary = {};
lsUsage.forEach(u => {
  if (!keySummary[u.key]) keySummary[u.key] = new Set();
  keySummary[u.key].add(u.method);
});
for (const [k, methods] of Object.entries(keySummary)) {
  console.log(`${k}: [${Array.from(methods).join(', ')}]`);
}

// 2. Look for all .from('items') and .from('movements') calls
console.log('\n--- Supabase queries on items and movements ---');
const queryRegex = /\.from\s*\(\s*['"`](items|movements)['"`]\s*\)\s*\.([a-zA-Z0-9_]+)/g;
while ((m = queryRegex.exec(code)) !== null) {
  const snippet = code.substring(Math.max(0, m.index - 50), Math.min(code.length, m.index + 200));
  console.log(`\nQuery at ${m.index}: .from('${m[1]}').${m[2]}...`);
  console.log(snippet.replace(/\n/g, ' '));
}

// 3. Search for supabase client initialization
console.log('\n--- Supabase Client Initialization ---');
const sbInitRegex = /createClient\s*\(/g;
// Also search for where URL and Key are passed
const sbSearchRegex = /stumarcot_supabase_url/g;
while ((m = sbSearchRegex.exec(code)) !== null) {
  console.log(`stumarcot_supabase_url at ${m.index}:`);
  console.log(code.substring(Math.max(0, m.index - 100), Math.min(code.length, m.index + 200)));
}
