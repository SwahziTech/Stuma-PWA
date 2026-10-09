const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
let url = '', anonKey = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) anonKey = line.split('=')[1].trim();
});

function makeReq(endpoint, method, payload = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(`${url}${endpoint}`);
    const req = https.request(u, {
      method,
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(d) });
        } catch {
          resolve({ status: res.statusCode, raw: d });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(JSON.stringify(payload));
    req.end();
  });
}

async function testMovementInsert() {
  console.log('Testing insert of a production_in movement...');
  const testMov = {
    id: 'test-audit-' + Date.now(),
    item_id: 'item-sl-01', // known valid item in items table
    type: 'production_in',
    color: 'Grey',
    quantity_pcs: 10,
    quantity_sqm: 5.5,
    delta: 5.5,
    date: '2026-10-09',
    note: 'Audit connectivity test - will be removed immediately',
    entered_by: 'AuditRunner',
    materials_used: { cement_bags: 1 },
    computed_materials_deducted: { cementBags: 1 },
    batch_id: 'batch-test-01',
    qc_status: 'optimal',
    expected_cement_bags: 1,
    actual_cement_bags: 1,
    is_residual: false,
    yield_factor_pct: 100
  };

  const insertRes = await makeReq('/rest/v1/movements', 'POST', [testMov]);
  console.log('Insert status:', insertRes.status);
  if (insertRes.status >= 200 && insertRes.status < 300) {
    console.log('✓ Insert SUCCESSFUL!');
    // Clean up test row immediately
    console.log('Cleaning up test movement row...');
    const delRes = await makeReq(`/rest/v1/movements?id=eq.${testMov.id}`, 'DELETE');
    console.log('Delete status:', delRes.status);
  } else {
    console.log('❌ Insert FAILED:', insertRes.data || insertRes.raw);
  }
}

testMovementInsert().catch(console.error);
