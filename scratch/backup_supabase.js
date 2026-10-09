const https = require('https');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
let url = '', anonKey = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) anonKey = line.split('=')[1].trim();
});

function fetchAll(endpoint) {
  return new Promise((resolve, reject) => {
    const u = new URL(`${url}${endpoint}`);
    const req = https.request(u, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(d));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function backup() {
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  console.log(`Starting backup of Supabase data at ${timestamp}...`);

  const items = await fetchAll('/rest/v1/items?select=*&order=id.asc');
  console.log(`Fetched ${items.length} items from Supabase.`);
  const itemsFile = path.join(backupDir, `supabase_items_backup_${timestamp}.json`);
  fs.writeFileSync(itemsFile, JSON.stringify(items, null, 2), 'utf8');

  const movements = await fetchAll('/rest/v1/movements?select=*&order=created_at.desc');
  console.log(`Fetched ${movements.length} movements from Supabase.`);
  const movementsFile = path.join(backupDir, `supabase_movements_backup_${timestamp}.json`);
  fs.writeFileSync(movementsFile, JSON.stringify(movements, null, 2), 'utf8');

  // Also create a "latest" snapshot
  fs.writeFileSync(path.join(backupDir, 'supabase_items_latest.json'), JSON.stringify(items, null, 2), 'utf8');
  fs.writeFileSync(path.join(backupDir, 'supabase_movements_latest.json'), JSON.stringify(movements, null, 2), 'utf8');

  console.log('✅ Backup completed successfully in scratch/backups/');
}

backup().catch(console.error);
