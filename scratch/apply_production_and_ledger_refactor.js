const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

console.log('Original bundle size:', bundle.length);

// =========================================================================
// PART 1: DAILY PRODUCTION VERIFICATION DOCUMENT (Section 2)
// - Reset as before
// - Single line horizontal row for all consumed materials
// - Under cement used: simple single faint line ("Cement stock : xx ")
// - Account for Rangi in consumption
// =========================================================================
const s2Search = `children: "2. Total Raw Materials Consumed" }),`;
const s2Idx = bundle.indexOf(s2Search);

if (s2Idx === -1) {
  console.error('ERROR: Could not find Section 2 search string in bundle!');
  process.exit(1);
}

// Find Section 3 start: children: "3. Expected Inventory Additions
const s3Search = `children: "3. Expected Inventory Additions`;
const s3Idx = bundle.indexOf(s3Search, s2Idx);

if (s3Idx === -1) {
  console.error('ERROR: Could not find Section 3 search string in bundle!');
  process.exit(1);
}

// The div enclosing section 3 begins right before s3Idx
const s3DivStart = bundle.lastIndexOf('o.jsxs("div",', s3Idx);

const newSection2 = `children: "2. Total Raw Materials Consumed" }),
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "stretch", gap: "6px", width: "100%", boxSizing: "border-box" },
                      children: [
                        o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Cement" }),
                            o.jsxs("strong", { style: { fontSize: "14px", color: "#f8fafc", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }, children: [aggregateMaterialsUsed.cement, " bags"] }),
                            o.jsxs("div", {
                              style: { fontSize: "9.5px", color: "rgba(255, 255, 255, 0.45)", marginTop: "2px", whiteSpace: "nowrap" },
                              children: ["Cement stock : ", Number((currentCementStock - aggregateMaterialsUsed.cement).toFixed(1))]
                            })
                          ]
                        }),
                        o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Sand (Mchanga)" }),
                            o.jsxs("strong", { style: { fontSize: "14px", color: "#f8fafc", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }, children: [aggregateMaterialsUsed.sand, " bkt"] })
                          ]
                        }),
                        aggregateMaterialsUsed.chipping > 0 ? o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Chipping" }),
                            o.jsxs("strong", { style: { fontSize: "14px", color: "#f8fafc", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }, children: [aggregateMaterialsUsed.chipping, " bkt"] })
                          ]
                        }) : null,
                        aggregateMaterialsUsed.aggregate > 0 ? o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Kokoto (Agg.)" }),
                            o.jsxs("strong", { style: { fontSize: "14px", color: "#f8fafc", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }, children: [aggregateMaterialsUsed.aggregate, " bkt"] })
                          ]
                        }) : null,
                        aggregateMaterialsUsed.chemical > 0 ? o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Chemical (Dawa)" }),
                            o.jsxs("strong", { style: { fontSize: "14px", color: "#38bdf8", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }, children: [aggregateMaterialsUsed.chemical, " L"] })
                          ]
                        }) : null,
                        aggregateMaterialsUsed.pigment > 0 ? o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Rangi" }),
                            o.jsxs("strong", { style: { fontSize: "14px", color: "#f87171", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }, children: [aggregateMaterialsUsed.pigment, " kg"] })
                          ]
                        }) : null
                      ]
                    })
                  ]
                }),

                `;

bundle = bundle.slice(0, s2Idx) + newSection2 + bundle.slice(s3DivStart);
console.log('1. Updated Section 2 to single line with faint cement stock line and Rangi included.');

// Ensure materialsUsed in handleAddBatchToDaily populates pigment colors
const matUsedTarget = `chemical_liters: scaledMaterials.chemicalLiters,
        pigment_kg: scaledMaterials.pigmentKg
      },`;
const matUsedReplacement = `chemical_liters: scaledMaterials.chemicalLiters,
        pigment_kg: scaledMaterials.pigmentKg,
        pigment_red_kg: (j && (j.toLowerCase() === "red" || j.toLowerCase() === "maroon")) ? scaledMaterials.pigmentKg : 0,
        pigment_black_kg: (j && (j.toLowerCase() === "black" || j.toLowerCase() === "grey" || j.toLowerCase() === "gray")) ? scaledMaterials.pigmentKg : 0
      },`;

