const fs = require('fs');
const vm = require('vm');

let fileContent = fs.readFileSync('scratch/build_sales_code.js', 'utf8');

// Find the boundaries of Card 2's inner form: from `// Form Area:` to right before `      // Action Button: Add Sale to Ledger`
const startMarker = '// Form Area:';
const endMarker = '      // Action Button: Add Sale to Ledger';

const startIndex = fileContent.indexOf(startMarker);
const endIndex = fileContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found! startIndex:', startIndex, 'endIndex:', endIndex);
  process.exit(1);
}

console.log('Found section to replace from', startIndex, 'to', endIndex);

const newCard2Content = `// Form Area: Product hero, Money & Quantity inputs, Add Product button & Subcards
            o.jsxs("div", {
              style: { display: "flex", flexDirection: "column", gap: "16px" },
              children: [
                // Product Hero Banner: Always visible with either active product or "Select Product" prompt
                o.jsxs("div", {
                  style: { background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" },
                  children: [
                    // Left: Change/Select Product Button & Color Picker
                    o.jsxs("div", {
                      style: { display: "flex", flexDirection: "column", gap: "8px", minWidth: "150px" },
                      children: [
                        o.jsxs("button", {
                          type: "button",
                          onClick: () => setShowProductModal(true),
                          className: activeItem ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm",
                          style: { background: activeItem ? "var(--bg-input)" : undefined, border: "1px solid var(--border-subtle)", color: "#f8fafc", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", width: "160px" },
                          children: [
                            o.jsx("span", { children: activeItem ? "Change Product" : "Select Product" }),
                            o.jsx(activeItem ? wc : vr, { size: 14, color: activeItem ? "var(--text-muted)" : "#ffffff" })
                          ]
                        }),
                        activeItem && activeItem.colors && activeItem.colors.length > 0 && o.jsxs("div", {
                          style: { position: "relative" },
                          children: [
                            o.jsxs("button", {
                              type: "button",
                              onClick: () => setShowColorDropdown(!showColorDropdown),
                              className: "btn btn-secondary btn-sm",
                              style: { background: "var(--bg-input)", border: "1px solid var(--border-subtle)", color: "#f8fafc", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", width: "160px" },
                              children: [
                                o.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                                  o.jsx("span", { style: { color: "var(--text-secondary)" }, children: "Color:" }),
                                  o.jsx(xr, { color: selectedColor, showCount: false }),
                                  o.jsx("strong", { children: selectedColor })
                                ]}),
                                o.jsx(wc, { size: 12, color: "var(--text-muted)" })
                              ]
                            }),
                            showColorDropdown && o.jsx("div", {
                              style: { position: "absolute", top: "100%", left: 0, marginTop: "4px", width: "160px", background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", zIndex: 30, padding: "4px" },
                              children: activeItem.colors.map(col => o.jsxs("button", {
                                key: col,
                                type: "button",
                                onClick: () => handleSelectColor(col),
                                style: { display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "6px 10px", background: selectedColor === col ? "rgba(249,115,22,0.15)" : "transparent", border: "none", borderRadius: "6px", color: "#f8fafc", fontSize: "12px", cursor: "pointer", textAlign: "left" },
                                children: [
                                  o.jsx(xr, { color: col, showCount: false }),
                                  o.jsx("span", { children: col })
                                ]
                              }))
                            })
                          ]
                        })
                      ]
                    }),

                    // Center: Product Name, Category & Specs
                    o.jsxs("div", {
                      style: { textAlign: "center", flex: 1, minWidth: "180px" },
                      children: [
                        o.jsx("div", { style: { fontSize: "11px", fontWeight: 700, color: "var(--brand-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }, children: activeItem ? activeItem.category : "PRODUCT CATALOG" }),
                        o.jsxs("div", {
                          style: { display: "inline-flex", alignItems: "center", gap: "8px" },
                          children: [
                            o.jsx("span", { style: { fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }, children: activeItem ? activeItem.name : "Select a Product to Sell" }),
                            activeItem && selectedColor && selectedColor !== "Standard" && o.jsxs("span", {
                              className: "badge",
                              style: { background: "rgba(255,255,255,0.08)", border: "1px solid var(--border-subtle)", color: "#f8fafc", fontSize: "11px", padding: "2px 8px" },
                              children: [o.jsx(xr, { color: selectedColor, showCount: false }), selectedColor]
                            })
                          ]
                        }),
                        o.jsx("div", { style: { fontSize: "12px", fontWeight: 600, color: "var(--brand-400)", marginTop: "2px" }, children: activeItem ? (activeItem.unit === "sqm" && activeItem.pcs_per_sqm ? activeItem.pcs_per_sqm + " pcs/sqm" : (Ua(activeItem) || activeItem.unit)) : "Click 'Select Product' button to choose item" })
                      ]
                    }),

                    // Right: Stock & Accurate Pricelist Indicator
                    o.jsxs("div", {
                      style: { textAlign: "right", minWidth: "180px", display: "flex", flexDirection: "column", gap: "6px" },
                      children: [
                        o.jsxs("div", {
                          style: { fontSize: "12px", color: "var(--text-secondary)" },
                          children: [
                            "Current In Stock: ",
                            o.jsx("strong", { style: { color: activeStock && activeStock.total_pcs > 0 ? "#34d399" : "#f87171" }, children: activeItem ? (activeStock ? activeStock.total_pcs + " pcs" : "0 pcs") : "—" }),
                            activeStock && activeStock.total_sqm !== null && o.jsxs("span", { style: { color: "var(--brand-400)", marginLeft: "4px" }, children: ["(", activeStock.total_sqm, " m²)"] })
                          ]
                        }),
                        o.jsxs("div", {
                          style: { display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" },
                          children: [
                            o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "#f8fafc" }, children: ["Unit price :"] }),
                            o.jsx("div", {
                              style: { background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "4px 10px", fontSize: "12.5px", fontFamily: "var(--font-mono)", color: "var(--brand-400)", fontWeight: 700 },
                              children: activeItem && activePricelist.defaultPrice > 0 ? formatMoney(activePricelist.defaultPrice) + " Tsh/" + activePricelist.unitLabel : "price as per pricelist"
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }),

                // Inputs Layout: Exact User Specification
                // At Top: 3 things (selling price, qty, account)
                // Below: 2 things (total amount, vat section)
                o.jsxs("div", {
                  style: { display: "flex", flexDirection: "column", gap: "16px" },
                  children: [
                    // Top Row: 3 things (Selling price, Qty, Account)
                    o.jsxs("div", {
                      style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", alignItems: "start" },
                      children: [
                        // 1. Selling price
                        o.jsxs("div", {
                          children: [
                            o.jsxs("label", { style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }, children: [
                              o.jsxs("span", { children: ["Selling price", activePricelist.unitLabel ? " (per " + activePricelist.unitLabel + ")" : ""] }),
                              isCustomPrice && o.jsx("button", {
                                type: "button",
                                onClick: () => { setIsCustomPrice(false); setSellingPriceInput(""); },
                                style: { background: "none", border: "none", color: "var(--brand-400)", fontSize: "11px", cursor: "pointer", textDecoration: "underline" },
                                children: "Reset to pricelist"
                              })
                            ]}),
                            o.jsx("input", {
                              type: "number",
                              className: "input-field mono",
                              placeholder: activePricelist.defaultPrice > 0 ? String(activePricelist.defaultPrice) : "Unit price as per pricelist",
                              value: isCustomPrice ? sellingPriceInput : (activePricelist.defaultPrice > 0 ? activePricelist.defaultPrice : ""),
                              onChange: e => {
                                setIsCustomPrice(true);
                                setSellingPriceInput(e.target.value);
                              },
                              style: { fontSize: "15px", fontWeight: 700, color: "#f8fafc" }
                            })
                          ]
                        }),

                        // 2. Qty
                        o.jsxs("div", {
                          children: [
                            o.jsxs("label", { style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }, children: [
                              o.jsxs("span", { children: ["Qty", activePricelist.unitLabel ? " (" + activePricelist.unitLabel + ")" : ""] }),
                              parsedQty > 0 && activePricelist.isSqm && activeItem && activeItem.pcs_per_sqm && o.jsxs("span", { style: { color: "var(--brand-400)", fontSize: "11px" }, children: ["≈ ", Math.round(parsedQty * activeItem.pcs_per_sqm), " pcs"] })
                            ]}),
                            o.jsx("input", {
                              type: "number",
                              min: "0",
                              step: "any",
                              className: "input-field mono",
                              placeholder: activePricelist.isSqm ? "Qty in m²..." : "Qty in pcs...",
                              value: quantityInput,
                              onChange: e => setQuantityInput(e.target.value),
                              style: { fontSize: "16px", fontWeight: 700, color: "#f87171" }
                            })
                          ]
                        }),

                        // 3. Account
                        o.jsxs("div", {
                          children: [
                            o.jsx("label", { style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }, children: "Account" }),
                            o.jsxs("select", {
                              className: "input-field",
                              value: paymentAccount,
                              onChange: e => setPaymentAccount(e.target.value),
                              style: { fontSize: "13.5px", fontWeight: 600, color: "#f8fafc", cursor: "pointer", height: "46px" },
                              children: [
                                o.jsx("option", { value: "Cash", children: "Cash" }),
                                o.jsx("option", { value: "CRDB Bank", children: "CRDB Bank" }),
                                o.jsx("option", { value: "NMB Bank", children: "NMB Bank" }),
                                o.jsx("option", { value: "M-Pesa", children: "M-Pesa" }),
                                o.jsx("option", { value: "Airtel Money", children: "Airtel Money" }),
                                o.jsx("option", { value: "Tigo Pesa", children: "Tigo Pesa" }),
                                o.jsx("option", { value: "Credit / Invoice", children: "Credit / Invoice" })
                              ]
                            })
                          ]
                        })
                      ]
                    }),

                    // Below: 2 things (Total amount, VAT section)
                    o.jsxs("div", {
                      style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", alignItems: "end" },
                      children: [
                        // 1. Total Amount
                        o.jsxs("div", {
                          children: [
                            o.jsx("label", { style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }, children: "Total Amount" }),
                            o.jsx("input", {
                              type: "text",
                              readOnly: true,
                              className: "input-field mono",
                              value: activeTotalAmount > 0 ? formatMoney(activeTotalAmount) + " Tsh" : "",
                              placeholder: "0 Tsh",
                              style: { fontSize: "16px", fontWeight: 800, color: "#34d399", background: "rgba(16, 185, 129, 0.06)", cursor: "default", height: "46px" }
                            })
                          ]
                        }),

                        // 2. VAT section (heading removed since section shows VAT or discount)
                        o.jsx("div", {
                          children: [
                            o.jsx("div", {
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
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }),

                // Button: Add Another Product to Sale
                o.jsxs("button", {
                  type: "button",
                  onClick: handleAddAnotherProduct,
                  className: "btn btn-secondary",
                  style: { borderStyle: "dashed", borderColor: "rgba(249, 115, 22, 0.45)", color: "var(--brand-400)", width: "100%", minHeight: "44px", fontWeight: 700 },
                  children: [
                    o.jsx(vr, { size: 16 }),
                    o.jsx("span", { children: "+ Add Another Product to Sale" })
                  ]
                }),

                // Subcard list: auto-summarized products added to this customer sale
                // ALWAYS visible right below the "+ Add Another Product to Sale" button!
                // Appears immediately when product is added, before selecting another product.
                addedProducts.length > 0 && o.jsxs("div", {
                  style: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" },
                  children: [
                    o.jsxs("div", {
                      style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "space-between" },
                      children: [
                        o.jsxs("span", { children: ["Items in this Customer Sale (", addedProducts.length, ")"] }),
                        o.jsxs("span", { style: { color: "#34d399" }, children: ["Subtotal: ", formatMoney(addedProducts.reduce((sum, p) => sum + p.totalAmount, 0)), " Tsh"] })
                      ]
                    }),
                    addedProducts.map((sub, idx) => o.jsxs("div", {
                      key: sub.subId,
                      style: { background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" },
                      children: [
                        o.jsxs("div", {
                          style: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1 },
                          children: [
                            o.jsxs("span", { style: { fontWeight: 800, fontSize: "11.5px", color: "var(--brand-400)" }, children: ["#", idx + 1] }),
                            o.jsxs("strong", { style: { fontSize: "13.5px", color: "#f8fafc" }, children: [sub.itemName, sub.color && sub.color !== "Standard" ? " (" + sub.color + ")" : ""] }),
                            o.jsxs("span", { style: { fontSize: "12px", color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono)" }, children: [sub.qty, " ", sub.sellingUnit, sub.qtyPcs && sub.sellingUnit === "m²" ? " (" + sub.qtyPcs + " pcs)" : ""] }),
                            o.jsxs("span", { style: { fontSize: "12px", color: "var(--text-secondary)" }, children: ["@", formatMoney(sub.sellingPrice), " Tsh"] }),
                            o.jsxs("span", { style: { fontSize: "12.5px", fontWeight: 700, color: "#f8fafc" }, children: ["= ", formatMoney(sub.totalAmount), " Tsh"] }),
                            o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "10px", padding: "1px 6px" }, children: sub.account })
                          ]
                        }),
                        o.jsxs("div", {
                          style: { display: "flex", alignItems: "center", gap: "4px" },
                          children: [
                            o.jsx("button", {
                              type: "button",
                              onClick: () => handleEditSubProduct(sub),
                              className: "btn-ghost",
                              style: { padding: "4px 6px", color: "var(--brand-400)", cursor: "pointer", border: "none", background: "none", fontSize: "12px" },
                              title: "Edit item",
                              children: "✏️"
                            }),
                            o.jsx("button", {
                              type: "button",
                              onClick: () => handleRemoveSubProduct(sub.subId),
                              className: "btn-ghost",
                              style: { padding: "4px 6px", color: "#f87171", cursor: "pointer", border: "none", background: "none", fontSize: "13px" },
                              title: "Remove item",
                              children: "✕"
                            })
                          ]
                        })
                      ]
                    }))
                  ]
                })
              ]
            })
          )
        ]
      }),
`;

const updatedContent = fileContent.slice(0, startIndex) + newCard2Content + fileContent.slice(endIndex);

fs.writeFileSync('scratch/build_sales_code.js', updatedContent, 'utf8');
console.log('Successfully updated scratch/build_sales_code.js!');
