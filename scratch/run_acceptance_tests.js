const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('====================================================');
console.log('🧪 STUMARCOT ERP — AUTOMATED ACCEPTANCE TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✓ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

// ----------------------------------------------------
// TEST GROUP 1: DATABASE INTEGRITY & RECORD PRESERVATION
// ----------------------------------------------------
console.log('--- Test Group 1: Database & Backup Preservation ---');
const itemsBackup = JSON.parse(fs.readFileSync(path.join(__dirname, 'backups', 'supabase_items_latest.json'), 'utf8'));
const movsBackup = JSON.parse(fs.readFileSync(path.join(__dirname, 'backups', 'supabase_movements_latest.json'), 'utf8'));

assert(itemsBackup.length === 66, `Existing items preserved in backup (expected 66, got ${itemsBackup.length})`);
assert(movsBackup.length === 118, `Existing movements preserved in backup (expected 118, got ${movsBackup.length})`);
assert(movsBackup.every(m => m.type === 'opening_balance'), 'All historical movements preserved with correct type');

// ----------------------------------------------------
// TEST GROUP 2: RECONCILED CATALOG ITEMS
// ----------------------------------------------------
console.log('\n--- Test Group 2: Product ID Reconciliation ---');
const migrationSql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20261009150000_repair_stuma_erp_schema.sql'), 'utf8');

assert(migrationSql.includes("'item-hb-01'"), 'Migration contains canonical item-hb-01 reconciliation');
assert(migrationSql.includes("'item-hb-02'"), 'Migration contains canonical item-hb-02 reconciliation');
assert(migrationSql.includes("'item-pb-13'"), 'Migration contains canonical item-pb-13 reconciliation');
assert(migrationSql.includes('ON CONFLICT (id) DO UPDATE'), 'Reconciliation uses idempotent ON CONFLICT');

// ----------------------------------------------------
// TEST GROUP 3: RAW MATERIAL SCHEMA & SEEDING
// ----------------------------------------------------
console.log('\n--- Test Group 3: Raw Material Schema Definition ---');
assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.raw_materials'), 'Migration defines public.raw_materials');
assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.raw_movements'), 'Migration defines public.raw_movements');
assert(migrationSql.includes('ALTER PUBLICATION supabase_realtime ADD TABLE public.raw_materials'), 'Realtime replication configured for raw_materials');
assert(migrationSql.includes('ALTER PUBLICATION supabase_realtime ADD TABLE public.raw_movements'), 'Realtime replication configured for raw_movements');

// ----------------------------------------------------
// TEST GROUP 4: DATA MAPPING & ROUND-TRIP
// ----------------------------------------------------
console.log('\n--- Test Group 4: Client <-> DB Mapping Integrity ---');
const {
  mapRawMaterialFromDb,
  mapRawMaterialToDb,
  mapRawMovementFromDb,
  mapRawMovementToDb
} = require('./supabase_sync_engine');

const testMat = {
  key: 'cement',
  no: 1,
  category: 'Cement',
  name: 'Cement',
  nameSwahili: 'Saruji (Mifuko)',
  unit: 'bags',
  currentBalance: 50.75,
  purchasePrice: 18000
};

const row = mapRawMaterialToDb(testMat);
assert(row.id === 'cement' && row.current_balance === 50.75, 'Raw material correctly mapped to snake_case DB row');
const clientMat = mapRawMaterialFromDb(row);
assert(clientMat.key === 'cement' && clientMat.currentBalance === 50.75, 'Raw material correctly mapped back to camelCase client model');

// ----------------------------------------------------
// TEST GROUP 5: OUTBOX ENQUEUEING & IDEMPOTENCY
// ----------------------------------------------------
console.log('\n--- Test Group 5: Offline Outbox & Queue Deduplication ---');
const mockStorage = {};
global.localStorage = {
  getItem: k => mockStorage[k] || null,
  setItem: (k, v) => mockStorage[k] = String(v)
};

const { enqueueOutbox, getOutbox, removeFromOutbox, OUTBOX_KEYS } = require('./supabase_sync_engine');

enqueueOutbox(OUTBOX_KEYS.MOVEMENTS, [{ id: 'mov-1', delta: 10 }, { id: 'mov-2', delta: 20 }]);
let queue = getOutbox(OUTBOX_KEYS.MOVEMENTS);
assert(queue.length === 2, `Outbox holds 2 transactions (got ${queue.length})`);

// Duplicate enqueue check
enqueueOutbox(OUTBOX_KEYS.MOVEMENTS, [{ id: 'mov-1', delta: 10 }]);
queue = getOutbox(OUTBOX_KEYS.MOVEMENTS);
assert(queue.length === 2, 'Duplicate transaction ID rejected by outbox (idempotent enqueue)');

// Removal after commit
removeFromOutbox(OUTBOX_KEYS.MOVEMENTS, ['mov-1']);
queue = getOutbox(OUTBOX_KEYS.MOVEMENTS);
assert(queue.length === 1 && queue[0].id === 'mov-2', 'Committed transaction removed from outbox; remaining preserved');

// ----------------------------------------------------
// TEST GROUP 6: BUNDLE INTEGRITY & CACHE ALIGNMENT
// ----------------------------------------------------
console.log('\n--- Test Group 6: Production Bundle & Service Worker ---');
const bundleCode = fs.readFileSync(path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js'), 'utf8');
const swCode = fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert(bundleCode.includes('stuma-realtime-sync'), 'Bundle contains Supabase Realtime synchronization listener');
assert(bundleCode.includes('stumarcot_pending_movements_queue'), 'Bundle contains durable offline outbox integration');
assert(bundleCode.includes('fetchRawMaterialsCloud'), 'Bundle contains Raw Materials cloud fetching');
assert(bundleCode.includes('syncRawMovementsCloud'), 'Bundle contains Raw Material Movements cloud persistence');

const swMatch = swCode.match(/const CACHE_NAME = ['"]stumarcot-pwa-v2\.1\.\d+-(\d+)['"];/);
assert(swMatch !== null, 'Service Worker cache version bumped to v2.1.x');

if (swMatch) {
  const swTimestamp = swMatch[1];
  assert(indexHtml.includes(`index-hgjhj-0G.js?v=${swTimestamp}`), 'index.html asset version query string matches Service Worker CACHE_NAME timestamp');
}

// ----------------------------------------------------
// TEST SUMMARY
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('🎉 ALL INTEGRATION & REGRESSION TESTS PASSED!');
} else {
  console.error(`⚠️ ${totalTests - passedTests} TESTS FAILED!`);
  process.exit(1);
}
console.log('====================================================\n');
