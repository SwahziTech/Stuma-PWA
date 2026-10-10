const url = 'https://jbbawnuhlollasflzgrg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiYmF3bnVobG9sbGFzZmx6Z3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzOTMxMzcsImV4cCI6MjEwNDk2OTEzN30.VWB8DxD5Mc0whJkjiaOo7TzKwnWqwPMkdfvbhD3ZHJI';

const headers = {
  'apikey': key,
  'Authorization': 'Bearer ' + key,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function run() {
  console.log('--- 1. Fetching Production Movements to Undo ---');
  const movRes = await fetch(`${url}/rest/v1/movements?type=eq.production_in&select=*`, { headers });
  const prods = await movRes.json();
  console.log(`Found ${prods.length} production movements:`);
  for (const p of prods) {
    console.log(`- ID: ${p.id} | Item: ${p.item_id} | Qty: ${p.quantity_pcs} pcs | Note: ${p.note}`);
  }

  if (prods.length === 0) {
    console.log('No production movements to delete.');
    return;
  }

  const prodIds = prods.map(p => p.id);
  const batchIds = Array.from(new Set(prods.map(p => p.batch_id).filter(Boolean)));
  console.log('Associated batch IDs:', batchIds);

  console.log('\n--- 2. Fetching Raw Material Deductions to Revert ---');
  const rawMovRes = await fetch(`${url}/rest/v1/raw_movements?type=eq.production_deduction&select=*`, { headers });
  const rawDeductions = await rawMovRes.json();
  console.log(`Found ${rawDeductions.length} raw deduction movements:`);
  for (const rd of rawDeductions) {
    console.log(`- Mat: ${rd.material_key} | Delta: ${rd.delta} | Qty: ${rd.quantity} ${rd.unit}`);
  }

  console.log('\n--- 3. Restoring Raw Material Balances ---');
  for (const rd of rawDeductions) {
    // Fetch current balance
    const matRes = await fetch(`${url}/rest/v1/raw_materials?id=eq.${rd.material_key}&select=*`, { headers });
    const mats = await matRes.json();
    if (mats && mats.length > 0) {
      const current = mats[0];
      const restoredBalance = Number((current.current_balance + Number(rd.quantity)).toFixed(2));
      console.log(`Restoring ${rd.material_key}: current ${current.current_balance} + ${rd.quantity} = ${restoredBalance}`);
      
      const updateRes = await fetch(`${url}/rest/v1/raw_materials?id=eq.${rd.material_key}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          current_balance: restoredBalance,
          last_updated: new Date().toISOString()
        })
      });
      const updated = await updateRes.json();
      console.log(`✓ Updated ${rd.material_key} to:`, updated[0]?.current_balance);
    }
  }

  console.log('\n--- 4. Deleting Raw Material Production Deductions ---');
  const delRawRes = await fetch(`${url}/rest/v1/raw_movements?type=eq.production_deduction`, {
    method: 'DELETE',
    headers
  });
  console.log('✓ Raw deductions deleted. HTTP status:', delRawRes.status);

  console.log('\n--- 5. Deleting Production Movements ---');
  const delMovRes = await fetch(`${url}/rest/v1/movements?id=in.(${prodIds.join(',')})`, {
    method: 'DELETE',
    headers
  });
  console.log('✓ Production movements deleted. HTTP status:', delMovRes.status);

  console.log('\n--- 6. Verification ---');
  const verifyMovs = await (await fetch(`${url}/rest/v1/movements?type=eq.production_in&select=id`, { headers })).json();
  console.log('Remaining production_in movements count:', verifyMovs.length);

  const verifyRawMovs = await (await fetch(`${url}/rest/v1/raw_movements?type=eq.production_deduction&select=id`, { headers })).json();
  console.log('Remaining production_deduction raw movements count:', verifyRawMovs.length);

  const verifyMats = await (await fetch(`${url}/rest/v1/raw_materials?select=id,current_balance`, { headers })).json();
  console.log('Current raw materials balances:', verifyMats.filter(m => ['cement', 'mchanga_laini', 'chipping', 'dawa'].includes(m.id)));

  console.log('\n🎉 Successfully undid the last 3 productions and restored raw materials stock!');
}

run().catch(console.error);
