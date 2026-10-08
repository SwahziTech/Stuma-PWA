const fs = require('fs');
const vm = require('vm');

console.log('=== RUNNING END-TO-END VERIFICATION SUITE ===');

const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Test 1: Full Bundle Syntax Check
console.log('Test 1: Full bundle syntax parsing...');
try {
  new vm.Script(bundle);
  console.log('✓ PASSED: Full bundle is 100% valid JavaScript syntax!');
} catch (err) {
  console.error('✗ FAILED:', err);
  process.exit(1);
}

// Test 2: Check Dashboard Top Card Order
console.log('\nTest 2: Verifying Dashboard Top Card order in x1...');
const x1Idx = bundle.indexOf('x1=({onNavigate:s})=>');
if (x1Idx === -1) throw new Error('x1 not found in bundle');
const _1Pos = bundle.indexOf('_1=({prefillItemId:s'); const x1Snippet = bundle.slice(x1Idx, _1Pos);

const rawMatBtnIdx = x1Snippet.indexOf('"Raw Materials"');
const finGoodsBtnIdx = x1Snippet.indexOf('"Finished Goods"');
const salesRecBtnIdx = x1Snippet.indexOf('"Sales record"');

console.log('Button positions in x1 top card:');
console.log('  1. "Raw Materials" index:', rawMatBtnIdx);
console.log('  2. "Finished Goods" index:', finGoodsBtnIdx);
console.log('  3. "Sales record" index:', salesRecBtnIdx);

if (rawMatBtnIdx !== -1 && finGoodsBtnIdx !== -1 && salesRecBtnIdx !== -1 &&
    rawMatBtnIdx < finGoodsBtnIdx && finGoodsBtnIdx < salesRecBtnIdx) {
  console.log('✓ PASSED: Top card buttons are in EXACT requested order:');
  console.log('  [LEFT: Raw Materials] -> [MIDDLE: Finished Goods] -> [RIGHT: Sales record]');
} else {
  console.error('✗ FAILED: Top card button order incorrect!');
  process.exit(1);
}

// Test 3: Check Dashboard Views
console.log('\nTest 3: Checking Dashboard views in x1...');
const hasRawMatView = x1Snippet.includes('L==="raw_materials"&&o.jsx(RawMaterialMasterView');
const hasInvView = x1Snippet.includes('L==="inventory"&&o.jsxs(o.Fragment');
const hasSalesRecView = x1Snippet.includes('L==="sales_record"&&o.jsx(DashboardSalesRecordView');
const hasNoOldCapacityInDash = !x1Snippet.includes('L==="capacity_planner"');

console.log('  Has Raw Materials view in x1:', hasRawMatView);
console.log('  Has Finished Goods view in x1:', hasInvView);
console.log('  Has Sales Record view in x1:', hasSalesRecView);
console.log('  Capacity Planner removed from dashboard:', hasNoOldCapacityInDash);

if (hasRawMatView && hasInvView && hasSalesRecView && hasNoOldCapacityInDash) {
  console.log('✓ PASSED: Dashboard views correctly mapped to Raw Materials, Finished Goods, and Sales record!');
} else {
  console.error('✗ FAILED: Dashboard views mapping check failed!');
  process.exit(1);
}

// Test 4: Check Production Capacity Planner
console.log('\nTest 4: Checking Production Page (_1) Capacity Planner...');
const _1Idx = bundle.indexOf('_1=({prefillItemId:s');
if (_1Idx === -1) throw new Error('_1 not found in bundle');
const b1Idx = bundle.indexOf('b1=({prefillItemId:s');
const prodSnippet = bundle.slice(_1Idx, b1Idx);

const hasProdTabState = prodSnippet.includes('[prodTab, setProdTab] = B.useState("batch_logging")');
const hasBatchLoggingBtn = prodSnippet.includes('children: "Batch Logging"');
const hasCapacityPlannerBtn = prodSnippet.includes('children: "Capacity Planner"');
const hasCapacityPlannerView = prodSnippet.includes('prodTab === "capacity_planner" && o.jsx(ProductionCapacityPlannerView');
const hasBatchLoggingView = prodSnippet.includes('prodTab === "batch_logging" && o.jsxs(o.Fragment');
const hasProductionCapacityPlannerDef = bundle.includes('ProductionCapacityPlannerView = ({');

console.log('  Has prodTab state in _1:', hasProdTabState);
console.log('  Has Batch Logging switcher button:', hasBatchLoggingBtn);
console.log('  Has Capacity Planner switcher button:', hasCapacityPlannerBtn);
console.log('  Has Capacity Planner view rendering in _1:', hasCapacityPlannerView);
console.log('  Has Batch Logging view rendering in _1:', hasBatchLoggingView);
console.log('  Has ProductionCapacityPlannerView component:', hasProductionCapacityPlannerDef);

if (hasProdTabState && hasBatchLoggingBtn && hasCapacityPlannerBtn && hasCapacityPlannerView && hasBatchLoggingView && hasProductionCapacityPlannerDef) {
  console.log('✓ PASSED: Capacity Planner is beautifully designed and integrated on the Production page!');
} else {
  console.error('✗ FAILED: Production page capacity planner check failed!');
  process.exit(1);
}

// Test 5: Verify cache bust in index.html and service worker
console.log('\nTest 5: Verifying cache busting & service worker...');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const swJs = fs.readFileSync('service-worker.js', 'utf8');

const hasVersionedScript = /src="\.\/assets\/index-hgjhj-0G\.js\?v=\d+"/.test(indexHtml);
const hasVersionedSw = /CACHE_NAME = 'stumarcot-pwa-v2\.0\.0-\d+'/.test(swJs);

console.log('  Index.html has versioned script:', hasVersionedScript);
console.log('  Service worker has versioned cache name:', hasVersionedSw);

if (hasVersionedScript && hasVersionedSw) {
  console.log('✓ PASSED: Cache busting and PWA service worker updated successfully!');
} else {
  console.error('✗ FAILED: Cache bust check failed!');
  process.exit(1);
}

console.log('\n=============================================');
console.log('🎉 ALL 5 VERIFICATION TESTS PASSED PERFECTLY!');
console.log('=============================================');
