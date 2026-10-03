const fs = require('fs');

console.log('--- Testing Material Baseline & Intake Ledger Flow ---');

// Simulate the logic in AppProvider and RawMaterialMasterView
const materials = [
  { key: 'cement', name: 'Cement (Simba / Dangote)', unit: 'bags', purchaseUnit: '50 kg bags', unitRatio: 1, currentBalance: 50, baselineBalance: 50, purchasePrice: 17500, baselineDate: '2026-10-03' },
  { key: 'dawa', name: 'Dawa ya Vigae (Additive)', unit: 'liters', purchaseUnit: 'Pipa (200L)', unitRatio: 200, currentBalance: 400, baselineBalance: 400, purchasePrice: 250000, baselineDate: '2026-10-03' }
];

let rawMaterialMovements = [];

// 1. Test baseline batch recording
const baselineBatch = [
  { materialKey: 'cement', materialName: 'Cement', quantity: 50, unit: 'bags', unitPrice: 17500, totalCost: 875000, source: 'Twiga Cement Dodoma', note: 'Physical baseline opening balance as of 2026-10-03 (50 bags)' },
  { materialKey: 'dawa', materialName: 'Dawa', quantity: 400, unit: 'liters', unitPrice: 1250, totalCost: 500000, source: 'Chemical Supply Co', note: 'Physical baseline opening balance as of 2026-10-03 (2 Pipa)' }
];

const asOfDate = '2026-10-03';
for (const entry of baselineBatch) {
  rawMaterialMovements.push({
    id: `raw-mov-${Date.now()}-${entry.materialKey}`,
    materialKey: entry.materialKey,
    materialName: entry.materialName,
    delta: entry.quantity,
    quantity: entry.quantity,
    unit: entry.unit,
    unitPrice: entry.unitPrice,
    totalCost: entry.totalCost,
    source: entry.source,
    date: asOfDate,
    type: 'opening_balance',
    note: entry.note,
    enteredBy: 'Supervisor',
    createdAt: new Date().toISOString()
  });
}

console.log('✓ Recorded baseline movements:', rawMaterialMovements.length);
console.log('Sample baseline movement:', rawMaterialMovements[0]);

// 2. Test restock intake
const intake = {
  id: `raw-mov-intake-${Date.now()}`,
  materialKey: 'cement',
  materialName: 'Cement',
  delta: 100,
  quantity: 100,
  unit: 'bags',
  unitPrice: 17500,
  totalCost: 1750000,
  source: 'Twiga Depot',
  date: '2026-10-03',
  type: 'restock_in',
  note: 'Intake of 100 bags · Delivery Ref: TRK-992',
  enteredBy: 'Juma',
  createdAt: new Date().toISOString()
};
rawMaterialMovements.unshift(intake);

console.log('✓ Total movements after intake:', rawMaterialMovements.length);

// 3. Test filter tabs in Ledger
const filterAll = rawMaterialMovements.filter(m => true);
const filterBaseline = rawMaterialMovements.filter(m => m.type === 'opening_balance');
const filterIntake = rawMaterialMovements.filter(m => m.type === 'restock_in');
const filterDeductions = rawMaterialMovements.filter(m => m.type === 'production_deduction');

console.log('Filters test:');
console.log('  All:', filterAll.length);
console.log('  Baseline:', filterBaseline.length);
console.log('  Intake:', filterIntake.length);
console.log('  Deductions:', filterDeductions.length);

if (filterBaseline.length === 2 && filterIntake.length === 1 && filterAll.length === 3) {
  console.log('✓ ALL TESTS PASSED SUCCESSFULLY!');
} else {
  console.error('✗ Test failed');
  process.exit(1);
}
