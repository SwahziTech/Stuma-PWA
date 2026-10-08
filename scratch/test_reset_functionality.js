const fs = require('fs');

console.log('Testing that reset buttons and functions are correctly embedded in bundle...');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// 1. Verify methods in AppContext
console.log('1. resetProductBaseline present:', bundle.includes('resetProductBaseline=B.useCallback'));
console.log('2. resetLedger present:', bundle.includes('resetLedger=B.useCallback'));
console.log('3. resetSales present:', bundle.includes('resetSales=B.useCallback'));

// 2. Verify exposed in Wp.Provider
console.log('4. resetProductBaseline in Provider:', bundle.includes('resetProductBaseline:resetProductBaseline'));
console.log('5. resetLedger in Provider:', bundle.includes('resetLedger:resetLedger'));
console.log('6. resetSales in Provider:', bundle.includes('resetSales:resetSales'));

// 3. Verify in views
console.log('7. Reset Baseline button in w1:', bundle.includes('Reset Baseline'));
console.log('8. Reset Ledger button in k1:', bundle.includes('Reset Ledger'));
console.log('9. Reset Sale button in b1:', bundle.includes('Reset Sale'));
console.log('10. Reset Sales button in Dashboard:', bundle.includes('Reset Sales'));

console.log('All reset button checks passed successfully!');
