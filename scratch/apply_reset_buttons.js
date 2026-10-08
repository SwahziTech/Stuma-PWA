const fs = require('fs');
const { execSync } = require('child_process');

console.log('Starting application of reset buttons for product baseline, ledger, and sales...');
const bundlePath = 'assets/index-hgjhj-0G.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');

// 1. Add reset methods to AppContext
const peTarget = 'Pe=B.useCallback(()=>{k(Fl),L([]),localStorage.removeItem(Xl),localStorage.removeItem(Zl)},[]),';
if (!bundle.includes(peTarget)) {
  throw new Error('Target Pe not found in bundle');
}

const newResetMethods = peTarget + `resetProductBaseline=B.useCallback(async()=>{E(prev=>prev.filter(m=>m.type!=="opening_balance"));try{const raw=localStorage.getItem(cp);if(raw){const list=JSON.parse(raw);localStorage.setItem(cp,JSON.stringify(list.filter(m=>m.type!=="opening_balance")));}}catch(err){}if(Ht()){try{await Ht().from("movements").delete().eq("type","opening_balance");}catch(err){console.warn("Supabase resetProductBaseline error:",err);}}return!0;},[]),resetLedger=B.useCallback(async()=>{E([]);L([]);try{localStorage.setItem(cp,"[]");localStorage.setItem(Zl,"[]");}catch(err){}if(Ht()){try{await Ht().from("movements").delete().neq("id","00000000-0000-0000-0000-000000000000");}catch(err){console.warn("Supabase resetLedger error:",err);}}return!0;},[]),resetSales=B.useCallback(async()=>{E(prev=>prev.filter(m=>m.type!=="dispatch_out"&&m.type!=="sale_out"));try{const raw=localStorage.getItem(cp);if(raw){const list=JSON.parse(raw);localStorage.setItem(cp,JSON.stringify(list.filter(m=>m.type!=="dispatch_out"&&m.type!=="sale_out")));}sessionStorage.removeItem("stumarcot_sales_tab_draft_v3");sessionStorage.removeItem("stumarcot_sales_tab_draft_v2");sessionStorage.removeItem("stumarcot_sales_tab_draft");if(typeof window!=="undefined"){delete window._stumarcot_sales_draft;}}catch(err){}if(Ht()){try{await Ht().from("movements").delete().in("type",["dispatch_out","sale_out"]);}catch(err){console.warn("Supabase resetSales error:",err);}}return!0;},[]),`;

bundle = bundle.replace(peTarget, newResetMethods);
console.log('✓ 1. AppContext reset methods defined.');

// 2. Expose in Wp.Provider
const provTarget = 'resetRawMaterialsToDefault:Pe,';
if (!bundle.includes(provTarget)) {
  throw new Error('Target resetRawMaterialsToDefault:Pe not found in bundle');
}
const newProvTarget = 'resetRawMaterialsToDefault:Pe,resetProductBaseline:resetProductBaseline,resetLedger:resetLedger,resetSales:resetSales,';
bundle = bundle.replace(provTarget, newProvTarget);
console.log('✓ 2. Expose resetProductBaseline, resetLedger, resetSales in Wp.Provider.');

// 3. Update w1 (Product Baseline view)
const w1Target = 'w1=()=>{const{items:s,movements:t,addMovementsBatch:r,staffName:a}=Vt(),';
if (!bundle.includes(w1Target)) {
  throw new Error('Target w1 not found in bundle');
}
const newW1Target = `w1=()=>{const{items:s,movements:t,addMovementsBatch:r,staffName:a,resetProductBaseline}=Vt(),handleResetBaseline=async()=>{const confirmed=window.confirm("Are you sure you want to RESET all product baseline opening balances?\\n\\nThis will clear all product baseline records and entries so you can test baselining again from scratch.");if(!confirmed)return;m({});L(null);if(resetProductBaseline)await resetProductBaseline();window.alert("✓ Product baseline opening balances have been reset.");},`;
bundle = bundle.replace(w1Target, newW1Target);

// Add reset button in w1 header next to save button
const w1SaveBtnTarget = 'o.jsxs("button",{type:"button",disabled:j||xe.length===0,onClick:Ie,className:"btn btn-primary btn-lg",style:{padding:"10px 20px",fontSize:"14.5px",fontWeight:700,borderRadius:"var(--radius-md)",boxShadow:"0 4px 16px rgba(249, 115, 22, 0.4)",display:"flex",alignItems:"center",gap:"8px"},children:[o.jsx(gc,{size:18}),o.jsx("span",{children:j?"Saving...":xe.length>0?`Save (${xe.length})`:"Save Opening Balance"})]})';
if (!bundle.includes(w1SaveBtnTarget)) {
  throw new Error('Target w1SaveBtnTarget not found in bundle');
}
const newW1Btns = `o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[o.jsxs("button",{type:"button",onClick:handleResetBaseline,className:"btn btn-ghost btn-sm",style:{border:"1px solid rgba(239, 68, 68, 0.4)",color:"#ef4444",padding:"9px 13px",fontSize:"13px",fontWeight:600,display:"flex",alignItems:"center",gap:"6px",borderRadius:"var(--radius-md)"},title:"Reset all product baseline opening balances for testing",children:[o.jsx("span",{children:"🔄"}),o.jsx("span",{children:"Reset Baseline"})]}),${w1SaveBtnTarget}]})`;
bundle = bundle.replace(w1SaveBtnTarget, newW1Btns);
console.log('✓ 3. Product baseline reset button added.');

