const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

console.log('Original bundle size:', bundle.length);

// =========================================================================
// PART 1: REFACTOR SECTION 2 IN DAILY PRODUCTION VERIFICATION DOCUMENT
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

// Build clean Section 2 replacement:
// - Reset as before
// - Single horizontal line for all consumed materials
// - Simple single faint line under cement used: ("Cement stock : xx ")
// - Account for Rangi in consumption
const newSection2 = `children: "2. Total Raw Materials Consumed" }),
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "stretch", gap: "6px", width: "100%", boxSizing: "border-box" },
                      children: [
                        o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Cement" }),
                            o.jsxs("strong", { style: { fontSize: "14.5px", color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [aggregateMaterialsUsed.cement, " bags"] }),
                            o.jsxs("div", {
                              style: { fontSize: "10px", color: "rgba(255, 255, 255, 0.45)", marginTop: "2px", whiteSpace: "nowrap" },
                              children: ["Cement stock : ", Number((currentCementStock - aggregateMaterialsUsed.cement).toFixed(1))]
                            })
                          ]
                        }),
                        o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Sand (Mchanga)" }),
                            o.jsxs("strong", { style: { fontSize: "14.5px", color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [aggregateMaterialsUsed.sand, " bkt"] })
                          ]
                        }),
                        aggregateMaterialsUsed.chipping > 0 ? o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Chipping" }),
                            o.jsxs("strong", { style: { fontSize: "14.5px", color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [aggregateMaterialsUsed.chipping, " bkt"] })
                          ]
                        }) : null,
                        aggregateMaterialsUsed.aggregate > 0 ? o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Kokoto (Agg.)" }),
                            o.jsxs("strong", { style: { fontSize: "14.5px", color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [aggregateMaterialsUsed.aggregate, " bkt"] })
                          ]
                        }) : null,
                        aggregateMaterialsUsed.chemical > 0 ? o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Chemical (Dawa)" }),
                            o.jsxs("strong", { style: { fontSize: "14.5px", color: "#38bdf8", fontFamily: "var(--font-mono)" }, children: [aggregateMaterialsUsed.chemical, " L"] })
                          ]
                        }) : null,
                        aggregateMaterialsUsed.pigment > 0 ? o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Rangi" }),
                            o.jsxs("strong", { style: { fontSize: "14.5px", color: "#f87171", fontFamily: "var(--font-mono)" }, children: [aggregateMaterialsUsed.pigment, " kg"] })
                          ]
                        }) : null
                      ]
                    })
                  ]
                }),

                `;

bundle = bundle.slice(0, s2Idx) + newSection2 + bundle.slice(s3DivStart);
console.log('1. Updated Section 2: single line consumption, cement stock line, and rangi included');

// =========================================================================
// PART 2: REFACTOR LEDGER TAB (k1)
// - Dont add/remove logs (remove Reset Ledger and Dispatch/Adjust modal)
// - Add an Undo button
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
  console.log('2. Destructured deleteMovements in k1');
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
      const item = Pe.get(m.item_id);
      return item ? item.name : "Item";
    }))).join(", ");
    const typeLabel = latest.type === "production_in" ? "Production" : latest.type === "opening_balance" ? "Baseline" : latest.type === "dispatch_out" ? "Dispatch" : "Movement";
    const confirmed = window.confirm(\`Undo last recorded \${typeLabel} entry for:\\n\${itemNames} (\${targetMovs.length} \${targetMovs.length === 1 ? "record" : "records"} on \${latest.date})?\\n\\nThis will remove the transaction from the ledger.\`);
    if (!confirmed) return;
    if (deleteMovements) {
      await deleteMovements({ ids: targetMovs.map(m => m.id), batch_id: latest.batch_id });
    }
    window.alert(\`✓ Successfully undid last \${typeLabel} entry for \${itemNames}.\`);
  };
`;

// Insert handleUndo after handleResetLedger or near top of k1
const resetLedgerIdx = k1Code.indexOf('handleResetLedger = async () => {');
if (resetLedgerIdx !== -1) {
  // Replace handleResetLedger with handleUndo
  const endResetLedger = k1Code.indexOf('};', resetLedgerIdx) + 2;
  k1Code = k1Code.slice(0, resetLedgerIdx) + undoFuncCode + k1Code.slice(endResetLedger);
  console.log('3. Replaced handleResetLedger with handleUndo');
}

// 3. In the header of k1: Replace "Reset Ledger" and "Dispatch / Adjust" buttons with single "Undo" button
const headerDivRegex = /o\.jsxs\("div",\s*\{\s*style:\s*\{\s*display:\s*"flex",\s*alignItems:\s*"center",\s*gap:\s*"8px"\s*\},[\s\S]*?handleResetLedger[\s\S]*?Dispatch \/ Adjust[\s\S]*?\}\)\s*\]\s*\}\)/;

const newUndoHeaderButton = `o.jsx("button", {
            type: "button",
            onClick: handleUndo,
            className: "btn btn-secondary btn-sm",
            style: { gap: "6px", color: "var(--brand-400)", borderColor: "var(--border-subtle)" },
            title: "Undo the last recorded transaction in the ledger",
            children: [
              o.jsx(Yn, { size: 14 }),
              o.jsx("span", { children: "Undo" })
            ]
          })`;

if (headerDivRegex.test(k1Code)) {
  k1Code = k1Code.replace(headerDivRegex, newUndoHeaderButton);
  console.log('4. Replaced header add/remove log buttons with Undo button');
} else {
  console.error('ERROR: Could not find headerDivRegex in k1!');
  process.exit(1);
}

// 4. Remove the manual "Dispatch / Adjust" modal from bottom of k1
const modalRegex = /L\s*&&\s*o\.jsx\("div",\s*\{\s*className:\s*"modal-overlay",[\s\S]*?Log Dispatch or Stock Adjustment[\s\S]*?Save Ledger Movement"\s*\}\)\s*\]\s*\}\)\s*\]\s*\}\)\s*\}\)/;
if (modalRegex.test(k1Code)) {
  k1Code = k1Code.replace(modalRegex, 'null');
  console.log('5. Removed manual dispatch/adjustment modal from k1');
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
  sw = sw.replace(/const CACHE_NAME = ['"][^'"]+['"];/, `const CACHE_NAME = 'stumarcot-pwa-v2.1.2-${timestamp}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('Updated service-worker.js cache to v2.1.2-' + timestamp);
}

const htmlPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/src="\.\/assets\/index-hgjhj-0G\.js\?v=\d+"/, `src="./assets/index-hgjhj-0G.js?v=${timestamp}"`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('Updated index.html script tag version to ' + timestamp);
}
