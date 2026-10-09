const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
let url = '', anonKey = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) anonKey = line.split('=')[1].trim();
});

function testColumns() {
  const allExpectedColumns = [
    'id', 'name', 'category', 'unit', 'pcs_per_sqm', 'colors',
    'reorder_level', 'wastani_per_bag', 'moldCount', 'mold_size',
    'recipe_id', 'created_at', 'updated_at'
  ];

  return Promise.all(allExpectedColumns.map(col => {
    return new Promise(resolve => {
      const u = new URL(`${url}/rest/v1/items?select=${encodeURIComponent(col)}&limit=1`);
      const req = https.request(u, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => {
          resolve({ col, status: res.statusCode, error: res.statusCode !== 200 ? d : null });
        });
      });
      req.on('error', err => resolve({ col, status: 500, error: err.message }));
      req.end();
    });
  }));
}

testColumns().then(results => {
  console.log('--- ITEMS TABLE COLUMNS IN LIVE SUPABASE ---');
  results.forEach(r => {
    if (r.status === 200) {
      console.log(`✓ ${r.col}: EXISTS`);
    } else {
      console.log(`❌ ${r.col}: FAILED (${r.status}) -> ${r.error}`);
    }
  });
}).catch(console.error);
