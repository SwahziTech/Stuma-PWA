const fs = require('fs');

let code = fs.readFileSync('scratch/build_sales_code.js', 'utf8');

// 1. Qty input text color: remove bright red #f87171 -> use standard #f8fafc
code = code.replace(
  'style: { fontSize: "16px", fontWeight: 700, color: "#f87171" }',
  'style: { fontSize: "16px", fontWeight: 700, color: "#f8fafc" }'
);

// 2. Total Amount input: remove neon green #34d399 and green background -> use clean #f8fafc and var(--bg-input)
code = code.replace(
  'style: { fontSize: "16px", fontWeight: 800, color: "#34d399", background: "rgba(16, 185, 129, 0.06)", cursor: "default", height: "46px" }',
  'style: { fontSize: "16px", fontWeight: 800, color: "#f8fafc", background: "var(--bg-input)", border: "1px solid var(--border-subtle)", cursor: "default", height: "46px" }'
);

// 3. Stock in header: remove #34d399 / #f87171 neon -> use clean #f8fafc
code = code.replace(
  'style: { color: activeStock && activeStock.total_pcs > 0 ? "#34d399" : "#f87171" }',
  'style: { color: "#f8fafc" }'
);

// 4. VAT / Metric Box: replace neon backgrounds with clean var(--bg-surface-elevated) & var(--border-subtle)
// and unify text colors with #f8fafc & #eab308
const oldVatBox = `                            o.jsx("div", {
                              style: {
                                background: discountDiff > 0 ? "rgba(245, 158, 11, 0.08)" : discountDiff < 0 ? "rgba(56, 189, 248, 0.08)" : "rgba(16, 185, 129, 0.08)",
                                border: "1px solid " + (discountDiff > 0 ? "rgba(245, 158, 11, 0.3)" : discountDiff < 0 ? "rgba(56, 189, 248, 0.3)" : "rgba(16, 185, 129, 0.25)"),
                                borderRadius: "var(--radius-md)",
                                padding: "6px 14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "8px",
                                minHeight: "46px",
                                boxSizing: "border-box"
                              },
                              children: discountDiff > 0 ? o.jsxs(o.Fragment, {
                                children: [
                                  o.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                                    o.jsx("span", { style: { fontSize: "13px" }, children: "🏷️" }),
                                    o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "#fbbf24" }, children: ["Discount: -Tsh ", formatMoney(discountDiff), "/", activePricelist.unitLabel, " (", discountPct.toFixed(1), "%)"] })
                                  ]}),
                                  o.jsxs("div", { style: { fontSize: "11.5px", color: "var(--text-secondary)" }, children: [
                                    "Total Saved: ",
                                    o.jsx("strong", { style: { color: "#fbbf24" }, children: ["Tsh ", formatMoney(discountDiff * parsedQty)] })
                                  ]})
                                ]
                              }) : discountDiff < 0 ? o.jsxs(o.Fragment, {
                                children: [
                                  o.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                                    o.jsx("span", { style: { fontSize: "13px" }, children: "📈" }),
                                    o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "#38bdf8" }, children: ["Above List: +Tsh ", formatMoney(Math.abs(discountDiff)), "/", activePricelist.unitLabel] })
                                  ]}),
                                  o.jsxs("div", { style: { fontSize: "11.5px", color: "var(--text-secondary)" }, children: [
                                    "Total Premium: ",
                                    o.jsx("strong", { style: { color: "#38bdf8" }, children: ["Tsh ", formatMoney(Math.abs(discountDiff) * parsedQty)] })
                                  ]})
                                ]
                              }) : o.jsxs(o.Fragment, {
                                children: [
                                  o.jsxs("div", {
                                    style: { display: "flex", alignItems: "center", gap: "6px" },
                                    children: [
                                      o.jsx("span", { style: { fontSize: "13px" }, children: "🧾" }),
                                      o.jsxs("div", {
                                        style: { display: "flex", flexDirection: "column", lineHeight: 1.15 },
                                        children: [
                                          o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "#34d399" }, children: ["VAT : Tsh ", formatMoney(unitVatAmount), activePricelist.unitLabel ? "/" + activePricelist.unitLabel : ""] }),
                                          o.jsx("span", { style: { fontSize: "9.5px", color: "var(--text-muted)", fontWeight: 500 }, children: "18%" })
                                        ]
                                      })
                                    ]
                                  }),
                                  o.jsxs("div", { style: { fontSize: "11.5px", color: "var(--text-secondary)" }, children: [
                                    "Total VAT: ",
                                    o.jsx("strong", { style: { color: "#34d399" }, children: ["Tsh ", formatMoney(totalVatAmount)] })
                                  ]})
                                ]
                              })
                            })`;

