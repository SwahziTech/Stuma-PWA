const fs = require('fs');
const vm = require('vm');

const fmtQty = (val) => val != null ? Math.round(Number(val) || 0).toLocaleString() : "0";

console.log('Test fmtQty(1234.56):', fmtQty(1234.56)); // Expect 1,235
console.log('Test fmtQty(24.49):', fmtQty(24.49));     // Expect 24
console.log('Test fmtQty(600):', fmtQty(600));         // Expect 600
console.log('Test fmtQty(10500):', fmtQty(10500));     // Expect 10,500

const cardCode = `ue.map(z => {
  const { item: T, total_pcs: N, total_sqm: S, is_low_stock: D, by_color: F } = z;
  const Z = T.unit === "sqm";
  const se = T.pcs_per_sqm !== null && T.pcs_per_sqm > 0;
  const we = T.colors && T.colors.length > 0;
  const hasSqm = Z && se && S !== null;
  const fmt = V => V != null ? Math.round(Number(V) || 0).toLocaleString() : "0";
  const totalSqmStr = hasSqm ? fmt(S) : null;

  const numColors = we ? T.colors.length : 0;
  const isCrowded = numColors >= 4;
  const isVeryCrowded = numColors >= 5;

  return o.jsxs("div", {
    className: "card",
    style: {
      padding: "6px 12px",
      height: "58px",
      minHeight: "58px",
      maxHeight: "58px",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px",
      borderColor: D ? "rgba(255, 255, 255, 0.18)" : "var(--border-subtle)",
      background: "var(--bg-surface-card)"
    },
    children: [
      // 1. Left (0% -> ~20% width): Category on top, Product name below
      o.jsxs("div", {
        style: { width: "20%", minWidth: "110px", maxWidth: "20%", flexShrink: 0, overflow: "hidden" },
        children: [
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "4px", marginBottom: "1px" },
            children: [
              o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "9px", padding: "0 4px", lineHeight: "1.3", background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }, children: T.category }),
              D && o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "8.5px", padding: "0 3px", lineHeight: "1.3", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }, children: "LOW" })
            ]
          }),
          o.jsx("div", {
            style: { fontSize: "14px", fontWeight: 700, color: "#ffffff", lineHeight: "1.2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
            title: T.name,
            children: T.name
          })
        ]
      }),

      // 2. Total Stock (~20% -> ~40% width): Whole numbers with thousand separators
      o.jsxs("div", {
        style: { width: "20%", minWidth: "80px", maxWidth: "20%", flexShrink: 0 },
        children: [
          hasSqm ? o.jsxs("div", {
            children: [
              o.jsxs("div", {
                style: { fontSize: "15px", fontWeight: 700, color: "#f8fafc", lineHeight: "1.1" },
                children: [totalSqmStr, " ", o.jsx("span", { style: { fontSize: "10.5px", fontWeight: 500, color: "var(--text-muted)" }, children: "sqm" })]
              }),
              o.jsxs("div", {
                style: { fontSize: "9.5px", color: "var(--text-muted)", opacity: 0.65, fontFamily: "var(--font-mono)", lineHeight: "1", marginTop: "1px" },
                children: ["(", fmt(N), " pcs)"]
              })
            ]
          }) : o.jsxs("div", {
            children: [
              o.jsxs("div", {
                style: { fontSize: "15px", fontWeight: 700, color: "#f8fafc", lineHeight: "1.1" },
                children: [fmt(N), " ", o.jsx("span", { style: { fontSize: "10.5px", fontWeight: 500, color: "var(--text-muted)" }, children: T.unit || "pcs" })]
              }),
              Z && !se && o.jsx("div", { style: { fontSize: "8.5px", color: "var(--text-muted)" }, children: "sqm not set" })
            ]
          })
        ]
      }),

      // 3. Color qtys positioned at 40% of cards width, ALWAYS ALIGNED ON THE LEFT with whole numbers & thousand separators
      o.jsx("div", {
        style: {
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: isVeryCrowded ? "3px" : isCrowded ? "4px" : "6px",
          flexWrap: "nowrap",
          justifyContent: "flex-start",
          minWidth: 0,
          overflow: "hidden"
        },
        children: we ? T.colors.map(ie => {
          const Ce = F[ie] || { pcs: 0, sqm: null };
          const colorSqm = (se && Ce.sqm !== null) ? Ce.sqm : (se && T.pcs_per_sqm ? Ce.pcs / T.pcs_per_sqm : null);
          const u = ie === "White", d = ie === "Red", f = ie === "Grey", m = ie === "Black", g = ie === "Maroon";
          const dotClass = u ? "color-dot-White" : d ? "color-dot-Red" : f ? "color-dot-Grey" : m ? "color-dot-Black" : g ? "color-dot-Maroon" : "";

          return o.jsxs("div", {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: isVeryCrowded ? "2px 4px" : isCrowded ? "3px 6px" : "4px 8px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              minWidth: isVeryCrowded ? "38px" : isCrowded ? "46px" : "58px",
              flexShrink: 1
            },
            children: [
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", gap: isVeryCrowded ? "2px" : "4px", marginBottom: "1px" },
                children: [
                  o.jsx("span", { className: "color-dot " + dotClass, style: { width: isVeryCrowded ? "5px" : isCrowded ? "6px" : "7px", height: isVeryCrowded ? "5px" : isCrowded ? "6px" : "7px", flexShrink: 0 } }),
                  o.jsx("span", { style: { fontSize: isVeryCrowded ? "9px" : isCrowded ? "10px" : "11px", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }, children: isVeryCrowded ? ie.slice(0, 1) : ie })
                ]
              }),
              o.jsxs("div", {
                style: { fontSize: isVeryCrowded ? "10.5px" : isCrowded ? "12px" : "12.5px", fontWeight: 700, color: Ce.pcs > 0 ? "#f8fafc" : "var(--text-muted)", lineHeight: "1" },
                children: [
                  colorSqm !== null ? fmt(colorSqm) : fmt(Ce.pcs),
                  " ",
                  o.jsx("span", { style: { fontSize: isVeryCrowded ? "7.5px" : isCrowded ? "8.5px" : "9px", fontWeight: 500, color: "var(--text-muted)" }, children: colorSqm !== null ? "sqm" : "pcs" })
                ]
              }),
              colorSqm !== null && o.jsxs("div", {
                style: { fontSize: isVeryCrowded ? "8.5px" : isCrowded ? "9.5px" : "10px", color: "var(--text-muted)", opacity: 0.65, fontFamily: "var(--font-mono)", fontWeight: 500, marginTop: "1px" },
                children: ["(", fmt(Ce.pcs), ")"]
              })
            ]
          }, ie);
        }) : o.jsxs("div", {
          style: { fontSize: "11px", color: "var(--text-muted)", opacity: 0.65 },
          children: ["Single: ", o.jsxs("strong", { style: { color: "#cbd5e1" }, children: [fmt(N), " pcs"] })]
        })
      }),

      // 4. Top right corner: minimal neutral +produce (green +) and -sell (red -) buttons
      o.jsxs("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          alignItems: "flex-end",
          flexShrink: 0,
          marginLeft: "auto"
        },
        children: [
          o.jsxs("button", {
            type: "button",
            onClick: () => s("production", T.id),
            style: {
              padding: "2px 7px",
              fontSize: "10px",
              height: "20px",
              minHeight: "20px",
              borderRadius: "4px",
              display: "inline-flex",
              alignItems: "center",
              fontWeight: 600,
              lineHeight: "1",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#f8fafc",
              cursor: "pointer"
            },
            title: "Log production for " + T.name,
            children: [
              o.jsx("span", { style: { color: "#22c55e", fontWeight: 800, marginRight: "2px", fontSize: "11px" }, children: "+" }),
              "Produce"
            ]
          }),
          o.jsxs("button", {
            type: "button",
            onClick: () => s("sales", T.id),
            style: {
              padding: "2px 7px",
              fontSize: "10px",
              height: "20px",
              minHeight: "20px",
              borderRadius: "4px",
              display: "inline-flex",
              alignItems: "center",
              fontWeight: 600,
              lineHeight: "1",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#cbd5e1",
              cursor: "pointer"
            },
            title: "Record sale for " + T.name,
            children: [
              o.jsx("span", { style: { color: "#ef4444", fontWeight: 800, marginRight: "2px", fontSize: "11px" }, children: "-" }),
              "Sell"
            ]
          })
        ]
      })
    ]
  }, T.id);
})`;

try {
  new vm.Script('function test() { return (' + cardCode + '); }');
  console.log('✓ Whole number with thousand separator card JSX syntax is 100% valid!');
} catch (e) {
  console.error('✗ Syntax error:', e);
}
