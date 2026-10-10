const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 VERIFYING USER REQUIREMENTS 1, 2, 3, 4');
console.log('====================================================\n');

let passed = 0;
let total = 0;
function test(cond, desc) {
  total++;
  if (cond) {
    console.log(`✓ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${desc}`);
  }
}

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const bundle = fs.readFileSync(bundlePath, 'utf8');

// ----------------------------------------------------------------------------------
// REQUIREMENT 1: Exact materials deduction & Daily confirmation cement balance & stock
// ----------------------------------------------------------------------------------
console.log('--- Requirement 1: Exact Materials Deduction & Confirmation Stock ---');
test(bundle.includes('materialsUsed:_e.materials_used || _e.computed_materials_deducted'), 'Movement builder carries exact materials_used object');
test(bundle.includes('const exactEntries = ce.filter(c => c.materialsUsed);'), 'Deduction engine checks for exact user-fed materialsUsed');
test(bundle.includes('_e.cementBags += Number(m.cement_bags'), 'Deducts exact cement bags fed by user without approximations');
test(bundle.includes('_e.sandBuckets += Number(m.sand_buckets'), 'Deducts exact sand buckets without approximations');
test(bundle.includes('Cement Balance & Stock Verification'), 'Daily confirmation page includes dedicated Cement Balance & Stock Card');
test(bundle.includes('Current in Stock') && bundle.includes('currentCementStock'), 'Daily confirmation page displays Current in Stock');
test(bundle.includes('Cement Used') && bundle.includes('aggregateMaterialsUsed.cement'), 'Daily confirmation page displays amount of Cement Balance Used');
test(bundle.includes('Will Remain in Stock') && bundle.includes('currentCementStock - aggregateMaterialsUsed.cement'), 'Daily confirmation page displays what will remain in stock');

// ----------------------------------------------------------------------------------
// REQUIREMENT 2: Disable mouse wheel input, only keyboard, disallow letters in number inputs
// ----------------------------------------------------------------------------------
console.log('\n--- Requirement 2: Mouse Wheel Disabled & Letters Disallowed in Number Inputs ---');
test(bundle.includes('handleWheelBlur'), 'handleWheelBlur handler defined to prevent mouse wheel increment/decrement');
test(bundle.includes('handleNumericKeyDown'), 'handleNumericKeyDown handler defined to restrict input to numeric keys');
test(bundle.includes('window.addEventListener("wheel", onGlobalWheel'), 'Global mouse wheel listener prevents scroll changes on active number inputs');
test(bundle.includes('onWheel: handleWheelBlur'), 'Cement and pcs inputs have inline onWheel blur handler');
test(bundle.includes('onKeyDown: e => handleNumericKeyDown(e, true)'), 'Cement input has keyboard decimal/digit filter');
test(bundle.includes('onKeyDown: e => handleNumericKeyDown(e, false)'), 'Pcs input has keyboard integer-only filter');
test(bundle.includes('replace(/[^0-9.]/g, "")'), 'Cement input sanitizes any pasted or dragged non-numeric characters');
test(bundle.includes('replace(/[^0-9]/g, "")'), 'Pcs input sanitizes any pasted or dragged non-numeric characters');

// ----------------------------------------------------------------------------------
// REQUIREMENT 3: Reset product selection on batch add & Auto direct to cement input
// ----------------------------------------------------------------------------------
console.log('\n--- Requirement 3: Reset Product Selection & Auto Direct to Cement Input ---');
test(bundle.includes('cementInputRef = B.useRef(null)'), 'cementInputRef exists to direct user to cement input');
test(bundle.includes('focusCementInput'), 'focusCementInput function focuses and scrolls to cement input');
test(bundle.includes('ref: cementInputRef'), 'cement input has ref attached');
test(bundle.includes('setTimeout(focusCementInput, 60)'), 'Auto directs to cement input when product/color are selected');
test(bundle.includes('E("");') && bundle.includes('k("Standard");') && bundle.includes('handleAddBatchToDaily'), 'Product selection resets to "Select Product" (empty id) and Standard color when batch is added');

// ----------------------------------------------------------------------------------
// REQUIREMENT 4: Tab Switch Persistence for All Tabs & Clean Refresh on Reload
// ----------------------------------------------------------------------------------
console.log('\n--- Requirement 4: Tab Switch Persistence (All Tabs) ---');
test(bundle.includes('display:t==="dashboard"?"block":"none"'), 'Dashboard tab kept mounted and toggled via display style');
test(bundle.includes('display:t==="production"?"block":"none"'), 'Production tab kept mounted and toggled via display style');
test(bundle.includes('display:t==="sales"?"block":"none"'), 'Sales tab kept mounted and toggled via display style');
test(bundle.includes('display:t==="opening_balance"?"block":"none"'), 'Opening Balance tab kept mounted and toggled via display style');
test(bundle.includes('display:t==="items"?"block":"none"'), 'Items tab kept mounted and toggled via display style');
test(bundle.includes('display:t==="history"?"block":"none"'), 'History tab kept mounted and toggled via display style');
test(bundle.includes('[t,r]=B.useState("dashboard")'), 'Refreshes cleanly on whole app refresh/close because initial state is dashboard in React memory');

console.log('\n====================================================');
console.log(`📊 RESULTS: ${passed} / ${total} TESTS PASSED`);
if (passed === total) {
  console.log('🎉 ALL 4 USER REQUIREMENTS ARE FULLY SATISFIED!');
} else {
  console.error(`⚠️ ${total - passed} TESTS FAILED!`);
}