const newVatBox = `                            o.jsx("div", {
                              style: {
                                background: "var(--bg-surface-elevated)",
                                border: discountDiff > 0 ? "1px solid rgba(234, 179, 8, 0.3)" : "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-md)",
                                padding: "6px 14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "8px",
                                minHeight: "46px",
                                boxSizing: "border-box"
                              },
                              children: discountDiff > 0 ? o.jsxs(o.Fragment, {
                                children: [
                                  o.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                                    o.jsx("span", { style: { fontSize: "13px" }, children: "🏷️" }),
                                    o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "#eab308" }, children: ["Discount: -Tsh ", formatMoney(discountDiff), "/", activePricelist.unitLabel, " (", discountPct.toFixed(1), "%)"] })
                                  ]}),
                                  o.jsxs("div", { style: { fontSize: "11.5px", color: "var(--text-secondary)" }, children: [
                                    "Total Saved: ",
                                    o.jsx("strong", { style: { color: "#eab308" }, children: ["Tsh ", formatMoney(discountDiff * parsedQty)] })
                                  ]})
                                ]
                              }) : discountDiff < 0 ? o.jsxs(o.Fragment, {
                                children: [
                                  o.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                                    o.jsx("span", { style: { fontSize: "13px" }, children: "📈" }),
                                    o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "var(--brand-400)" }, children: ["Above List: +Tsh ", formatMoney(Math.abs(discountDiff)), "/", activePricelist.unitLabel] })
                                  ]}),
                                  o.jsxs("div", { style: { fontSize: "11.5px", color: "var(--text-secondary)" }, children: [
                                    "Total Premium: ",
                                    o.jsx("strong", { style: { color: "var(--brand-400)" }, children: ["Tsh ", formatMoney(Math.abs(discountDiff) * parsedQty)] })
                                  ]})
                                ]
                              }) : o.jsxs(o.Fragment, {
                                children: [
                                  o.jsxs("div", {
                                    style: { display: "flex", alignItems: "center", gap: "6px" },
                                    children: [
                                      o.jsx("span", { style: { fontSize: "13px" }, children: "🧾" }),
                                      o.jsxs("div", {
                                        style: { display: "flex", flexDirection: "column", lineHeight: 1.15 },
                                        children: [
                                          o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "#f8fafc" }, children: ["VAT : Tsh ", formatMoney(unitVatAmount), activePricelist.unitLabel ? "/" + activePricelist.unitLabel : ""] }),
                                          o.jsx("span", { style: { fontSize: "9.5px", color: "var(--text-muted)", fontWeight: 500 }, children: "18%" })
                                        ]
                                      })
                                    ]
                                  }),
                                  o.jsxs("div", { style: { fontSize: "11.5px", color: "var(--text-secondary)" }, children: [
                                    "Total VAT: ",
                                    o.jsx("strong", { style: { color: "#f8fafc" }, children: ["Tsh ", formatMoney(totalVatAmount)] })
                                  ]})
                                ]
                              })
                            })`;

code = code.replace(oldVatBox, newVatBox);

// 5. In Subcards: replace #34d399 with #f8fafc
code = code.replace(
  'o.jsxs("span", { style: { color: "#34d399" }, children: ["Subtotal: ", formatMoney(addedProducts.reduce((sum, p) => sum + p.totalAmount, 0)), " Tsh"] })',
  'o.jsxs("span", { style: { color: "#f8fafc", fontWeight: 800 }, children: ["Subtotal: ", formatMoney(addedProducts.reduce((sum, p) => sum + p.totalAmount, 0)), " Tsh"] })'
);

code = code.replace(
  'o.jsxs("span", { style: { fontSize: "12px", color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono)" }, children: [sub.qty, " ", sub.sellingUnit, sub.qtyPcs && sub.sellingUnit === "m²" ? " (" + sub.qtyPcs + " pcs)" : ""] })',
  'o.jsxs("span", { style: { fontSize: "12px", color: "#f8fafc", fontWeight: 700, fontFamily: "var(--font-mono)" }, children: [sub.qty, " ", sub.sellingUnit, sub.qtyPcs && sub.sellingUnit === "m²" ? " (" + sub.qtyPcs + " pcs)" : ""] })'
);

// 6. In Daily Sales Ledger: replace #34d399 in counts and amounts with clean #f8fafc (mono)
code = code.replace(
  'o.jsxs("span", { style: { color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono)" }, children: [',
  'o.jsxs("span", { style: { color: "#f8fafc", fontWeight: 700, fontFamily: "var(--font-mono)" }, children: ['
);

code = code.replace(
  'o.jsxs("span", { style: { color: "#34d399", fontWeight: 600, fontFamily: "var(--font-mono)" }, children: [',
  'o.jsxs("span", { style: { color: "#f8fafc", fontWeight: 600, fontFamily: "var(--font-mono)" }, children: ['
);

code = code.replace(
  'o.jsxs("strong", { style: { color: "#34d399", fontFamily: "var(--font-mono)" }, children: ["Total: ", formatMoney(sale.totalAmount), " Tsh"] })',
  'o.jsxs("strong", { style: { color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: ["Total: ", formatMoney(sale.totalAmount), " Tsh"] })'
);

code = code.replace(
  'o.jsxs("div", { style: { fontSize: "13.5px", fontWeight: 800, color: "#34d399", fontFamily: "var(--font-mono)" }, children: [',
  'o.jsxs("div", { style: { fontSize: "13.5px", fontWeight: 800, color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: ['
);

// 7. Staged sales badge in ledger header: use production tab badge style
code = code.replace(
  'style: { background: stagedSales.length > 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", color: stagedSales.length > 0 ? "#34d399" : "var(--text-muted)", fontSize: "11px", fontWeight: 700 }',
  'style: { background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", color: stagedSales.length > 0 ? "var(--brand-400)" : "var(--text-muted)", fontSize: "11px", fontWeight: 700 }'
);

fs.writeFileSync('scratch/build_sales_code.js', code, 'utf8');
console.log('Successfully updated scratch/build_sales_code.js to mimic production tab color scheme!');