// 4. Update k1 (Ledger view)
const k1Target = `k1=()=>{\n  var T,N;\n  const {movements:s, items:t, addMovement:r, staffName:a, rawMaterialMovements:c, rawMaterials:u} = Vt();`;
if (!bundle.includes(k1Target)) {
  throw new Error('Target k1 not found in bundle');
}
const newK1Target = `k1=()=>{\n  var T,N;\n  const {movements:s, items:t, addMovement:r, staffName:a, rawMaterialMovements:c, rawMaterials:u, resetLedger} = Vt();
  const handleResetLedger = async () => {
    const confirmed = window.confirm("Are you sure you want to RESET the ledger?\\n\\nThis will clear all movement records (finished goods & raw materials) from the ledger so you can test from a clean slate.");
    if (!confirmed) return;
    if (resetLedger) await resetLedger();
    window.alert("✓ Ledger log has been reset.");
  };`;
bundle = bundle.replace(k1Target, newK1Target);

// Add reset button in k1 header
const k1BtnTarget = `          o.jsxs("button", {\n            onClick: () => W(!0),\n            className: "btn btn-secondary btn-sm",\n            style: { gap: "4px" },\n            children: [\n              o.jsx(vr, { size: 14, color: "var(--brand-400)" }),\n              o.jsx("span", { children: "Dispatch / Adjust" })\n            ]\n          })`;
if (!bundle.includes(k1BtnTarget)) {
  throw new Error('Target k1BtnTarget not found in bundle');
}
const newK1Btns = `          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "8px" },
            children: [
              o.jsxs("button", {
                type: "button",
                onClick: handleResetLedger,
                className: "btn btn-ghost btn-sm",
                style: { border: "1px solid rgba(239, 68, 68, 0.4)", color: "#ef4444", padding: "6px 10px", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px", borderRadius: "var(--radius-md)" },
                title: "Reset all ledger records for testing",
                children: [o.jsx("span", { children: "🔄" }), o.jsx("span", { children: "Reset Ledger" })]
              }),
              o.jsxs("button", {
                onClick: () => W(!0),
                className: "btn btn-secondary btn-sm",
                style: { gap: "4px" },
                children: [
                  o.jsx(vr, { size: 14, color: "var(--brand-400)" }),
                  o.jsx("span", { children: "Dispatch / Adjust" })
                ]
              })
            ]
          })`;
bundle = bundle.replace(k1BtnTarget, newK1Btns);
console.log('✓ 4. Ledger reset button added.');

// 5. Update b1 (Sales view)
const b1Target = `b1=({prefillItemId:s,onClearPrefill:t,onSuccess:r})=>{\n  const {items:a, movements:c, addMovementsBatch:u, getStockSummary:d, staffName:f, adminSettings:adm} = Vt();`;
if (!bundle.includes(b1Target)) {
  throw new Error('Target b1 not found in bundle');
}
const newB1Target = `b1=({prefillItemId:s,onClearPrefill:t,onSuccess:r})=>{\n  const {items:a, movements:c, addMovementsBatch:u, getStockSummary:d, staffName:f, adminSettings:adm, resetSales} = Vt();`;
bundle = bundle.replace(b1Target, newB1Target);

// Add handleResetSale in b1
const b1DraftTarget = `  // Persist state in memory across tab switches (cleared when whole web app reloads)\n  B.useEffect(() => {`;
if (!bundle.includes(b1DraftTarget)) {
  throw new Error('Target b1DraftTarget not found in bundle');
}
const newB1Draft = `  const handleResetSale = async () => {
    const confirmed = window.confirm("Are you sure you want to RESET Sales?\\n\\nThis will clear current customer/product inputs, cart, staged sales, and all recorded test sales dispatches.");
    if (!confirmed) return;
    setCustomerName("");
    setCustomerContacts("");
    setDeliverySite("");
    setCustomerTin("");
    setSelectedItemId("");
    setSelectedColor("White");
    setSellingPriceInput("");
    setIsCustomPrice(false);
    setQuantityInput("");
    setAddedProducts([]);
    setStagedSales([]);
    setEditingSaleId(null);
    setSuccessBanner(null);
    if (typeof window !== "undefined") {
      window._stumarcot_sales_draft = {};
    }
    if (resetSales) await resetSales();
    window.alert("✓ Sales inputs and test dispatch records have been reset.");
  };

  // Persist state in memory across tab switches (cleared when whole web app reloads)
  B.useEffect(() => {`;
