const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

const _1Idx = bundle.indexOf('_1=');
const b1Idx = bundle.indexOf('b1=');

if (_1Idx === -1 || b1Idx === -1) {
  console.error('ERROR: Could not find _1= or b1= in bundle!');
  process.exit(1);
}

let prodCode = bundle.slice(_1Idx, b1Idx);
console.log('Original prodCode length:', prodCode.length);

// 1. Destructure rawMaterialsList from Vt()
const oldDestructure = `const {items:a, movements:c, addMovementsBatch:u, staffName:d, adminSettings:f, totalFactoryMolds:totalMolds, todayMoldsInUse:moldsUsed, overallMoldUtilizationPct:moldsPct} = Vt();`;
const newDestructure = `const {items:a, movements:c, addMovementsBatch:u, staffName:d, adminSettings:f, totalFactoryMolds:totalMolds, todayMoldsInUse:moldsUsed, overallMoldUtilizationPct:moldsPct, rawMaterials:rawMaterialsList} = Vt();`;

if (!prodCode.includes(oldDestructure)) {
  console.error('ERROR: oldDestructure not found!');
  process.exit(1);
}
prodCode = prodCode.replace(oldDestructure, newDestructure);
console.log('1. Destructured rawMaterialsList');

// 2. Initial state of selected product w: start with "" (Select Product) unless prefillItemId s is passed
const oldWState = `  const [w, E] = B.useState(() => {
    if (s && a.some(item => item.id === s)) return s;
    const lastProd = c && c.find(m => m.type === "production_in" && !m.is_residual);
    if (lastProd && a.some(item => item.id === lastProd.item_id)) return lastProd.item_id;
    return "";
  });`;

const newWState = `  const [w, E] = B.useState(() => {
    if (s && a.some(item => item.id === s)) return s;
    return "";
  });`;

if (!prodCode.includes(oldWState)) {
  console.error('ERROR: oldWState not found!');
  process.exit(1);
}
prodCode = prodCode.replace(oldWState, newWState);
console.log('2. Product selection defaults to "" (Select Product)');

// 3. Add cementInputRef, focusCementInput, cementMat, currentCementStock, handleWheelBlur, handleNumericKeyDown, onGlobalWheel
const oldShowColorDropdown = `const [showColorDropdown, setShowColorDropdown] = B.useState(!1);`;

const newHelperDefs = `const [showColorDropdown, setShowColorDropdown] = B.useState(!1);

  // Requirement 2 & 3: Ref for cement input and auto direct helper
  const cementInputRef = B.useRef(null);
  const focusCementInput = B.useCallback(() => {
    if (cementInputRef.current) {
      cementInputRef.current.focus();
      try {
        cementInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch(err) {}
    }
  }, []);

  // Requirement 1: Cement balance and stock calculations
  const cementMat = B.useMemo(() => {
    return (rawMaterialsList || []).find(m => m.key === "cement" || (m.legacyKeys && m.legacyKeys.includes("cement_50kg"))) || null;
  }, [rawMaterialsList]);

  const currentCementStock = B.useMemo(() => {
    return cementMat ? Number(Number(cementMat.currentBalance || 0).toFixed(2)) : 0;
  }, [cementMat]);

  // Requirement 2: Disable mouse wheel input and disallow letters into numbers input
  const handleWheelBlur = B.useCallback((e) => {
    e.currentTarget.blur();
    if (e.cancelable) e.preventDefault();
  }, []);

  const handleNumericKeyDown = B.useCallback((e, allowDecimal = true) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const navKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Enter", "Home", "End"];
    if (navKeys.includes(e.key)) return;
    if (allowDecimal && (e.key === "." || e.key === "Decimal")) {
      if (e.currentTarget.value.includes(".")) {
        e.preventDefault();
      }
      return;
    }
    // Block non-digit keys, e, E, +, -, etc.
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  }, []);

  B.useEffect(() => {
    const onGlobalWheel = (e) => {
      if (document.activeElement && (document.activeElement.type === "number" || document.activeElement.classList.contains("mono"))) {
        document.activeElement.blur();
      }
    };
    window.addEventListener("wheel", onGlobalWheel, { passive: false });
    return () => window.removeEventListener("wheel", onGlobalWheel);
  }, []);`;

