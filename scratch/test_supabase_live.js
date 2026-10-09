const https = require('https');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
let url = '', anonKey = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) anonKey = line.split('=')[1].trim();
});

console.log('Testing Supabase instance at:', url);

function req(endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    const u = new URL(`${url}${endpoint}`);
    const r = https.request(u, {
      method,
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    r.on('error', reject);
    r.end();
  });
}

async function inspectSupabase() {
  // 1. Check OpenAPI schema (PostgREST exposes definitions of all tables and columns)
  console.log('\n--- 1. PostgREST OpenAPI Specification ---');
  const openapi = await req('/rest/v1/');
  if (openapi.data && openapi.data.definitions) {
    const tableNames = Object.keys(openapi.data.definitions);
    console.log('Exposed Tables in Supabase:', tableNames);
    for (const t of tableNames) {
      console.log(`\nTable [${t}] schema:`);
      const def = openapi.data.definitions[t];
      if (def && def.properties) {
        for (const [col, colDef] of Object.entries(def.properties)) {
          console.log(`  - ${col} (${colDef.type || colDef.format || 'unknown'})`);
        }
      }
    }
  } else {
    console.log('Could not fetch definitions from /rest/v1/:', openapi.status, openapi.raw || openapi.data);
  }

  // 2. Query items
  console.log('\n--- 2. Query items table count and sample ---');
  const itemsRes = await req('/rest/v1/items?select=id,name,category,created_at&limit=5');
  console.log('Items status:', itemsRes.status);
  if (itemsRes.data) {
    console.log('Items sample count returned:', itemsRes.data.length);
    console.log('Items sample:', itemsRes.data);
  }

  // 3. Query movements
  console.log('\n--- 3. Query movements table count and sample ---');
  const movRes = await req('/rest/v1/movements?select=id,item_id,type,date,quantity_pcs,delta,created_at&order=created_at.desc&limit=10');
  console.log('Movements status:', movRes.status);
  if (movRes.data) {
    console.log('Movements sample count returned:', movRes.data.length);
    console.log('Movements sample:', movRes.data);
  }

  // 4. Check for possible tables: raw_materials, raw_movements, recipes, settings, customers, staff
  console.log('\n--- 4. Checking existence of potential missing tables ---');
  const potentialTables = [
    'raw_materials',
    'raw_movements',
    'recipes',
    'admin_settings',
    'settings',
    'customers',
    'staff',
    'sales',
    'orders'
  ];
  for (const pt of potentialTables) {
    const res = await req(`/rest/v1/${pt}?limit=1`);
    console.log(`Table '${pt}': Status ${res.status} ${res.status === 200 ? 'EXISTS' : (res.data?.message || 'NOT FOUND')}`);
  }
}

inspectSupabase().catch(console.error);
