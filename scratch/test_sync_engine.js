const {
  mapRawMaterialFromDb,
  mapRawMaterialToDb,
  mapRawMovementFromDb,
  mapRawMovementToDb
} = require('./supabase_sync_engine');

console.log('--- Testing Data Mapping ---');

// Test 1: Raw Material round-trip
const clientMat = {
  no: 1,
  key: 'cement',
  category: 'Cement',
  name: 'Cement',
  nameSwahili: 'Saruji (Mifuko)',
  unit: 'bags',
  displayUnit: '50 kg bags',
  purchaseUnit: '50 kg bags',
  unitRatio: 1,
  currentBalance: 120.5,
  baselineBalance: 100,
  purchasePrice: 18500,
  reorderLevel: 80,
  source: 'Local Supplier',
  notes: 'High tensile Portland cement',
  legacyKeys: ['cement_50kg'],
  baselineDate: '2026-10-01',
  lastUpdated: '2026-10-09T10:00:00.000Z'
};

const dbRow = mapRawMaterialToDb(clientMat);
console.log('Mapped to DB row:', dbRow);
if (dbRow.id !== 'cement' || dbRow.current_balance !== 120.5 || dbRow.name_swahili !== 'Saruji (Mifuko)') {
  throw new Error('mapRawMaterialToDb failed');
}

const backToClient = mapRawMaterialFromDb(dbRow);
console.log('Mapped back to Client:', backToClient);
if (backToClient.key !== 'cement' || backToClient.currentBalance !== 120.5 || backToClient.nameSwahili !== 'Saruji (Mifuko)') {
  throw new Error('mapRawMaterialFromDb failed');
}

// Test 2: Raw Movement round-trip
const clientMov = {
  id: 'raw-mov-test-1',
  materialKey: 'cement',
  materialName: 'Cement',
  delta: 50,
  quantity: 50,
  unit: 'bags',
  unitPrice: 18500,
  totalCost: 925000,
  source: 'Factory Intake',
  date: '2026-10-09',
  type: 'restock_in',
  relatedBatchId: null,
  note: 'Delivered by truck #5',
  enteredBy: 'Supervisor Juma',
  createdAt: '2026-10-09T12:00:00.000Z'
};

const dbMovRow = mapRawMovementToDb(clientMov);
console.log('Mapped movement to DB row:', dbMovRow);
if (dbMovRow.material_key !== 'cement' || dbMovRow.unit_price !== 18500 || dbMovRow.total_cost !== 925000) {
  throw new Error('mapRawMovementToDb failed');
}

const backToClientMov = mapRawMovementFromDb(dbMovRow);
console.log('Mapped movement back to Client:', backToClientMov);
if (backToClientMov.materialKey !== 'cement' || backToClientMov.unitPrice !== 18500) {
  throw new Error('mapRawMovementFromDb failed');
}

console.log('✅ ALL MAPPING UNIT TESTS PASSED!');