if (!prodCode.includes(oldShowColorDropdown)) {
  console.error('ERROR: oldShowColorDropdown not found!');
  process.exit(1);
}
prodCode = prodCode.replace(oldShowColorDropdown, newHelperDefs);
console.log('3. Added cementInputRef, focusCementInput, stock calc, and keyboard/wheel handlers');

// 4. In handleSelectProduct: when product and color are selected auto direct to cement input
const oldHandleSelectProduct = `  const handleSelectProduct = (product) => {
    if (he === "main") {
      E(product.id);
      const pColors = product.colors && Array.isArray(product.colors) ? product.colors.filter(c => c && c.trim() && c.toLowerCase() !== "standard") : [];
      k(pColors.length > 0 ? pColors[0] : "Standard");
    } else if (he === "residual" && oe) {`;

const newHandleSelectProduct = `  const handleSelectProduct = (product) => {
    if (he === "main") {
      E(product.id);
      const pColors = product.colors && Array.isArray(product.colors) ? product.colors.filter(c => c && c.trim() && c.toLowerCase() !== "standard") : [];
      const chosenColor = pColors.length > 0 ? pColors[0] : "Standard";
      k(chosenColor);
      // Requirement 3: If a product and color are selected auto direct user to input cement qty
      if (pColors.length <= 1) {
        setTimeout(focusCementInput, 60);
      }
    } else if (he === "residual" && oe) {`;

if (!prodCode.includes(oldHandleSelectProduct)) {
  console.error('ERROR: oldHandleSelectProduct not found!');
  process.exit(1);
}
prodCode = prodCode.replace(oldHandleSelectProduct, newHandleSelectProduct);
console.log('4. Auto direct to cement input on single/no color product selection');

// 5. In color select dropdown: when user picks/changes color, auto direct to cement input
const oldColorSelect = `                          o.jsx("select", {
                            id: "product-color-select",
                            value: j,
                            onChange: ev => k(ev.target.value),
                            "aria-label": "Select Product Color",`;

const newColorSelect = `                          o.jsx("select", {
                            id: "product-color-select",
                            value: j,
                            onChange: ev => {
                              k(ev.target.value);
                              // Requirement 3: Auto direct to input cement qty
                              setTimeout(focusCementInput, 60);
                            },
                            "aria-label": "Select Product Color",`;

if (!prodCode.includes(oldColorSelect)) {
  console.error('ERROR: oldColorSelect not found!');
  process.exit(1);
}
prodCode = prodCode.replace(oldColorSelect, newColorSelect);
console.log('5. Auto direct to cement input on color selection');

// 6. In handleAddBatchToDaily: reset product selection to "Select Product" (""), and clear all inputs
const oldAddBatchTail = `    if (editingBatchId) {
      setStagedBatches(prev => prev.map(b => b.id === editingBatchId ? newBatch : b));
      setEditingBatchId(null);
    } else {
      setStagedBatches(prev => [...prev, newBatch]);
    }

    // Reset inputs to blank
    b("");
    L("");
    fe([]);
    Y("");
  };`;

const newAddBatchTail = `    if (editingBatchId) {
      setStagedBatches(prev => prev.map(b => b.id === editingBatchId ? newBatch : b));
      setEditingBatchId(null);
    } else {
      setStagedBatches(prev => [...prev, newBatch]);
    }

    // Requirement 3: "If the users add first batch to lrdger the product selection should always reset to select product."
    E("");
    k("Standard");
    b("");
    L("");
    fe([]);
    Y("");
  };`;

if (!prodCode.includes(oldAddBatchTail)) {
  console.error('ERROR: oldAddBatchTail not found!');
  process.exit(1);
}
prodCode = prodCode.replace(oldAddBatchTail, newAddBatchTail);
console.log('6. Reset product selection to "Select Product" on adding batch to daily ledger');