if (bundle.includes(matUsedTarget)) {
  bundle = bundle.replace(matUsedTarget, matUsedReplacement);
  console.log('2. Populated pigment color keys in handleAddBatchToDaily materialsUsed');
}

// =========================================================================
// PART 2: DELETE MOVEMENTS (revert raw materials on undo)
// =========================================================================
const origDelMov = `const deleteMovements = B.useCallback(async target => {`;
const targetDelIdx = bundle.indexOf(origDelMov);

if (targetDelIdx !== -1) {
  const endDelIdx = bundle.indexOf('return removedMovs;\n  },[]);', targetDelIdx);
  if (endDelIdx !== -1) {
    const enhancedDel = `const deleteMovements = B.useCallback(async target => {
    let predicate;
    if(Array.isArray(target)||typeof target==="string"){
      const idsSet = new Set(Array.isArray(target)?target:[target]);
      predicate = mov => idsSet.has(mov.id);
    } else if(target && typeof target==="object"){
      predicate = mov => {
        if(target.batch_id && mov.batch_id===target.batch_id) return !0;
        if(target.item_id && mov.item_id===target.item_id && (!target.type||mov.type===target.type)) return !0;
        if(target.ids && target.ids.includes(mov.id)) return !0;
        return !1;
      };
    } else {
      return [];
    }
    let removedMovs = [];
    E(prev => {
      removedMovs = prev.filter(predicate);
      return prev.filter(mov => !predicate(mov));
    });
    try {
      const rawMovs = localStorage.getItem(cp);
      if(rawMovs){
        const list = JSON.parse(rawMovs);
        localStorage.setItem(cp, JSON.stringify(list.filter(mov => !predicate(mov))));
      }
    } catch(err){}
    const batchIdsToRevert = new Set(removedMovs.map(m => m.batch_id).filter(Boolean));
    if(target && target.batch_id) batchIdsToRevert.add(target.batch_id);
    if(batchIdsToRevert.size > 0){
      let removedRawMovs = [];
      w(prev => {
        removedRawMovs = prev.filter(rm => batchIdsToRevert.has(rm.relatedBatchId));
        return prev.filter(rm => !batchIdsToRevert.has(rm.relatedBatchId));
      });
      if(removedRawMovs.length > 0){
        k(prev => prev.map(mat => {
          const matched = removedRawMovs.filter(rm => rm.materialKey === mat.key || (mat.legacyKeys && mat.legacyKeys.includes(rm.materialKey)));
          if(matched.length > 0){
            const restored = matched.reduce((sum, rm) => sum + (Number(rm.quantity) || 0), 0);
            return {
              ...mat,
              currentBalance: Number((mat.currentBalance + restored).toFixed(2)),
              lastUpdated: new Date().toISOString()
            };
          }
          return mat;
        }));
      }
    }
    const client = Ht();
    if(client && removedMovs.length > 0){
      try {
        const idsToRemove = removedMovs.map(m=>m.id).filter(Boolean);
        if(idsToRemove.length > 0){
          Y(!0);
          await client.from("movements").delete().in("id", idsToRemove);
          Y(!1);
        }
      } catch(err){
        Y(!1);
        console.warn("Supabase deleteMovements error:", err);
      }
    }`;
    bundle = bundle.slice(0, targetDelIdx) + enhancedDel + bundle.slice(endDelIdx);
    console.log('3. Enhanced deleteMovements to restore deducted raw materials on batch undo');
  }
}

// =========================================================================
// PART 3: REFACTOR LEDGER TAB (k1)
// - Dont add/remove logs (remove Reset Ledger and Dispatch/Adjust modal)
// - Add Undo button
// =========================================================================
const k1StartIdx = bundle.indexOf('k1=()=>{');
const c1StartIdx = bundle.indexOf('C1=()=>{', k1StartIdx);

if (k1StartIdx === -1 || c1StartIdx === -1) {
  console.error('ERROR: Could not find k1 or C1 in bundle!');
  process.exit(1);
}

let k1Code = bundle.slice(k1StartIdx, c1StartIdx);

// 1. Destructure deleteMovements from Vt() in k1
if (!k1Code.includes('deleteMovements')) {
  k1Code = k1Code.replace(
    'rawMaterials:u, resetLedger} = Vt();',
    'rawMaterials:u, deleteMovements} = Vt();'
  );
  console.log('4. Destructured deleteMovements in k1');
}

