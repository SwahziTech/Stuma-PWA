const fs = require('fs');
const vm = require('vm');

// Mock data to test card rendering
const cardJSX = `ue.map(z => {
  const { item: T, total_pcs: N, total_sqm: S, is_low_stock: D, by_color: F } = z;
  const Z = T.unit === "sqm";
  const se = T.pcs_per_sqm !== null && T.pcs_per_sqm > 0;
  const we = T.colors && T.colors.length > 0;

  // Total quantity calculation
  const hasSqm = Z && se && S !== null;
  const totalSqmStr = hasSqm ? S.toFixed(2) : null;

  return o.jsxs("div", {
    className: "card",
    style: {
      padding: "14px 16px",
      borderColor: D ? "rgba(245, 158, 11, 0.4)" : void 0,
      background: D ? "linear-gradient(180deg, rgba(245, 158, 11, 0.06), var(--bg-surface-card))" : void 0
    },
    children: [
      // 1. Category name on top (same design now just top)
      o.jsxs("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" },
        children: [
          o.jsx("span", {
            className: "badge badge-neutral",
            style: { fontSize: "10.5px", padding: "1px 6px" },
            children: T.category
          }),
          D && o.jsx("span", {
            className: "badge badge-warning",
            style: { fontSize: "10px", padding: "1px 5px" },
            children: "LOW"
          })
        ]
      }),

      // 2. Product name in white and large font below category
      o.jsx("div", {
        style: {
          fontSize: "17.5px",
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "-0.01em",
          lineHeight: "1.25",
          marginTop: "4px",
          marginBottom: "10px"
        },
        children: T.name
      }),

      // 3. Stock Details Row (Stock details only)
      // Just below product name: Total qty in sqm & pcs below in brackets faint font, beside it qty for individual colors in sqm and pcs below
      o.jsxs("div", {
        style: {
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "14px",
          flexWrap: "wrap",
          paddingTop: "6px",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)"
        },
        children: [
          // Total qty (all available colors)
          o.jsxs("div", {
            style: { minWidth: "100px", flexShrink: 0 },
            children: [
              o.jsx("div", {
                style: { fontSize: "10.5px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "2px" },
                children: "Total Stock"
              }),
              hasSqm ? o.jsxs("div", {
                children: [
                  o.jsxs("span", {
                    style: { fontSize: "19px", fontWeight: 800, color: "var(--brand-400)" },
                    children: [totalSqmStr, " ", o.jsx("span", { style: { fontSize: "12px", fontWeight: 600 }, children: "sqm" })]
                  }),
                  o.jsxs("div", {
                    style: { fontSize: "11px", color: "var(--text-muted)", opacity: 0.65, fontFamily: "var(--font-mono)", marginTop: "1px" },
                    children: ["(", N, " pcs)"]
                  })
                ]
              }) : o.jsxs("div", {
                children: [
                  o.jsxs("span", {
                    style: { fontSize: "19px", fontWeight: 800, color: "#ffffff" },
                    children: [N, " ", o.jsx("span", { style: { fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }, children: T.unit || "pcs" })]
                  }),
                  Z && !se && o.jsx("div", { style: { fontSize: "10px", color: "#fbbf24" }, children: "sqm not set" })
                ]
              })
            ]
          }),

          // Beside total qty: Individual colors in sqm and pcs below
          o.jsx("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
              flex: 1,
              justifyContent: "flex-end"
            },
            children: we ? T.colors.map(ie => {
              const Ce = F[ie] || { pcs: 0, sqm: null };
              const colorSqm = (se && Ce.sqm !== null) ? Ce.sqm : (se && T.pcs_per_sqm ? Number((Ce.pcs / T.pcs_per_sqm).toFixed(2)) : null);
              const u = ie === "White", d = ie === "Red", f = ie === "Grey", m = ie === "Black", g = ie === "Maroon";
              const dotClass = u ? "color-dot-White" : d ? "color-dot-Red" : f ? "color-dot-Grey" : m ? "color-dot-Black" : g ? "color-dot-Maroon" : "";

              return o.jsxs("div", {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "5px 9px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.035)",
                  border: "1px solid rgba(255, 255, 255, 0.07)",
                  minWidth: "56px"
                },
                children: [
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "4px", marginBottom: "2px" },
                    children: [
                      o.jsx("span", { className: "color-dot " + dotClass, style: { width: "7px", height: "7px" } }),
                      o.jsx("span", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }, children: ie })
                    ]
                  }),
                  o.jsxs("div", {
                    style: { fontSize: "12.5px", fontWeight: 800, color: Ce.pcs > 0 ? "#f8fafc" : "var(--text-muted)" },
                    children: [
                      colorSqm !== null ? colorSqm.toFixed(2) : Ce.pcs,
                      " ",
                      o.jsx("span", { style: { fontSize: "9.5px", fontWeight: 600, color: "var(--text-muted)" }, children: colorSqm !== null ? "sqm" : "pcs" })
                    ]
                  }),
                  colorSqm !== null && o.jsxs("div", {
                    style: { fontSize: "10.5px", color: "var(--text-muted)", opacity: 0.65, fontFamily: "var(--font-mono)", marginTop: "1px" },
                    children: ["(", Ce.pcs, " pcs)"]
                  })
                ]
              }, ie);
            }) : o.jsxs("div", {
              style: { fontSize: "11.5px", color: "var(--text-muted)", opacity: 0.75 },
              children: ["Single variant: ", o.jsxs("strong", { style: { color: "#fff" }, children: [N, " pcs"] })]
            })
          })
        ]
      })
    ]
  }, T.id);
})`;

try {
  new vm.Script('function test() { return (' + cardJSX + '); }');
  console.log('✓ cardJSX syntax is 100% valid!');
} catch (e) {
  console.error('✗ cardJSX error:', e);
}
