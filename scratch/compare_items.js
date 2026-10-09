const https = require('https');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync('.env', 'utf8');
let url = '', anonKey = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) anonKey = line.split('=')[1].trim();
});

// Extract bundled items (nc)
const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');
const start = code.indexOf(',nc=') + 4;
let depth = 0, end = start;
for (let i = start; i < code.length; i++) {
  if (code[i] === '[') depth++;
  else if (code[i] === ']') {
    depth--;
    if (depth === 0) { end = i + 1; break; }
  }
}
const bundledItems = eval(code.substring(start, end));
console.log('Total bundled items:', bundledItems.length);

// Fetch items from Supabase
const req = https.request(url + '/rest/v1/items?select=id,name,category,unit,pcs_per_sqm&limit=100', {
  headers: { 'apikey': anonKey, 'Authorization': 'Bearer ' + anonKey }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const sbItems = JSON.parse(d);
    console.log('Total Supabase items:', sbItems.length);

    const sbIds = new Set(sbItems.map(it => it.id));
    const bundledIds = new Set(bundledItems.map(it => it.id));

    const inBundleNotSb = bundledItems.filter(it => !sbIds.has(it.id));
    const inSbNotBundle = sbItems.filter(it => !bundledIds.has(it.id));

    console.log('\nItems in bundle but NOT in Supabase:', inBundleNotSb.length);
    if (inBundleNotSb.length > 0) {
      console.log('Examples:', inBundleNotSb.slice(0, 5).map(it => ({ id: it.id, name: it.name })));
    }

    console.log('\nItems in Supabase but NOT in bundle:', inSbNotBundle.length);
    if (inSbNotBundle.length > 0) {
      console.log('Examples:', inSbNotBundle.slice(0, 5).map(it => ({ id: it.id, name: it.name })));
    }
  });
});
req.end();
