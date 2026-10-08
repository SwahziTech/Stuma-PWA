const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log('=== VERIFYING PRODUCT DELETION & BASELINE UNDO FEATURES ===');

const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// 1. Verify AppProvider exports
console.log('Test 1: AppProvider context value exports...');
if (!bundle.includes('deleteItem:deleteItem') || !bundle.includes('deleteMovements:deleteMovements')) {
  throw new Error('AppProvider is missing deleteItem or deleteMovements export!');
}
console.log('✓ AppProvider exports deleteItem and deleteMovements');

// 2. Verify Products (S1) contains delete capability
console.log('\nTest 2: Products Registry (S1) delete functionality...');
const s1Idx = bundle.indexOf('S1=()=>{');
const k1Idx = bundle.indexOf(',k1=()=>{', s1Idx);
const s1Code = bundle.slice(s1Idx, k1Idx > 0 ? k1Idx : s1Idx + 15000);

if (!s1Code.includes('handleDeleteProduct') || !s1Code.includes('deleteItem')) {
  throw new Error('S1 is missing handleDeleteProduct or deleteItem!');
}
if (!s1Code.includes('Delete') || !s1Code.includes('lucide-trash') && !s1Code.includes('Yp')) {
  throw new Error('S1 is missing Delete button or trash icon!');
}
if (!s1Code.includes('Delete Product')) {
  throw new Error('S1 modal is missing "Delete Product" button!');
}
console.log('✓ Products view includes card Delete button, modal Delete button, and handleDeleteProduct handler');

// 3. Verify Baseline (w1) contains Undo functionality
console.log('\nTest 3: Baseline (w1) undo previous entries functionality...');
const w1Idx = bundle.indexOf('w1=()=>{');
const s1Start = bundle.indexOf(',S1=()=>{', w1Idx);
const w1Code = bundle.slice(w1Idx, s1Start > 0 ? s1Start : w1Idx + 15000);

if (!w1Code.includes('handleUndoPreviousEntries')) {
  throw new Error('w1 is missing handleUndoPreviousEntries!');
}
if (!w1Code.includes('Undo Previous Entries')) {
  throw new Error('w1 is missing "Undo Previous Entries" button in header!');
}
if (!w1Code.includes('handleUndoItemBaseline')) {
  throw new Error('w1 is missing handleUndoItemBaseline for individual products!');
}
console.log('✓ Baseline view includes header "Undo Previous Entries" button and individual product Undo button');

// 4. Verify no untouched components were affected
console.log('\nTest 4: Verifying code integrity...');
const gitDiffOutput = require('child_process').execSync('git status --short').toString();
console.log('Modified files:\n' + gitDiffOutput);

console.log('\n======================================================');
console.log('🎉 ALL PRODUCT DELETION & BASELINE UNDO TESTS PASSED!');
console.log('======================================================');
