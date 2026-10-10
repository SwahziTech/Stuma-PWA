const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

// 1. Initial State in AppProvider: filter to baseline on load
const oldInitialMovs = `[w,E]=B.useState(()=>{
          const V=localStorage.getItem(cp);
          if(V) try {
            return JSON.parse(V);
          } catch(J){
            console.error("Failed to parse local movements:",J);
          }
          return [];
        }),`;

const newInitialMovs = `[w,E]=B.useState(()=>{
          const V=localStorage.getItem(cp);
          if(V) try {
            return JSON.parse(V).filter(m => m.type === "opening_balance");
          } catch(J){
            console.error("Failed to parse local movements:",J);
          }
          return [];
        }),`;

if (bundle.includes(oldInitialMovs)) {
  bundle = bundle.replace(oldInitialMovs, newInitialMovs);
  console.log('✓ 1. Filtered initial movements state to opening_balance only');
}

// 2. Initial Raw Movements state: filter to baseline on load
const oldInitialRawMovs = `[A,L]=B.useState(()=>{
          const V=localStorage.getItem(Zl);
          if(V) try {
            return JSON.parse(V);
          } catch(J){
            console.error("Failed to parse local raw movements:",J);
          }
          return [];
        }),`;

const newInitialRawMovs = `[A,L]=B.useState(()=>{
          const V=localStorage.getItem(Zl);
          if(V) try {
            return JSON.parse(V).filter(m => m.type === "opening_balance");
          } catch(J){
            console.error("Failed to parse local raw movements:",J);
          }
          return [];
        }),`;

if (bundle.includes(oldInitialRawMovs)) {
  bundle = bundle.replace(oldInitialRawMovs, newInitialRawMovs);
  console.log('✓ 2. Filtered initial raw movements state to opening_balance only');
}

// 3. Reconcile Finished Goods Movements: set to cloud opening_balance only
const oldReconcileMovs = `// 2. Reconcile Finished Goods Movements (Merging truly pending local rows only)
      if(movsRes.status==='fulfilled' && movsRes.value){
        isConnected = !0;
        const cloudMovs = movsRes.value;
        const pendingQueue = readQueue(QUEUE_KEYS.MOVEMENTS) || [];
        const pendingIds = new Set(pendingQueue.map(m => m.id));
        E(prev => {
          const cloudIds = new Set(cloudMovs.map(m=>m.id));
          const localUncommitted = prev.filter(m => !cloudIds.has(m.id) && pendingIds.has(m.id));
          return [...localUncommitted, ...cloudMovs];
        });
      }`;

const newReconcileMovs = `// 2. Reconcile Finished Goods Movements (Cloud baseline only)
      if(movsRes.status==='fulfilled' && movsRes.value){
        isConnected = !0;
        const cloudMovs = movsRes.value.filter(m => m.type === "opening_balance");
        E(cloudMovs);
      }`;

if (bundle.includes(oldReconcileMovs)) {
  bundle = bundle.replace(oldReconcileMovs, newReconcileMovs);
  console.log('✓ 3. Reconcile movements directly to cloud baseline');
}

// 4. Reconcile Raw Material Movements: set to cloud opening_balance only
const oldReconcileRaw = `// 4. Reconcile Raw Material Movements (Merging truly pending raw rows only)
      if(rawMovsRes.status==='fulfilled' && rawMovsRes.value){
        isConnected = !0;
        const cloudRawMovs = rawMovsRes.value;
        const pendingRawQueue = readQueue(QUEUE_KEYS.RAW_MOVEMENTS) || [];
        const pendingRawIds = new Set(pendingRawQueue.map(m => m.id));
        L(prev => {
          const cloudIds = new Set(cloudRawMovs.map(m=>m.id));
          const localUncommitted = prev.filter(m => !cloudIds.has(m.id) && pendingRawIds.has(m.id));
          return [...localUncommitted, ...cloudRawMovs];
        });
      }`;

const newReconcileRaw = `// 4. Reconcile Raw Material Movements (Cloud baseline only)
      if(rawMovsRes.status==='fulfilled' && rawMovsRes.value){
        isConnected = !0;
        const cloudRawMovs = rawMovsRes.value.filter(m => m.type === "opening_balance");
        L(cloudRawMovs);
      }`;

if (bundle.includes(oldReconcileRaw)) {
  bundle = bundle.replace(oldReconcileRaw, newReconcileRaw);
  console.log('✓ 4. Reconcile raw movements directly to cloud baseline');
}

