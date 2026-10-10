const fs = require('fs');

console.log('--- TESTING NEW UNIFIED LEDGER COMPONENT (k1) ---');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// 1. Check that k1 exists
const k1Idx = bundle.indexOf('k1=');
const c1Idx = bundle.indexOf('C1=', k1Idx);
if (k1Idx === -1 || c1Idx === -1) {
  console.error('FAIL: k1 or C1 not found');
  process.exit(1);
}
const k1Code = bundle.slice(k1Idx, c1Idx);
console.log('✓ k1 component present, length:', k1Code.length);

// 2. Verify all 4 tabs exist in k1:
const tabs = ['All (', 'Production (', 'Sales (', 'Materials ('];
for (const tab of tabs) {
  if (k1Code.includes(tab)) {
    console.log('✓ Verified tab in ledger:', tab);
  } else {
    console.error('FAIL: Missing tab:', tab);
    process.exit(1);
  }
}

// 3. Verify handlers:
if (k1Code.includes('handleDeleteMovement') && k1Code.includes('handleDeleteRawMovement') && k1Code.includes('handleUndo')) {
  console.log('✓ Verified handleDeleteMovement, handleDeleteRawMovement, and handleUndo');
} else {
  console.error('FAIL: Missing delete or undo handlers');
  process.exit(1);
}

// 4. Verify unified movements sorting and combination:
if (k1Code.includes('unifiedMovements') && k1Code.includes('isRaw')) {
  console.log('✓ Verified unifiedMovements combining finished goods and raw materials');
} else {
  console.error('FAIL: Missing unifiedMovements logic');
  process.exit(1);
}

// 5. Verify metrics: Cement Used and Sales revenue
if (k1Code.includes('Cement Used:') && k1Code.includes('Sales:')) {
  console.log('✓ Verified Cement Used and Sales revenue metrics in ledger');
} else {
  console.error('FAIL: Missing domain summary metrics');
  process.exit(1);
}

console.log('🎉 ALL LEDGER VERIFICATIONS PASSED SUCCESSFULLY!');
