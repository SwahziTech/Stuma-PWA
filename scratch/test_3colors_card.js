const fs = require('fs');
const vm = require('vm');

const cardCode = `ue.map(z => {
  const { item: T, total_pcs: N, total_sqm: S, is_low_stock: D, by_color: F } = z;
  const Z = T.unit === "sqm";
  const se = T.pcs_per_sqm !== null && T.pcs_per_sqm > 0;
  const we = T.colors && T.colors.length > 0;
  const hasSqm = Z && se && S !== null;
  const totalSqmStr = hasSqm ? S.toFixed(2) : null;

  // Prioritize White, Red, Grey for the first 3 colors
  const top3 = [];
  const rest = [];
  if (we) {
    const pref = ["White", "Red", "Grey"];
    pref.forEach(c => {
      const match = T.colors.find(col => col.toLowerCase() === c.toLowerCase());
      if (match && !top3.includes(match)) top3.push(match);
    });
    T.colors.forEach(col => {
      if (!top3.includes(col)) {
        if (top3.length < 3) top3.push(col);
        else rest.push(col);
      }
    });
  }

  const renderColorPill = ie => {
    const Ce = F[ie] || { pcs: 0, sqm: null };
    const colorSqm = (se && Ce.sqm !== null) ? Ce.sqm : (se && T.pcs_per_sqm ? Number((Ce.pcs / T.pcs_per_sqm).toFixed(2)) : null);
    const u = ie === "White", d = ie === "Red", f = ie === "Grey", m = ie === "Black", g = ie === "Maroon";
    const dotClass = u ? "color-dot-White" : d ? "color-dot-Red" : f ? "color-dot-Grey" : m ? "color-dot-Black" : g ? "color-dot-Maroon" : "";

    return o.jsxs("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 6px",
        borderRadius: "5px",
        background: "rgba(255, 255, 255, 0.035)",
        border: "1px solid rgba(255, 255, 255, 0.07)"
      },
      children: [
        o.jsx("span", { className: "color-dot " + dotClass, style: { width: "6px", height: "6px", flexShrink: 0 } }),
        o.jsxs("div", {
          style: { display: "flex", flexDirection: "column", lineHeight: "1" },
          children: [
            o.jsxs("div", {
              style: { fontSize: "11px", fontWeight: 800, color: Ce.pcs > 0 ? "#f8fafc" : "var(--text-muted)" },
              children: [
                colorSqm !== null ? colorSqm.toFixed(2) : Ce.pcs,
                " ",
                o.jsx("span", { style: { fontSize: "8.5px", fontWeight: 600, color: "var(--text-muted)" }, children: colorSqm !== null ? "sqm" : "pcs" })
              ]
            }),
            colorSqm !== null && o.jsxs("div", {
              style: { fontSize: "9px", color: "var(--text-muted)", opacity: 0.65, fontFamily: "var(--font-mono)", marginTop: "1px" },
              children: ["(", Ce.pcs, " pcs)"]
            })
          ]
        })
      ]
    }, ie);
  };

  return o.jsxs("div", {
    className: "card",
    style: {
      padding: "8px 12px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      borderColor: D ? "rgba(245, 158, 11, 0.4)" : void 0,
      background: D ? "linear-gradient(180deg, rgba(245, 158, 11, 0.06), var(--bg-surface-card))" : void 0
    },
    children: [
      // Top Main Row
      o.jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          width: "100%"
        },
        children: [
          // 1. Left (0% -> ~20% width): Category on top, Product name below
          o.jsxs("div", {
            style: { width: "20%", minWidth: "110px", flexShrink: 0 },
            children: [
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", gap: "4px", marginBottom: "1px" },
                children: [
                  o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "9px", padding: "0 4px", lineHeight: "1.3" }, children: T.category }),
                  D && o.jsx("span", { className: "badge badge-warning", style: { fontSize: "8.5px", padding: "0 3px", lineHeight: "1.3" }, children: "LOW" })
                ]
              }),
              o.jsx("div", {
                style: { fontSize: "14px", fontWeight: 800, color: "#ffffff", lineHeight: "1.2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
                title: T.name,
                children: T.name
              })
            ]
          }),

          // 2. Total Stock (~20% -> ~40% width): Positioned beside product name
          o.jsxs("div", {
            style: { width: "20%", minWidth: "80px", flexShrink: 0 },
            children: [
              hasSqm ? o.jsxs("div", {
                children: [
                  o.jsxs("div", {
                    style: { fontSize: "15px", fontWeight: 800, color: "var(--brand-400)", lineHeight: "1.1" },
                    children: [totalSqmStr, " ", o.jsx("span", { style: { fontSize: "10.5px", fontWeight: 600 }, children: "sqm" })]
                  }),
                  o.jsxs("div", {
                    style: { fontSize: "9.5px", color: "var(--text-muted)", opacity: 0.65, fontFamily: "var(--font-mono)", lineHeight: "1", marginTop: "1px" },
                    children: ["(", N, " pcs)"]
                  })
                ]
              }) : o.jsxs("div", {
                children: [
                  o.jsxs("div", {
                    style: { fontSize: "15px", fontWeight: 800, color: "#ffffff", lineHeight: "1.1" },
                    children: [N, " ", o.jsx("span", { style: { fontSize: "10.5px", fontWeight: 600, color: "var(--text-secondary)" }, children: T.unit || "pcs" })]
                  }),
                  Z && !se && o.jsx("div", { style: { fontSize: "8.5px", color: "#fbbf24" }, children: "sqm not set" })
                ]
              })
            ]
          }),

          // 3. Color qty positioned at 40% of cards width, showing only three colors (White, Red, Grey)
          o.jsx("div", {
            style: {
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flexWrap: "nowrap"
            },
            children: we ? top3.map(renderColorPill) : o.jsxs("div", {
              style: { fontSize: "10.5px", color: "var(--text-muted)", opacity: 0.75 },
              children: ["Single: ", o.jsxs("strong", { style: { color: "#fff" }, children: [N, " pcs"] })]
            })
          }),

          // 4. Top right corner: small +produce and below it -sell buttons
          o.jsxs("div", {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "3px",
              alignItems: "flex-end",
              flexShrink: 0
            },
            children: [
              o.jsx("button", {
                type: "button",
                onClick: () => s("production", T.id),
                className: "btn btn-primary btn-sm",
                style: {
                  padding: "1px 6px",
                  fontSize: "10px",
                  height: "20px",
                  minHeight: "20px",
                  borderRadius: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  fontWeight: 700,
                  lineHeight: "1"
                },
                title: "Log production for " + T.name,
                children: "+produce"
              }),
              o.jsx("button", {
                type: "button",
                onClick: () => s("sales", T.id),
                className: "btn btn-secondary btn-sm",
                style: {
                  padding: "1px 6px",
                  fontSize: "10px",
                  height: "20px",
                  minHeight: "20px",
                  borderRadius: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  color: "#f87171",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                  fontWeight: 700,
                  lineHeight: "1"
                },
                title: "Record sale for " + T.name,
                children: "-sell"
              })
            ]
          })
        ]
      }),

      // If more than 3 colors, shown below expanding the particular product card
      rest.length > 0 && o.jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "5px",
          marginLeft: "40%",
          paddingTop: "3px",
          borderTop: "1px dashed rgba(255, 255, 255, 0.07)",
          flexWrap: "wrap"
        },
        children: [
          o.jsx("span", { style: { fontSize: "9.5px", color: "var(--text-muted)", fontWeight: 600 }, children: "More:" }),
          rest.map(renderColorPill)
        ]
      })
    ]
  }, T.id);
})`;

try {
  new vm.Script('function test() { return (' + cardCode + '); }');
  console.log('✓ 3-color card JSX is 100% syntactically valid!');
} catch (e) {
  console.error('✗ Syntax error:', e);
}