// 7. Update aggregateMaterialsUsed to cleanly sum exact materials
const oldAggMaterials = `  const aggregateMaterialsUsed = B.useMemo(() => {
    return stagedBatches.reduce((acc, b) => {
      acc.cement += b.cementBags || 0;
      acc.sand += (b.materialsUsed && b.materialsUsed.sand_buckets) || 0;
      acc.chipping += (b.materialsUsed && b.materialsUsed.chipping_buckets) || 0;
      acc.aggregate += (b.materialsUsed && b.materialsUsed.aggregate_buckets) || 0;
      acc.chemical += (b.materialsUsed && b.materialsUsed.chemical_liters) || 0;
      return acc;
    }, { cement: 0, sand: 0, chipping: 0, aggregate: 0, chemical: 0 });
  }, [stagedBatches]);`;

const newAggMaterials = `  const aggregateMaterialsUsed = B.useMemo(() => {
    return stagedBatches.reduce((acc, b) => {
      acc.cement = Number((acc.cement + (Number(b.cementBags) || 0)).toFixed(2));
      acc.sand = Number((acc.sand + Number((b.materialsUsed && b.materialsUsed.sand_buckets) || 0)).toFixed(2));
      acc.chipping = Number((acc.chipping + Number((b.materialsUsed && b.materialsUsed.chipping_buckets) || 0)).toFixed(2));
      acc.aggregate = Number((acc.aggregate + Number((b.materialsUsed && b.materialsUsed.aggregate_buckets) || 0)).toFixed(2));
      acc.chemical = Number((acc.chemical + Number((b.materialsUsed && b.materialsUsed.chemical_liters) || 0)).toFixed(2));
      acc.pigment = Number((acc.pigment + Number((b.materialsUsed && b.materialsUsed.pigment_kg) || 0)).toFixed(2));
      acc.pigmentRed = Number((acc.pigmentRed + Number((b.materialsUsed && b.materialsUsed.pigment_red_kg) || 0)).toFixed(2));
      acc.pigmentBlack = Number((acc.pigmentBlack + Number((b.materialsUsed && b.materialsUsed.pigment_black_kg) || 0)).toFixed(2));
      return acc;
    }, { cement: 0, sand: 0, chipping: 0, aggregate: 0, chemical: 0, pigment: 0, pigmentRed: 0, pigmentBlack: 0 });
  }, [stagedBatches]);`;

if (!prodCode.includes(oldAggMaterials)) {
  console.error('ERROR: oldAggMaterials not found!');
  process.exit(1);
}
prodCode = prodCode.replace(oldAggMaterials, newAggMaterials);
console.log('7. Exact aggregate materials calculation');

// 8. Cement Bags Input: add cementInputRef, onWheel blur, onKeyDown prevent non-digits, sanitize onChange
const cementRegex = /(children:\s*"Cement bags"\s*\}\),\s*o\.jsx\("input",\s*\{)([\s\S]*?)(placeholder:\s*""\s*\}\))/;
if (!cementRegex.test(prodCode)) {
  console.error('ERROR: cementRegex not found!');
  process.exit(1);
}
prodCode = prodCode.replace(cementRegex, (match, prefix, middle, suffix) => {
  return `${prefix}
                                ref: cementInputRef,
                                type: "number",
                                step: "0.5",
                                min: "0",
                                className: "input mono",
                                style: { width: "100%", height: "54px", fontSize: "24px", fontWeight: 800, color: "#f8fafc", background: "var(--bg-input)", borderColor: "var(--border-subtle)", borderRadius: "8px", padding: "0 14px" },
                                value: x,
                                onWheel: handleWheelBlur,
                                onKeyDown: e => handleNumericKeyDown(e, true),
                                onChange: K => {
                                  let val = K.target.value.replace(/[^0-9.]/g, "");
                                  const parts = val.split(".");
                                  if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
                                  if (val.length > 1 && val.startsWith("0") && val[1] !== ".") {
                                    val = val.replace(/^0+(?=\d)/, "");
                                  }
                                  b(val);
                                },
                                ${suffix}`;
});
console.log('8. Cement bags input updated with ref, onWheel blur, keyboard only');

