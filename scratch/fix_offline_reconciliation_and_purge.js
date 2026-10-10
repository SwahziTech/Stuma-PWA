const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

// 1. Fix Finished Goods Movements Reconcile logic
const oldMovsReconcile = `// 2. Reconcile Finished Goods Movements (Merging uncommitted local rows)
      if(movsRes.status==='fulfilled' && movsRes.value){
        isConnected = !0;
        const cloudMovs = movsRes.value;
        E(prev => {
          const cloudIds = new Set(cloudMovs.map(m=>m.id));
          const localUncommitted = prev.filter(m=>!cloudIds.has(m.id));
          if(localUncommitted.length > 0){
            localUncommitted.forEach(m => enqueueItem(QUEUE_KEYS.MOVEMENTS, m));
            return [...localUncommitted, ...cloudMovs];
          }
          return cloudMovs;
        });
      }`;

const newMovsReconcile = `// 2. Reconcile Finished Goods Movements (Merging truly pending local rows only)
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

if (bundle.includes(oldMovsReconcile)) {
  bundle = bundle.replace(oldMovsReconcile, newMovsReconcile);
  console.log('✓ 1. Fixed Finished Goods Movements reconciliation');
} else {
  console.error('ERROR: Could not find oldMovsReconcile');
  process.exit(1);
}

// 2. Fix Raw Material Movements Reconcile logic
const oldRawReconcile = `// 4. Reconcile Raw Material Movements
      if(rawMovsRes.status==='fulfilled' && rawMovsRes.value){
        isConnected = !0;
        const cloudRawMovs = rawMovsRes.value;
        L(prev => {
          const cloudIds = new Set(cloudRawMovs.map(m=>m.id));
          const localUncommitted = prev.filter(m=>!cloudIds.has(m.id));
          if(localUncommitted.length > 0){
            localUncommitted.forEach(m => enqueueItem(QUEUE_KEYS.RAW_MOVEMENTS, mapRawMovementToDb(m)));
            return [...localUncommitted, ...cloudRawMovs];
          }
          return cloudRawMovs;
        });
      }`;

const newRawReconcile = `// 4. Reconcile Raw Material Movements (Merging truly pending raw rows only)
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

if (bundle.includes(oldRawReconcile)) {
  bundle = bundle.replace(oldRawReconcile, newRawReconcile);
  console.log('✓ 2. Fixed Raw Material Movements reconciliation');
} else {
  console.error('ERROR: Could not find oldRawReconcile');
  process.exit(1);
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

// 3. Update index.html to purge undone production entries from localStorage
const htmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const purgeSnippet = `
        // Purge undone production entries from local caches
        (function() {
          try {
            var undoneIds = new Set([
              "d3385f7b-68cf-460f-833b-85a3fd155a1f",
              "38a3a856-c879-4f1a-8aa3-bf9800e1f2ee",
              "6a218554-9170-497a-b749-f86220999d86"
            ]);
            var undoneBatchIds = new Set([
              "d04bb8fa-4e8e-41de-bfda-83bebdf5433f",
              "f82ba99e-e9d8-4e9e-b4b3-129da42b2398"
            ]);
            var rm = localStorage.getItem("stumarcot_local_movements");
            if (rm) {
              var l = JSON.parse(rm);
              localStorage.setItem("stumarcot_local_movements", JSON.stringify(
                l.filter(function(m) { return !undoneIds.has(m.id) && !undoneBatchIds.has(m.batch_id); })
              ));
            }
            var qm = localStorage.getItem("stumarcot_pending_movements_queue");
            if (qm) {
              var q = JSON.parse(qm);
              localStorage.setItem("stumarcot_pending_movements_queue", JSON.stringify(
                q.filter(function(m) { return !undoneIds.has(m.id) && !undoneBatchIds.has(m.batch_id); })
              ));
            }
            var rr = localStorage.getItem("stumarcot_raw_movements");
            if (rr) {
              var rl = JSON.parse(rr);
              localStorage.setItem("stumarcot_raw_movements", JSON.stringify(
                rl.filter(function(m) { return !undoneBatchIds.has(m.relatedBatchId) && !undoneBatchIds.has(m.related_batch_id); })
              ));
            }
            var qr = localStorage.getItem("stumarcot_pending_raw_movements_queue");
            if (qr) {
              var qrl = JSON.parse(qr);
              localStorage.setItem("stumarcot_pending_raw_movements_queue", JSON.stringify(
                qrl.filter(function(m) { return !undoneBatchIds.has(m.relatedBatchId) && !undoneBatchIds.has(m.related_batch_id); })
              ));
            }
          } catch(e) {}
        })();`;

if (!html.includes('undoneIds')) {
  html = html.replace('console.warn("[PWA] LocalStorage access warning:", e);\n        }\n      })();', `console.warn("[PWA] LocalStorage access warning:", e);\n        }\n      })();${purgeSnippet}`);
  console.log('✓ 3. Injected local purge snippet into index.html');
}

const timestamp = Date.now();
const swPath = path.join(__dirname, '..', 'service-worker.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = ['"][^'"]+['"];/, `const CACHE_NAME = 'stumarcot-pwa-v2.1.5-${timestamp}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('✓ 4. Bumped service-worker.js cache to v2.1.5-' + timestamp);
}

html = html.replace(/src="\.\/assets\/index-hgjhj-0G\.js\?v=\d+"/, `src="./assets/index-hgjhj-0G.js?v=${timestamp}"`);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✓ 5. Updated index.html asset version query to ' + timestamp);
