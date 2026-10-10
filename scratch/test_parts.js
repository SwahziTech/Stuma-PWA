const fs = require('fs');
const vm = require('vm');

let original = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

function test(name, code) {
  try {
    new vm.Script(code);
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    const lines = code.split('\n');
    const match = err.stack.match(/<anonymous>:(\d+)/);
    const line = match ? parseInt(match[1], 10) : 1;
    console.log(lines.slice(Math.max(0, line - 5), line + 5).map((l, i) => `${Math.max(0, line - 5) + i + 1}: ${l}`).join('\n'));
  }
}

test('Original bundle', original);

// Test Part 1: Section 2 replacement only
const s2Search = `children: "2. Total Raw Materials Consumed" }),`;
const s2Idx = original.indexOf(s2Search);
const s3Search = `children: "3. Expected Inventory Additions`;
const s3Idx = original.indexOf(s3Search, s2Idx);
const s3DivStart = original.lastIndexOf('o.jsxs("div",', s3Idx);

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

let bundleP1 = original.slice(0, s2Idx) + newSection2 + original.slice(s3DivStart);
test('Part 1 (Section 2)', bundleP1);

// Test Part 3: Ledger Undo and button replacement
const k1StartIdx = bundleP1.indexOf('k1=()=>{');
const c1StartIdx = bundleP1.indexOf('C1=()=>{', k1StartIdx);
let k1Code = bundleP1.slice(k1StartIdx, c1StartIdx);

k1Code = k1Code.replace('rawMaterials:u, resetLedger} = Vt();', 'rawMaterials:u, deleteMovements} = Vt();');

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
const endResetLedger = k1Code.indexOf('};', resetLedgerIdx) + 2;
k1Code = k1Code.slice(0, resetLedgerIdx) + undoFuncCode.trim() + k1Code.slice(endResetLedger);

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

const modalStart = k1Code.indexOf('// Log Dispatch or Adjustment Modal');
if (modalStart !== -1) {
  const modalEnd = k1Code.indexOf('\n    ]\n  });', modalStart);
  if (modalEnd !== -1) {
    k1Code = k1Code.slice(0, modalStart) + 'null' + k1Code.slice(modalEnd);
  }
}

let bundleP3 = bundleP1.slice(0, k1StartIdx) + k1Code + bundleP1.slice(c1StartIdx);
test('Part 3 (Ledger with Undo button AND modal removed)', bundleP3);

// Test Part 2: deleteMovements enhancement
const origDelMov = `const deleteMovements = B.useCallback(async target => {`;
const targetDelIdx = bundleP3.indexOf(origDelMov);

if (targetDelIdx !== -1) {
  const endDelIdx = bundleP3.indexOf('return removedMovs;\n  },[]);', targetDelIdx);
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
    let bundleP2 = bundleP3.slice(0, targetDelIdx) + enhancedDel + bundleP3.slice(endDelIdx);
    test('Part 2 (deleteMovements enhancement) + All Parts', bundleP2);
  }
}