bundle = bundle.replace(b1DraftTarget, newB1Draft);

// Add reset button in b1 header
const b1HeaderTarget = `          o.jsxs("div", {\n            style: { display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-surface-elevated)", padding: "6px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" },\n            children: [\n              o.jsx(ni, { size: 15, color: "#f87171" }),\n              o.jsx("input", {\n                type: "date",\n                value: saleDate,\n                onChange: e => setSaleDate(e.target.value),\n                style: { background: "transparent", border: "none", color: "#f8fafc", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, outline: "none" }\n              })\n            ]\n          })`;
if (!bundle.includes(b1HeaderTarget)) {
  throw new Error('Target b1HeaderTarget not found in bundle');
}
const newB1Header = `          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "8px" },
            children: [
              o.jsxs("button", {
                type: "button",
                onClick: handleResetSale,
                className: "btn btn-ghost btn-sm",
                style: { border: "1px solid rgba(239, 68, 68, 0.4)", color: "#ef4444", padding: "6px 12px", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px", borderRadius: "var(--radius-md)" },
                title: "Reset sale inputs and test dispatches",
                children: [o.jsx("span", { children: "🔄" }), o.jsx("span", { children: "Reset Sale" })]
              }),
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-surface-elevated)", padding: "6px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" },
                children: [
                  o.jsx(ni, { size: 15, color: "#f87171" }),
                  o.jsx("input", {
                    type: "date",
                    value: saleDate,
                    onChange: e => setSaleDate(e.target.value),
                    style: { background: "transparent", border: "none", color: "#f8fafc", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, outline: "none" }
                  })
                ]
              })
            ]
          })`;
bundle = bundle.replace(b1HeaderTarget, newB1Header);
console.log('✓ 5. Sales view reset button added.');

// 6. Update DashboardSalesRecordView (Dashboard > Sales tab)
const dashSalesTarget = `DashboardSalesRecordView = ({ movements: mv, items: d, onNavigate: s }) => {\n  const [search, setSearch] = B.useState("");`;
if (!bundle.includes(dashSalesTarget)) {
  throw new Error('Target dashSalesTarget not found in bundle');
}
const newDashSalesTarget = `DashboardSalesRecordView = ({ movements: mv, items: d, onNavigate: s }) => {\n  const { resetSales } = Vt();\n  const [search, setSearch] = B.useState("");`;
bundle = bundle.replace(dashSalesTarget, newDashSalesTarget);

const dashSalesBtnTarget = `          o.jsxs("button", {\n            type: "button",\n            onClick: () => s("sales"),\n            className: "btn btn-primary btn-sm",\n            style: { display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 12px rgba(249, 115, 22, 0.35)", padding: "7px 14px", borderRadius: "8px", fontWeight: 700 },\n            children: [\n              o.jsx(Ka, { size: 14 }),\n              o.jsx("span", { children: "+ Record New Sale" })\n            ]\n          })`;
if (!bundle.includes(dashSalesBtnTarget)) {
  throw new Error('Target dashSalesBtnTarget not found in bundle');
}
const newDashSalesBtns = `          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "8px" },
            children: [
              o.jsxs("button", {
                type: "button",
                onClick: async () => {
                  if (window.confirm("Are you sure you want to RESET all sales dispatches?\\n\\nThis will clear all recorded test sales records and restore inventory.")) {
                    if (resetSales) await resetSales();
                    window.alert("✓ Sales records have been reset.");
                  }
                },
                className: "btn btn-ghost btn-sm",
                style: { border: "1px solid rgba(239, 68, 68, 0.4)", color: "#ef4444", padding: "7px 11px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" },
                title: "Reset all sales dispatch records for testing",
                children: [o.jsx("span", { children: "🔄" }), o.jsx("span", { children: "Reset Sales" })]
              }),
              o.jsxs("button", {
                type: "button",
                onClick: () => s("sales"),
                className: "btn btn-primary btn-sm",
                style: { display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 12px rgba(249, 115, 22, 0.35)", padding: "7px 14px", borderRadius: "8px", fontWeight: 700 },
                children: [
                  o.jsx(Ka, { size: 14 }),
                  o.jsx("span", { children: "+ Record New Sale" })
                ]
              })
            ]
          })`;
bundle = bundle.replace(dashSalesBtnTarget, newDashSalesBtns);
console.log('✓ 6. Dashboard Sales record reset button added.');

// Write back to bundle
fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log('✓ Saved bundle.');

// Verify syntax with node --check
execSync('node --check ' + bundlePath);
console.log('✓ Syntax is 100% VALID after all reset buttons added!');
