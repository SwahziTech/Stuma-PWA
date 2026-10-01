const fs = require('fs');

let fileContent = fs.readFileSync('scratch/build_sales_code.js', 'utf8');

const startMarker = '            children: stagedSales.map(sale => o.jsxs("div", {';
const endMarker = '      // Bottom CTA: Confirm Sales Dispatch (Deduct Stock)';

const startIndex = fileContent.indexOf(startMarker);
const endIndex = fileContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found! startIndex:', startIndex, 'endIndex:', endIndex);
  process.exit(1);
}

console.log('Found section to replace from', startIndex, 'to', endIndex);

const newLedgerContent = `            children: stagedSales.map(sale => o.jsxs("div", {
              key: sale.id,
              style: {
                background: editingSaleId === sale.id ? "rgba(249, 115, 22, 0.1)" : "var(--bg-surface-elevated)",
                border: editingSaleId === sale.id ? "1px solid var(--brand-500)" : "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                transition: "border-color 0.15s ease"
              },
              children: [
                // Horizontal Details: Customer, Product, Money all in horizontal flow
                o.jsxs("div", {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    flex: 1
                  },
                  children: [
                    // 1. Customer Details (Horizontal)
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
                      children: [
                        o.jsxs("strong", {
                          style: { fontSize: "13.5px", color: "#f8fafc", display: "flex", alignItems: "center", gap: "4px" },
                          children: [
                            o.jsx("span", { children: "👤" }),
                            sale.customerName
                          ]
                        }),
                        o.jsxs("span", {
                          style: { fontSize: "12px", color: "var(--text-secondary)" },
                          children: ["📞 ", sale.customerContacts]
                        }),
                        sale.deliverySite && sale.deliverySite !== "Factory Collection" && o.jsxs("span", {
                          style: { fontSize: "12px", color: "var(--text-muted)" },
                          children: ["📍 ", sale.deliverySite]
                        })
                      ]
                    }),

                    o.jsx("span", { style: { color: "var(--border-subtle)", fontSize: "14px", userSelect: "none" }, children: "•" }),

                    // 2. Product Details (Horizontal)
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
                      children: [
                        o.jsxs("span", {
                          style: { fontSize: "13px", fontWeight: 700, color: "var(--brand-400)", display: "flex", alignItems: "center", gap: "4px" },
                          children: [
                            o.jsx("span", { children: "📦" }),
                            sale.items.length === 1 
                              ? (sale.items[0].itemName + (sale.items[0].color && sale.items[0].color !== "Standard" ? " (" + sale.items[0].color + ")" : ""))
                              : (sale.items.length + " Products (" + sale.items.map(i => i.itemName).join(", ") + ")")
                          ]
                        }),
                        sale.items.length === 1 && sale.items[0].size && o.jsxs("span", {
                          style: { fontSize: "11.5px", color: "var(--text-muted)" },
                          children: ["📐 ", sale.items[0].size]
                        }),
                        o.jsxs("span", {
                          style: { fontSize: "12.5px", color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono)" },
                          children: [
                            sale.totalPcs.toLocaleString(), " pcs",
                            sale.totalSqm > 0 ? " (" + sale.totalSqm + " m²)" : ""
                          ]
                        })
                      ]
                    }),

                    o.jsx("span", { style: { color: "var(--border-subtle)", fontSize: "14px", userSelect: "none" }, children: "•" }),

                    // 3. Money Details (Horizontal)
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
                      children: [
                        sale.items.length === 1 && o.jsxs("span", {
                          style: { fontSize: "12px", color: "var(--text-secondary)" },
                          children: ["@", formatMoney(sale.items[0].sellingPrice), " Tsh"]
                        }),
                        o.jsxs("strong", {
                          style: { fontSize: "13.5px", color: "#f8fafc", fontFamily: "var(--font-mono)" },
                          children: ["= ", formatMoney(sale.totalAmount), " Tsh"]
                        }),
                        o.jsx("span", {
                          className: "badge badge-neutral",
                          style: { fontSize: "10.5px", padding: "2px 7px" },
                          children: sale.items[0].account || "Cash"
                        })
                      ]
                    })
                  ]
                }),

                // Action Icons (View Details, Edit, Delete)
                o.jsxs("div", {
                  style: { display: "flex", alignItems: "center", gap: "4px" },
                  children: [
                    o.jsx("button", {
                      type: "button",
                      onClick: () => setViewSaleDetail(sale),
                      className: "btn-ghost",
                      style: { padding: "6px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer", background: "none", border: "none" },
                      title: "View Details",
                      children: "👁️"
                    }),
                    o.jsx("button", {
                      type: "button",
                      onClick: () => handleEditStagedSale(sale),
                      className: "btn-ghost",
                      style: { padding: "6px", color: "var(--brand-400)", fontSize: "13px", cursor: "pointer", background: "none", border: "none" },
                      title: "Edit Sale",
                      children: "✏️"
                    }),
                    o.jsx("button", {
                      type: "button",
                      onClick: () => handleDeleteStagedSale(sale.id),
                      className: "btn-ghost",
                      style: { padding: "6px", color: "#f87171", fontSize: "13px", cursor: "pointer", background: "none", border: "none" },
                      title: "Delete Sale",
                      children: "🗑️"
                    })
                  ]
                })
              ]
            }))
          })
        ]
      }),

      // Bottom CTA: Confirm Sales Dispatch (Deduct Stock)
`;

const updatedContent = fileContent.slice(0, startIndex) + newLedgerContent + fileContent.slice(endIndex);

fs.writeFileSync('scratch/build_sales_code.js', updatedContent, 'utf8');
console.log('Successfully updated Daily Sales Ledger to horizontal layout in scratch/build_sales_code.js!');
