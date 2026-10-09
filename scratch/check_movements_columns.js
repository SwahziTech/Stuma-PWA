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
    'id', 'item_id', 'type', 'color', 'quantity_pcs', 'quantity_sqm',
    'delta', 'date', 'note', 'entered_by', 'materials_used',
    'computed_materials_deducted', 'batch_id', 'qc_status',
    'expected_cement_bags', 'actual_cement_bags', 'is_residual',
    'yield_factor_pct', 'unit_sold_as', 'price_per_unit', 'total_price',
    'customer_name', 'customer_phone', 'created_at'
  ];

  return Promise.all(allExpectedColumns.map(col => {
    return new Promise(resolve => {
      const u = new URL(`${url}/rest/v1/movements?select=${col}&limit=1`);
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
  console.log('--- MOVEMENTS TABLE COLUMNS IN LIVE SUPABASE ---');
  results.forEach(r => {
    if (r.status === 200) {
      console.log(`✓ ${r.col}: EXISTS`);
    } else {
      console.log(`❌ ${r.col}: FAILED (${r.status}) -> ${r.error}`);
    }
  });
}).catch(console.error);
