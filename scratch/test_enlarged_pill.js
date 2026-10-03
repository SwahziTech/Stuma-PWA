const fs = require('fs');
const vm = require('vm');

const renderColorPill = `const renderColorPill = ie => {
  const Ce = F[ie] || { pcs: 0, sqm: null };
  const colorSqm = (se && Ce.sqm !== null) ? Ce.sqm : (se && T.pcs_per_sqm ? Number((Ce.pcs / T.pcs_per_sqm).toFixed(2)) : null);
  const u = ie === "White", d = ie === "Red", f = ie === "Grey", m = ie === "Black", g = ie === "Maroon";
  const dotClass = u ? "color-dot-White" : d ? "color-dot-Red" : f ? "color-dot-Grey" : m ? "color-dot-Black" : g ? "color-dot-Maroon" : "";

  return o.jsxs("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "5px 10px",
      borderRadius: "8px",
      background: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      minWidth: "68px",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.25)"
    },
    children: [
      o.jsxs("div", {
        style: { display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" },
        children: [
          o.jsx("span", { className: "color-dot " + dotClass, style: { width: "8px", height: "8px", flexShrink: 0 } }),
          o.jsx("span", { style: { fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)" }, children: ie })
        ]
      }),
      o.jsxs("div", {
        style: { fontSize: "13.5px", fontWeight: 800, color: Ce.pcs > 0 ? "#ffffff" : "var(--text-muted)", lineHeight: "1.1" },
        children: [
          colorSqm !== null ? colorSqm.toFixed(2) : Ce.pcs,
          " ",
          o.jsx("span", { style: { fontSize: "10px", fontWeight: 700, color: "var(--brand-400)" }, children: colorSqm !== null ? "sqm" : "pcs" })
        ]
      }),
      colorSqm !== null && o.jsxs("div", {
        style: { fontSize: "11px", color: "var(--text-muted)", opacity: 0.8, fontFamily: "var(--font-mono)", fontWeight: 600, marginTop: "2px" },
        children: ["(", Ce.pcs, " pcs)"]
      })
    ]
  }, ie);
};`;

try {
  new vm.Script('function test() { ' + renderColorPill + ' return renderColorPill; }');
  console.log('✓ Enlarged color pill syntax is 100% valid!');
} catch (e) {
  console.error('✗ Syntax error:', e);
}