// 2. Define handleUndo in k1
const undoFuncCode = `
  const handleUndo = async () => {
    if (!s || s.length === 0) {
      window.alert("No recorded ledger entries found to undo.");
      return;
    }
    const latest = s[0];
    const targetMovs = latest.batch_id ? s.filter(m => m.batch_id === latest.batch_id) : [latest];
    const itemNames = Array.from(new Set(targetMovs.map(m => {
      const item = t.find(it => it.id === m.item_id);
      return item ? item.name : "Item";
    }))).join(", ");
    const typeLabel = latest.type === "production_in" ? "Production" : latest.type === "opening_balance" ? "Baseline" : latest.type === "dispatch_out" ? "Dispatch" : "Movement";
    const confirmed = window.confirm(\`Undo last recorded \${typeLabel} entry for:\\n\${itemNames} (\${targetMovs.length} \${targetMovs.length === 1 ? "record" : "records"} on \${latest.date})?\\n\\nThis will remove the transaction from the ledger and restore materials to inventory.\`);
    if (!confirmed) return;
    if (deleteMovements) {
      await deleteMovements({ ids: targetMovs.map(m => m.id), batch_id: latest.batch_id });
    }
    window.alert(\`✓ Successfully undid last \${typeLabel} entry for \${itemNames}.\`);
  };
`;

const resetLedgerIdx = k1Code.indexOf('const handleResetLedger = async () => {');
if (resetLedgerIdx !== -1) {
  const endResetLedger = k1Code.indexOf('};', resetLedgerIdx) + 2;
  k1Code = k1Code.slice(0, resetLedgerIdx) + undoFuncCode.trim() + k1Code.slice(endResetLedger);
  console.log('5. Replaced handleResetLedger with handleUndo');
}

// 3. Header buttons: Replace Reset Ledger & Dispatch/Adjust with single Undo button
const btnStart = k1Code.indexOf('onClick: handleResetLedger');
const divStart = k1Code.lastIndexOf('o.jsxs("button",', btnStart);
const dispatchEndStr = 'children: "Dispatch / Adjust" })\n                ]\n              })';
const btnEnd = k1Code.indexOf(dispatchEndStr) + dispatchEndStr.length;

const newUndoHeaderButton = `o.jsx("button", {
                type: "button",
                onClick: handleUndo,
                className: "btn btn-secondary btn-sm",
                style: { gap: "6px", color: "var(--brand-400)", borderColor: "var(--border-subtle)" },
                title: "Undo the last recorded transaction in the ledger",
                children: [
                  o.jsx(Mx, { size: 14 }),
                  o.jsx("span", { children: "Undo" })
                ]
              })`;

k1Code = k1Code.slice(0, divStart) + newUndoHeaderButton + k1Code.slice(btnEnd);
console.log('6. Replaced header add/remove log buttons with Undo button');

// 4. Remove the manual "Dispatch / Adjust" modal from bottom of k1
const modalStart = k1Code.indexOf('// Log Dispatch or Adjustment Modal');
if (modalStart !== -1) {
  const modalEnd = k1Code.indexOf('\n    ]\n  });', modalStart);
  if (modalEnd !== -1) {
    k1Code = k1Code.slice(0, modalStart) + 'null' + k1Code.slice(modalEnd);
    console.log('7. Removed manual dispatch/adjustment modal from k1');
  }
}

// Re-assemble bundle
bundle = bundle.slice(0, k1StartIdx) + k1Code + bundle.slice(c1StartIdx);

// Test syntax
console.log('Testing bundle syntax with vm.Script...');
try {
  new vm.Script(bundle);
  console.log('Syntax check PASSED successfully!');
} catch (err) {
  console.error('Syntax check FAILED:', err);
  process.exit(1);
}

fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log('Successfully written updated bundle to assets/index-hgjhj-0G.js! Size:', bundle.length);

// Bump cache version
const timestamp = Date.now();
const swPath = path.join(__dirname, '..', 'service-worker.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = ['"][^'"]+['"];/, `const CACHE_NAME = 'stumarcot-pwa-v2.1.3-${timestamp}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('Updated service-worker.js cache to v2.1.3-' + timestamp);
}

const htmlPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/src="\.\/assets\/index-hgjhj-0G\.js\?v=\d+"/, `src="./assets/index-hgjhj-0G.js?v=${timestamp}"`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('Updated index.html script tag version to ' + timestamp);
}
console.log('Refactor script completed successfully!');
