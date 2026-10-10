const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

// 1. Update Cement stock -> Stock
const oldCementStockLine = `children: ["Cement stock : ", Number((currentCementStock - aggregateMaterialsUsed.cement).toFixed(1))]`;
const newCementStockLine = `children: ["Stock : ", Number((currentCementStock - aggregateMaterialsUsed.cement).toFixed(1))]`;

if (!bundle.includes(oldCementStockLine)) {
  console.error('ERROR: Could not find oldCementStockLine');
  process.exit(1);
}

bundle = bundle.replace(oldCementStockLine, newCementStockLine);
console.log('1. Replaced "Cement stock : " with "Stock : "');

// 2. Update aggregateMaterialsUsed to ensure pigmentRed / pigmentBlack fallback
const oldAgg = `acc.pigmentRed = Number((acc.pigmentRed + Number((b.materialsUsed && b.materialsUsed.pigment_red_kg) || 0)).toFixed(2));
      acc.pigmentBlack = Number((acc.pigmentBlack + Number((b.materialsUsed && b.materialsUsed.pigment_black_kg) || 0)).toFixed(2));
      return acc;`;

const newAgg = `const bRed = Number((b.materialsUsed && b.materialsUsed.pigment_red_kg) || (b.color && (b.color.toLowerCase().includes("red") || b.color.toLowerCase().includes("maroon")) ? (b.materialsUsed && b.materialsUsed.pigment_kg) : 0) || 0);
      const bBlack = Number((b.materialsUsed && b.materialsUsed.pigment_black_kg) || (b.color && (b.color.toLowerCase().includes("black") || b.color.toLowerCase().includes("grey")) ? (b.materialsUsed && b.materialsUsed.pigment_kg) : 0) || 0);
      acc.pigmentRed = Number((acc.pigmentRed + bRed).toFixed(2));
      acc.pigmentBlack = Number((acc.pigmentBlack + bBlack).toFixed(2));
      if (acc.pigmentRed === 0 && acc.pigmentBlack === 0 && acc.pigment > 0) {
        acc.pigmentRed = acc.pigment;
      }
      return acc;`;

if (bundle.includes(oldAgg)) {
  bundle = bundle.replace(oldAgg, newAgg);
  console.log('2. Updated aggregateMaterialsUsed for pigment red / black accumulation');
} else {
  console.warn('Warning: oldAgg not found exactly, check snippet');
}

// 3. Update Section 2 Rangi consumption to specify color either red or black
const oldRangiCard = `aggregateMaterialsUsed.pigment > 0 ? o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Rangi" }),
                            o.jsxs("strong", { style: { fontSize: "14px", color: "#f87171", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }, children: [aggregateMaterialsUsed.pigment, " kg"] })
                          ]
                        }) : null`;

const newRangiCard = `aggregateMaterialsUsed.pigmentRed > 0 ? o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Rangi (Red)" }),
                            o.jsxs("strong", { style: { fontSize: "14px", color: "#f87171", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }, children: [aggregateMaterialsUsed.pigmentRed, " kg"] })
                          ]
                        }) : null,
                        aggregateMaterialsUsed.pigmentBlack > 0 ? o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "8px 6px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px", whiteSpace: "nowrap" }, children: "Rangi (Black)" }),
                            o.jsxs("strong", { style: { fontSize: "14px", color: "#94a3b8", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }, children: [aggregateMaterialsUsed.pigmentBlack, " kg"] })
                          ]
                        }) : null`;

if (!bundle.includes(oldRangiCard)) {
  console.error('ERROR: Could not find oldRangiCard');
  process.exit(1);
}

bundle = bundle.replace(oldRangiCard, newRangiCard);
console.log('3. Replaced Rangi consumption with color-specified Rangi (Red) and Rangi (Black)');

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
console.log('Successfully written updated bundle to assets/index-hgjhj-0G.js!');

// Bump cache version
const timestamp = Date.now();
const swPath = path.join(__dirname, '..', 'service-worker.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = ['"][^'"]+['"];/, `const CACHE_NAME = 'stumarcot-pwa-v2.1.4-${timestamp}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('Updated service-worker.js cache to v2.1.4-' + timestamp);
}

const htmlPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/src="\.\/assets\/index-hgjhj-0G\.js\?v=\d+"/, `src="./assets/index-hgjhj-0G.js?v=${timestamp}"`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('Updated index.html script tag version to ' + timestamp);
}
