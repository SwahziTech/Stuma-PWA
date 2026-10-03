const fs = require('fs');
const vm = require('vm');

const compactCardJSX = `ue.map(z => {
  const { item: T, total_pcs: N, total_sqm: S, is_low_stock: D, by_color: F } = z;
  const Z = T.unit === "sqm";
  const se = T.pcs_per_sqm !== null && T.pcs_per_sqm > 0;
  const we = T.colors && T.colors.length > 0;
  const hasSqm = Z && se && S !== null;
  const totalSqmStr = hasSqm ? S.toFixed(2) : null;

  return o.jsxs("div", {
    className: "card",
    style: {
      padding: "6px 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      flexWrap: "wrap",
      borderColor: D ? "rgba(245, 158, 11, 0.4)" : void 0,
      background: D ? "linear-gradient(180deg, rgba(245, 158, 11, 0.06), var(--bg-surface-card))" : void 0
    },
    children: [
      // 1. Left: Category name on top, Product name below (width ~20%)
      o.jsxs("div", {
        style: { width: "20%", minWidth: "120px", flexShrink: 0 },
        children: [
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "4px", marginBottom: "1px" },
            children: [
              o.jsx("span", {
                className: "badge badge-neutral",
                style: { fontSize: "9.5px", padding: "0 5px", lineHeight: "1.3" },
                children: T.category
              }),
              D && o.jsx("span", {
                className: "badge badge-warning",
                style: { fontSize: "9px", padding: "0 4px", lineHeight: "1.3" },
                children: "LOW"
              })
            ]
          }),
          o.jsx("div", {
            style: {
              fontSize: "15px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: "1.2",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            },
            title: T.name,
            children: T.name
          })
        ]
      }),

      // 2. Total stock beside product name, positioned at ~20% of card width
      o.jsxs("div", {
        style: { minWidth: "85px", flexShrink: 0 },
        children: [
          hasSqm ? o.jsxs("div", {
            children: [
              o.jsxs("div", {
                style: { fontSize: "16px", fontWeight: 800, color: "var(--brand-400)", lineHeight: "1.1" },
                children: [totalSqmStr, " ", o.jsx("span", { style: { fontSize: "11px", fontWeight: 600 }, children: "sqm" })]
              }),
              o.jsxs("div", {
                style: { fontSize: "10px", color: "var(--text-muted)", opacity: 0.65, fontFamily: "var(--font-mono)", lineHeight: "1", marginTop: "1px" },
                children: ["(", N, " pcs)"]
              })
            ]
          }) : o.jsxs("div", {
            children: [
              o.jsxs("div", {
                style: { fontSize: "16px", fontWeight: 800, color: "#ffffff", lineHeight: "1.1" },
                children: [N, " ", o.jsx("span", { style: { fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }, children: T.unit || "pcs" })]
              }),
              Z && !se && o.jsx("div", { style: { fontSize: "9px", color: "#fbbf24" }, children: "sqm not set" })
            ]
          })
        ]
      }),

      // 3. Color qtys beside total stock at about the center of the card
      o.jsx("div", {
        style: {
          flex: 1,
          minWidth: "160px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
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
              alignItems: "center",
              gap: "5px",
              padding: "3px 7px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.035)",
              border: "1px solid rgba(255, 255, 255, 0.07)"
            },
            children: [
              o.jsx("span", { className: "color-dot " + dotClass, style: { width: "6.5px", height: "6.5px", flexShrink: 0 } }),
              o.jsxs("div", {
                style: { display: "flex", flexDirection: "column", lineHeight: "1.1" },
                children: [
                  o.jsxs("div", {
                    style: { fontSize: "11.5px", fontWeight: 800, color: Ce.pcs > 0 ? "#f8fafc" : "var(--text-muted)" },
                    children: [
                      colorSqm !== null ? colorSqm.toFixed(2) : Ce.pcs,
                      " ",
                      o.jsx("span", { style: { fontSize: "9px", fontWeight: 600, color: "var(--text-muted)" }, children: colorSqm !== null ? "sqm" : "pcs" })
                    ]
                  }),
                  colorSqm !== null && o.jsxs("div", {
                    style: { fontSize: "9.5px", color: "var(--text-muted)", opacity: 0.65, fontFamily: "var(--font-mono)" },
                    children: ["(", Ce.pcs, " pcs)"]
                  })
                ]
              })
            ]
          }, ie);
        }) : o.jsxs("div", {
          style: { fontSize: "11px", color: "var(--text-muted)", opacity: 0.75 },
          children: ["Single variant: ", o.jsxs("strong", { style: { color: "#fff" }, children: [N, " pcs"] })]
        })
      })
    ]
  }, T.id);
})`;

try {
  new vm.Script('function test() { return (' + compactCardJSX + '); }');
  console.log('✓ compactCardJSX syntax is 100% valid!');
} catch (e) {
  console.error('✗ compactCardJSX error:', e);
}
