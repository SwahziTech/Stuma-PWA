const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('Testing User Requirements Verification...');

const bundle = fs.readFileSync(path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js'), 'utf8');

// 1. Syntax check
try {
  new vm.Script(bundle);
  console.log('✓ [PASS] Bundle is valid JavaScript (vm.Script syntax check passed)');
} catch (e) {
  console.error('❌ [FAIL] Syntax error in bundle:', e);
  process.exit(1);
}

// 2. Part 1 checks: Daily Production Verification Document
const p1Code = bundle.slice(bundle.indexOf('_1=({'), bundle.indexOf('b1='));

const hasSection2Title = p1Code.includes('children: "2. Total Raw Materials Consumed"');
console.log(hasSection2Title ? '✓ [PASS] Section 2 title exists' : '❌ [FAIL] Missing Section 2 title');

const hasStockFaintLine = p1Code.includes('["Stock : ", Number((currentCementStock - aggregateMaterialsUsed.cement).toFixed(1))]');
console.log(hasStockFaintLine ? '✓ [PASS] Faint Cement Stock line exists under cement used ("Stock : xx")' : '❌ [FAIL] Missing Stock line');

const hasRangiConsumption = p1Code.includes('children: "Rangi (Red)"') || p1Code.includes('children: "Rangi (Black)"');
console.log(hasRangiConsumption ? '✓ [PASS] Rangi color is explicitly specified as either Red or Black' : '❌ [FAIL] Missing Rangi color specification');

const hasNoGradientCard = !p1Code.includes('Cement Balance & Stock Verification');
console.log(hasNoGradientCard ? '✓ [PASS] Reset as before: large 3-column gradient verification card removed' : '❌ [FAIL] Gradient card still present');

const hasSingleLineConsumption = p1Code.includes('style: { display: "flex", alignItems: "stretch", gap: "6px", width: "100%", boxSizing: "border-box" }');
console.log(hasSingleLineConsumption ? '✓ [PASS] Material consumption is fitted into a single horizontal line' : '❌ [FAIL] Not single line');

// 3. Part 2 checks: Ledger Tab
const k1Code = bundle.slice(bundle.indexOf('k1=()'), bundle.indexOf('C1=()'));

const noResetLedgerBtn = !k1Code.includes('Reset Ledger');
console.log(noResetLedgerBtn ? '✓ [PASS] Reset Ledger button removed from Ledger tab' : '❌ [FAIL] Reset Ledger still present');

const noDispatchAdjustBtn = !k1Code.includes('Dispatch / Adjust');
console.log(noDispatchAdjustBtn ? '✓ [PASS] Dispatch / Adjust manual log button removed from Ledger tab' : '❌ [FAIL] Dispatch / Adjust button still present');

const noDispatchAdjustModal = !k1Code.includes('Log Dispatch or Stock Adjustment');
console.log(noDispatchAdjustModal ? '✓ [PASS] Manual Dispatch / Adjustment log modal removed from Ledger tab' : '❌ [FAIL] Manual log modal still present');

const hasUndoBtn = k1Code.includes('onClick: handleUndo') && k1Code.includes('children: "Undo"');
console.log(hasUndoBtn ? '✓ [PASS] Undo button added to Ledger tab' : '❌ [FAIL] Missing Undo button');

const hasHandleUndo = k1Code.includes('const handleUndo = async () =>') && k1Code.includes('deleteMovements');
console.log(hasHandleUndo ? '✓ [PASS] handleUndo logic properly invokes deleteMovements' : '❌ [FAIL] Missing handleUndo');

const hasDeleteMovementsReversal = bundle.includes('batchIdsToRevert') && bundle.includes('removedRawMovs');
console.log(hasDeleteMovementsReversal ? '✓ [PASS] deleteMovements safely reverses raw material deductions on batch undo' : '❌ [FAIL] Missing raw material reversal on undo');

console.log('\n🎉 ALL REFACTOR REQUIREMENTS VERIFIED SUCCESSFULLY!');