// 9. Actual physical counted pcs: onWheel blur, onKeyDown integer only, sanitize onChange
const pcsRegex = /(children:\s*"Actual physical counted pcs"\s*\}\),\s*o\.jsx\("input",\s*\{)([\s\S]*?)(placeholder:\s*""\s*\}\))/;
if (!pcsRegex.test(prodCode)) {
  console.error('ERROR: pcsRegex not found!');
  process.exit(1);
}
prodCode = prodCode.replace(pcsRegex, (match, prefix, middle, suffix) => {
  return `${prefix}
                                type: "number",
                                min: "0",
                                className: "input mono",
                                style: { width: "100%", height: "54px", fontSize: "24px", fontWeight: 800, color: "#34d399", background: "var(--bg-input)", borderColor: "var(--border-subtle)", borderRadius: "8px", padding: "0 14px" },
                                value: A,
                                onWheel: handleWheelBlur,
                                onKeyDown: e => handleNumericKeyDown(e, false),
                                onChange: K => {
                                  let val = K.target.value.replace(/[^0-9]/g, "");
                                  if (val.length > 1 && val.startsWith("0")) {
                                    val = val.replace(/^0+(?=\d)/, "");
                                  }
                                  L(val);
                                },
                                ${suffix}`;
});
console.log('9. Counted pcs input updated with onWheel blur, keyboard only');

// 10. Residual pcs input: onWheel blur, onKeyDown integer only, sanitize onChange
const resStart = prodCode.indexOf('item.quantity_pcs');
if (resStart === -1) {
  console.error('ERROR: item.quantity_pcs not found!');
  process.exit(1);
}
const resInputStart = prodCode.lastIndexOf('o.jsx("input",', resStart);
const resPlaceholder = prodCode.indexOf('placeholder: ""', resStart);
const resInputEnd = prodCode.indexOf('})', resPlaceholder) + 2;

const oldResSnippet = prodCode.slice(resInputStart, resInputEnd);
const newResSnippet = `o.jsx("input", {
                            type: "number",
                            min: "1",
                            className: "input mono",
                            style: { fontSize: "14px", fontWeight: 700, height: "34px", padding: "0 10px" },
                            value: item.quantity_pcs,
                            onWheel: handleWheelBlur,
                            onKeyDown: e => handleNumericKeyDown(e, false),
                            onChange: ev => {
                              let val = ev.target.value.replace(/[^0-9]/g, "");
                              if (val.length > 1 && val.startsWith("0")) {
                                val = val.replace(/^0+(?=\d)/, "");
                              }
                              handleUpdateResidualQty(item.id, val);
                            },
                            placeholder: ""
                          })`;

prodCode = prodCode.slice(0, resInputStart) + newResSnippet + prodCode.slice(resInputEnd);
console.log('10. Residual pcs input updated with onWheel blur, keyboard only');