// 5. Outbox flusher: strip non-baseline entries
const oldFlushMovs = `// 1. Flush movements queue
    const pendingMovs = readQueue(QUEUE_KEYS.MOVEMENTS);
    if(pendingMovs.length > 0){
      try {
        const {error} = await client.from("movements").upsert(pendingMovs, {onConflict:"id"});
        if(!error){
          removeFromQueue(QUEUE_KEYS.MOVEMENTS, pendingMovs.map(m=>m.id));
          console.log(\`[Outbox] Successfully flushed \${pendingMovs.length} queued movements to Supabase\`);
        }
      } catch(e){}
    }`;

const newFlushMovs = `// 1. Flush movements queue
    const rawPending = readQueue(QUEUE_KEYS.MOVEMENTS);
    const nonBaseline = rawPending.filter(m => m.type !== "opening_balance");
    if(nonBaseline.length > 0){
      removeFromQueue(QUEUE_KEYS.MOVEMENTS, nonBaseline.map(m => m.id));
    }
    const pendingMovs = readQueue(QUEUE_KEYS.MOVEMENTS);
    if(pendingMovs.length > 0){
      try {
        const {error} = await client.from("movements").upsert(pendingMovs, {onConflict:"id"});
        if(!error){
          removeFromQueue(QUEUE_KEYS.MOVEMENTS, pendingMovs.map(m=>m.id));
          console.log(\`[Outbox] Successfully flushed \${pendingMovs.length} queued movements to Supabase\`);
        }
      } catch(e){}
    }`;

if (bundle.includes(oldFlushMovs)) {
  bundle = bundle.replace(oldFlushMovs, newFlushMovs);
  console.log('✓ 5. Outbox flusher strips non-baseline movements');
}

// Check syntax
console.log('Testing bundle syntax with vm.Script...');
try {
  new vm.Script(bundle);
  console.log('✓ Bundle syntax PASSED!');
} catch(e) {
  console.error('Syntax error:', e);
  process.exit(1);
}

fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log('✓ Written updated bundle to assets/index-hgjhj-0G.js');

// 6. Update index.html
const htmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const prebootstrapPurge = `
          // Purge non-baseline movements from all local caches
          try {
            var mRaw = localStorage.getItem("stumarcot_local_movements");
            if (mRaw) {
              var mL = JSON.parse(mRaw);
              localStorage.setItem("stumarcot_local_movements", JSON.stringify(mL.filter(function(m){ return m.type === "opening_balance"; })));
            }
            localStorage.setItem("stumarcot_pending_movements_queue", "[]");
            localStorage.setItem("stumarcot_pending_raw_movements_queue", "[]");
            var rRaw = localStorage.getItem("stumarcot_raw_movements");
            if (rRaw) {
              var rL = JSON.parse(rRaw);
              localStorage.setItem("stumarcot_raw_movements", JSON.stringify(rL.filter(function(m){ return m.type === "opening_balance"; })));
            }
          } catch(e) {}
`;

if (!html.includes('Purge non-baseline movements from all local caches')) {
  html = html.replace('console.warn("[PWA] LocalStorage access warning:", e);', `console.warn("[PWA] LocalStorage access warning:", e);\n        }${prebootstrapPurge}`);
  console.log('✓ 6. Added pre-bootstrap purge in index.html');
}

// Auto-reload on service worker controllerchange
if (!html.includes('controllerchange')) {
  html = html.replace(
    'if (\'serviceWorker\' in navigator) {',
    `if ('serviceWorker' in navigator) {\n        navigator.serviceWorker.addEventListener('controllerchange', function() { window.location.reload(); });`
  );
  console.log('✓ 7. Added auto-reload on controllerchange in index.html');
}

const timestamp = Date.now();
const swPath = path.join(__dirname, '..', 'service-worker.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = ['"][^'"]+['"];/, `const CACHE_NAME = 'stumarcot-pwa-v2.1.6-${timestamp}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('✓ 8. Bumped service-worker.js cache to v2.1.6-' + timestamp);
}

html = html.replace(/src="\.\/assets\/index-hgjhj-0G\.js\?v=\d+"/, `src="./assets/index-hgjhj-0G.js?v=${timestamp}"`);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✓ 9. Updated index.html asset version query to ' + timestamp);
