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

const newLedgerContent = `            children: stagedSales.map(sale => {
              const isSingleItem = sale.items.length === 1;

              return o.jsxs("div", {
                key: sale.id,
                style: {
                  background: editingSaleId === sale.id ? "rgba(249, 115, 22, 0.1)" : "var(--bg-surface-elevated)",
                  border: editingSaleId === sale.id ? "1px solid var(--brand-500)" : "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: isSingleItem ? "10px 14px" : "12px 14px",
                  display: "grid",
                  gridTemplateColumns: "minmax(170px, 1.1fr) minmax(210px, 1.8fr) minmax(170px, 1.1fr) auto",
                  alignItems: "center",
                  gap: "14px",
                  transition: "border-color 0.15s ease"
                },
                children: [
                  
                  // Left Side: Customer Details
                  // Single line for 1 product; 3 lines for multiple products
                  isSingleItem ? o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", fontSize: "12.5px" },
                    children: [
                      o.jsxs("strong", { style: { color: "#f8fafc", display: "inline-flex", alignItems: "center", gap: "4px" }, children: [
                        o.jsx("span", { children: "👤" }),
                        sale.customerName
                      ]}),
                      o.jsxs("span", { style: { color: "var(--text-secondary)" }, children: ["· 📞 ", sale.customerContacts] }),
                      sale.deliverySite && sale.deliverySite !== "Factory Collection" && o.jsxs("span", { style: { color: "var(--text-muted)" }, children: ["· 📍 ", sale.deliverySite] })
                    ]
                  }) : o.jsxs("div", {
                    style: { display: "flex", flexDirection: "column", gap: "2px" },
                    children: [
                      o.jsxs("strong", { style: { fontSize: "13px", color: "#f8fafc", display: "inline-flex", alignItems: "center", gap: "4px" }, children: [
                        o.jsx("span", { children: "👤" }),
                        sale.customerName
                      ]}),
                      o.jsxs("div", { style: { fontSize: "11px", color: "var(--text-secondary)" }, children: [
                        "📞 ", sale.customerContacts, sale.customerTin && sale.customerTin !== "N/A" ? " · TIN: " + sale.customerTin : ""
                      ]}),
                      o.jsxs("div", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: [
                        "📍 ", sale.deliverySite || "Factory Collection"
                      ]})
                    ]
                  }),

                  // Middle: Product Details
                  // Single line for 1 product; Listed line-by-line in small fonts for multiple products
                  isSingleItem ? o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", fontSize: "12.5px" },
                    children: [
                      o.jsxs("strong", { style: { color: "var(--brand-400)", display: "inline-flex", alignItems: "center", gap: "4px" }, children: [
                        o.jsx("span", { children: "📦" }),
                        sale.items[0].itemName,
                        sale.items[0].color && sale.items[0].color !== "Standard" ? " (" + sale.items[0].color + ")" : ""
                      ]}),
                      sale.items[0].size && o.jsxs("span", { style: { color: "var(--text-muted)", fontSize: "11.5px" }, children: ["· 📐 ", sale.items[0].size] }),
                      o.jsxs("span", { style: { color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono)" }, children: [
                        "· 🔢 ", sale.totalPcs.toLocaleString(), " pcs",
                        sale.totalSqm > 0 ? " (" + sale.totalSqm + " m²)" : ""
                      ]})
                    ]
                  }) : o.jsx("div", {
                    style: { display: "flex", flexDirection: "column", gap: "3px" },
                    children: sale.items.map((it, idx) => o.jsxs("div", {
                      key: it.subId || idx,
                      style: { fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px", lineHeight: "1.3" },
                      children: [
                        o.jsxs("span", { style: { fontWeight: 700, color: "var(--brand-400)" }, children: [idx + 1, "."] }),
                        o.jsxs("strong", { style: { color: "#f8fafc" }, children: [
                          it.itemName,
                          it.color && it.color !== "Standard" ? " (" + it.color + ")" : ""
                        ]}),
                        o.jsx("span", { style: { color: "var(--text-muted)" }, children: "—" }),
                        o.jsxs("span", { style: { color: "#34d399", fontWeight: 600, fontFamily: "var(--font-mono)" }, children: [
                          it.qty, " ", it.sellingUnit,
                          it.qtyPcs && it.sellingUnit === "m²" ? " (" + it.qtyPcs + " pcs)" : ""
                        ]})
                      ]
                    }))
                  }),

                  // Right Side: Amount and Total Amount
                  // Single line for 1 product; 3 lines for multiple products
                  isSingleItem ? o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", fontSize: "12.5px" },
                    children: [
                      o.jsxs("span", { style: { color: "var(--text-secondary)", fontSize: "12px" }, children: ["@", formatMoney(sale.items[0].sellingPrice), " Tsh"] }),
                      o.jsxs("strong", { style: { color: "#34d399", fontFamily: "var(--font-mono)" }, children: ["Total: ", formatMoney(sale.totalAmount), " Tsh"] }),
                      o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "10px", padding: "1px 6px" }, children: sale.items[0].account || "Cash" })
                    ]
                  }) : o.jsxs("div", {
                    style: { display: "flex", flexDirection: "column", gap: "2px" },
                    children: [
                      o.jsxs("div", { style: { fontSize: "11px", color: "var(--text-secondary)" }, children: [
                        "📦 ", sale.items.length, " items (", sale.totalPcs.toLocaleString(), " pcs)"
                      ]}),
                      o.jsxs("div", { style: { fontSize: "13.5px", fontWeight: 800, color: "#34d399", fontFamily: "var(--font-mono)" }, children: [
                        "Total: ", formatMoney(sale.totalAmount), " Tsh"
                      ]}),
                      o.jsxs("div", { style: { fontSize: "11px", color: "var(--brand-400)", fontWeight: 600 }, children: [
                        "🏦 ", sale.items[0].account || "Cash"
                      ]})
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
              });
            })
          })
        ]
      }),

`;

const updatedContent = fileContent.slice(0, startIndex) + newLedgerContent + fileContent.slice(endIndex);

fs.writeFileSync('scratch/build_sales_code.js', updatedContent, 'utf8');
console.log('Successfully updated Daily Sales Ledger to exact format in scratch/build_sales_code.js!');