// 11. Daily Confirmation Page (showAuditModal): add dedicated Cement Balance & Stock Card
const modalSec2Regex = /(children:\s*"2\. Total Raw Materials Consumed"\s*\}\),\s*)(o\.jsxs\("div",\s*\{\s*style:\s*\{\s*display:\s*"grid",\s*gridTemplateColumns:\s*"repeat\(auto-fit)/;
if (!modalSec2Regex.test(prodCode)) {
  console.error('ERROR: modalSec2Regex not found!');
  process.exit(1);
}

const cementCardJsx = `// Requirement 1: Cement Balance & Stock Verification in Daily Confirmation Page
                    o.jsxs("div", {
                      style: {
                        background: "linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(15, 23, 42, 0.6))",
                        border: "1px solid rgba(249, 115, 22, 0.35)",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        marginBottom: "10px"
                      },
                      children: [
                        o.jsxs("div", {
                          style: { display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "6px" },
                          children: [
                            o.jsxs("div", {
                              style: { display: "flex", alignItems: "center", gap: "6px" },
                              children: [
                                o.jsx("span", { style: { fontSize: "14px" }, children: "🧱" }),
                                o.jsx("span", { style: { fontSize: "11.5px", fontWeight: 800, color: "#f8fafc", letterSpacing: "0.05em", textTransform: "uppercase" }, children: "Cement Balance & Stock Verification" })
                              ]
                            }),
                            o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "10px", fontWeight: 700, padding: "2px 7px" }, children: "50 kg Bags" })
                          ]
                        }),
                        o.jsxs("div", {
                          style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" },
                          children: [
                            o.jsxs("div", {
                              style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center" },
                              children: [
                                o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Current in Stock" }),
                                o.jsxs("strong", { style: { fontSize: "15px", color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [currentCementStock, " bags"] })
                              ]
                            }),
                            o.jsxs("div", {
                              style: { background: "rgba(239, 68, 68, 0.12)", padding: "8px 6px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.25)", textAlign: "center" },
                              children: [
                                o.jsx("span", { style: { fontSize: "10px", color: "#fca5a5", display: "block", marginBottom: "3px" }, children: "Cement Used" }),
                                o.jsxs("strong", { style: { fontSize: "15px", color: "#f87171", fontFamily: "var(--font-mono)" }, children: ["-", aggregateMaterialsUsed.cement, " bags"] })
                              ]
                            }),
                            o.jsxs("div", {
                              style: {
                                background: (currentCementStock - aggregateMaterialsUsed.cement) < 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.12)",
                                padding: "8px 6px",
                                borderRadius: "8px",
                                border: "1px solid " + ((currentCementStock - aggregateMaterialsUsed.cement) < 0 ? "#ef4444" : "rgba(16, 185, 129, 0.3)"),
                                textAlign: "center"
                              },
                              children: [
                                o.jsx("span", { style: { fontSize: "10px", color: (currentCementStock - aggregateMaterialsUsed.cement) < 0 ? "#fca5a5" : "#6ee7b7", display: "block", marginBottom: "3px" }, children: "Will Remain in Stock" }),
                                o.jsxs("strong", {
                                  style: {
                                    fontSize: "15px",
                                    color: (currentCementStock - aggregateMaterialsUsed.cement) < 0 ? "#f87171" : "#34d399",
                                    fontFamily: "var(--font-mono)"
                                  },
                                  children: [Number((currentCementStock - aggregateMaterialsUsed.cement).toFixed(2)), " bags"]
                                })
                              ]
                            })
                          ]
                        })
                      ]
                    }),
                    `;

prodCode = prodCode.replace(modalSec2Regex, `$1${cementCardJsx}$2`);
console.log('11. Daily Confirmation page updated with Cement Balance & Stock Card');

// Replace in bundle
const newBundle = bundle.slice(0, _1Idx) + prodCode + bundle.slice(b1Idx);

// Syntax validation
console.log('Testing bundle syntax with vm.Script...');
try {
  new vm.Script(newBundle);
  console.log('Syntax check PASSED successfully!');
} catch (err) {
  console.error('Syntax check FAILED:', err);
  process.exit(1);
}

fs.writeFileSync(bundlePath, newBundle, 'utf8');
console.log('Successfully written new bundle to assets/index-hgjhj-0G.js! Size:', newBundle.length);

// Bump service worker cache and index.html
const timestamp = Date.now();
const swPath = path.join(__dirname, '..', 'service-worker.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = 'stumarcot-pwa-[^']+';/, `const CACHE_NAME = 'stumarcot-pwa-v2.3.0-${timestamp}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('Updated service-worker.js cache to v2.3.0-' + timestamp);
}

const htmlPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/src="\.\/assets\/index-hgjhj-0G\.js\?v=\d+"/, `src="./assets/index-hgjhj-0G.js?v=${timestamp}"`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('Updated index.html script tag version to ' + timestamp);
}
