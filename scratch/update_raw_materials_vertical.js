const fs = require('fs');
const { execSync } = require('child_process');

console.log('Updating Raw Material Tabs to Vertical & Trips layout with minimized colors...');

const bundlePath = 'assets/index-hgjhj-0G.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');

const startMarker = 'RawMaterialMasterView = ({ rawMaterials: materials';
const startIdx = bundle.indexOf(startMarker);
const endMarker = 'x1=({onNavigate:s})=>';
const endIdx = bundle.indexOf(endMarker, startIdx);

if (startIdx === -1 || endIdx === -1) {
  throw new Error('Could not find RawMaterialMasterView boundaries');
}

const updatedRawMaterialMasterCode = `RawMaterialMasterView = ({ rawMaterials: materials, addRawMaterialStock, updateRawMaterialMaster, onNavigate, staffName }) => {
  const [searchTerm, setSearchTerm] = B.useState("");
  const [selectedCategory, setSelectedCategory] = B.useState("All");
  
  // Daily Intake Modal State
  const [intakeModalOpen, setIntakeModalOpen] = B.useState(false);
  const [intakeKey, setIntakeKey] = B.useState("cement");
  const [intakeDate, setIntakeDate] = B.useState(() => new Date().toISOString().split("T")[0]);
  const [intakeUnitMode, setIntakeUnitMode] = B.useState("purchase"); // "purchase" (Trips/Bags/Barrels) or "usage" (ndoo/kg/L)
  const [intakeQty, setIntakeQty] = B.useState("");
  const [intakeUnitPrice, setIntakeUnitPrice] = B.useState("");
  const [intakeTotalCost, setIntakeTotalCost] = B.useState("");
  const [intakeSource, setIntakeSource] = B.useState("");
  const [intakeDeliveryRef, setIntakeDeliveryRef] = B.useState("");
  const [intakeNote, setIntakeNote] = B.useState("");

  // Direct Edit Price & Qty Modal State
  const [editModalOpen, setEditModalOpen] = B.useState(false);
  const [editingItem, setEditingItem] = B.useState(null);
  const [editQty, setEditQty] = B.useState(""); // in Trips for bulk, or bags/bars
  const [editPrice, setEditPrice] = B.useState("");
  const [editSource, setEditSource] = B.useState("");
  const [editReorder, setEditReorder] = B.useState("");

  // Toast feedback
  const [toast, setToast] = B.useState(null);
  B.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Categories list
  const categories = B.useMemo(() => {
    const set = new Set();
    materials.forEach(m => { if (m.category) set.add(m.category); });
    return ["All", ...Array.from(set)];
  }, [materials]);

  // Filtered materials
  const filteredMaterials = B.useMemo(() => {
    return materials.filter(m => {
      const matchCat = selectedCategory === "All" || m.category === selectedCategory;
      const s = searchTerm.toLowerCase().trim();
      const matchSearch = !s || 
        m.name.toLowerCase().includes(s) || 
        (m.category && m.category.toLowerCase().includes(s)) ||
        (m.source && m.source.toLowerCase().includes(s)) ||
        (m.nameSwahili && m.nameSwahili.toLowerCase().includes(s));
      return matchCat && matchSearch;
    }).sort((a, b) => (a.no || 0) - (b.no || 0));
  }, [materials, selectedCategory, searchTerm]);

  // Metrics
  const totalValuation = B.useMemo(() => {
    return materials.reduce((acc, m) => {
      const ratio = m.unitRatio || 1;
      const effPrice = (m.purchasePrice || 0) / ratio;
      return acc + ((m.currentBalance || 0) * effPrice);
    }, 0);
  }, [materials]);

  const lowStockItems = B.useMemo(() => {
    return materials.filter(m => (m.currentBalance || 0) <= (m.reorderLevel || 0));
  }, [materials]);

  // Current selected material for intake
  const activeIntakeMat = B.useMemo(() => {
    return materials.find(m => m.key === intakeKey) || materials[0];
  }, [materials, intakeKey]);

  // Helper to format stock count in Trips (primary) and ndoo (small subtext for production)
  const formatStock = B.useCallback((m) => {
    const ratio = m.unitRatio || 1;
    const isTrip = m.purchaseUnit && m.purchaseUnit.includes("Trip");

    if (isTrip) {
      const tripsVal = (m.currentBalance || 0) / ratio;
      const tripsStr = tripsVal % 1 === 0 ? tripsVal.toString() : tripsVal.toFixed(2);
      return {
        mainDisplay: \`\${tripsStr} Trips\`,
        subDetail: \`\${(m.currentBalance || 0).toLocaleString()} ndoo for production\`
      };
    } else if (ratio > 1) {
      const pkgVal = (m.currentBalance || 0) / ratio;
      const pkgStr = pkgVal % 1 === 0 ? pkgVal.toString() : pkgVal.toFixed(2);
      return {
        mainDisplay: \`\${pkgStr} \${m.displayUnit || m.purchaseUnit}\`,
        subDetail: \`\${(m.currentBalance || 0).toLocaleString()} \${m.unit} for production\`
      };
    } else {
      return {
        mainDisplay: \`\${(m.currentBalance || 0).toLocaleString()} \${m.unit}\`,
        subDetail: m.displayUnit || m.purchaseUnit || ""
      };
    }
  }, []);

  const handleSelectIntakeMaterial = (key) => {
    setIntakeKey(key);
    const target = materials.find(m => m.key === key);
    if (target) {
      setIntakeUnitPrice(target.purchasePrice ? target.purchasePrice.toString() : "");
      setIntakeSource(target.source || "");
      if (intakeQty && target.purchasePrice) {
        const qtyNum = parseFloat(intakeQty) || 0;
        setIntakeTotalCost((qtyNum * target.purchasePrice).toFixed(0));
      }
    }
  };

  const openIntakeFor = (item) => {
    setIntakeKey(item.key);
    setIntakeUnitPrice(item.purchasePrice ? item.purchasePrice.toString() : "");
    setIntakeSource(item.source || "");
    setIntakeQty("");
    setIntakeTotalCost("");
    setIntakeDeliveryRef("");
    setIntakeNote("");
    setIntakeUnitMode(item.unitRatio && item.unitRatio > 1 ? "purchase" : "usage");
    setIntakeModalOpen(true);
  };

  const openEditFor = (item) => {
    setEditingItem(item);
    const ratio = item.unitRatio || 1;
    const isTrip = item.purchaseUnit && item.purchaseUnit.includes("Trip");
    
    // If bulk trip material, user edits directly in Trips
    if (isTrip || ratio > 1) {
      const val = (item.currentBalance || 0) / ratio;
      setEditQty(val % 1 === 0 ? val.toString() : val.toFixed(2));
    } else {
      setEditQty((item.currentBalance || 0).toString());
    }

    setEditPrice(item.purchasePrice !== undefined ? item.purchasePrice.toString() : "0");
    setEditSource(item.source || "");
    setEditReorder(item.reorderLevel !== undefined ? item.reorderLevel.toString() : "0");
    setEditModalOpen(true);
  };

  const handleSaveDirectEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    const inputQty = parseFloat(editQty);
    const newPrice = parseFloat(editPrice);
    const newReorder = parseFloat(editReorder);
    
    if (isNaN(inputQty) || inputQty < 0) {
      alert("Please enter a valid stock quantity");
      return;
    }
    if (isNaN(newPrice) || newPrice < 0) {
      alert("Please enter a valid purchase price/cost");
      return;
    }

    const ratio = editingItem.unitRatio || 1;
    const isTrip = editingItem.purchaseUnit && editingItem.purchaseUnit.includes("Trip");
    
    // If entered in Trips or packages, convert to base inventory units for internal tracking
    const finalBalance = (isTrip || ratio > 1) ? Number((inputQty * ratio).toFixed(2)) : inputQty;

    if (updateRawMaterialMaster) {
      updateRawMaterialMaster(editingItem.key, {
        currentBalance: finalBalance,
        purchasePrice: newPrice,
        source: editSource.trim(),
        reorderLevel: isNaN(newReorder) ? editingItem.reorderLevel : newReorder
      });
    }

    setToast({
      title: "Material Master Updated",
      message: \`\${editingItem.name}: Qty set to \${inputQty} \${isTrip ? "Trips" : editingItem.unit}, Price set to \${newPrice.toLocaleString()} Tsh\`
    });
    setEditModalOpen(false);
  };

  const handleSaveIntake = async (e) => {
    e.preventDefault();
    const rawQty = parseFloat(intakeQty);
    if (isNaN(rawQty) || rawQty <= 0) {
      alert("Please enter a valid quantity greater than 0");
      return;
    }

    const priceNum = parseFloat(intakeUnitPrice) || 0;
    const totalCostNum = parseFloat(intakeTotalCost) || (priceNum * rawQty);

    const ratio = (intakeUnitMode === "purchase" && activeIntakeMat.unitRatio && activeIntakeMat.unitRatio > 1) 
      ? activeIntakeMat.unitRatio 
      : 1;
    const finalInventoryQty = rawQty * ratio;

    const isTrip = activeIntakeMat.purchaseUnit && activeIntakeMat.purchaseUnit.includes("Trip");
    const fullNote = [
      intakeDeliveryRef ? \`Ref: \${intakeDeliveryRef}\` : "",
      intakeNote ? intakeNote : "",
      ratio > 1 ? \`(\${rawQty} \${isTrip ? "Trips" : activeIntakeMat.purchaseUnit} = \${finalInventoryQty.toLocaleString()} \${activeIntakeMat.unit})\` : ""
    ].filter(Boolean).join(" · ");

    await addRawMaterialStock(
      activeIntakeMat.key,
      finalInventoryQty,
      fullNote || \`Intake of \${activeIntakeMat.name}\`,
      priceNum,
      totalCostNum,
      intakeSource || activeIntakeMat.source,
      intakeDate
    );

    setToast({
      title: "Material Intake Recorded",
      message: \`+\${rawQty} \${isTrip ? "Trips" : activeIntakeMat.purchaseUnit} \${activeIntakeMat.name} (Tsh \${totalCostNum.toLocaleString()})\`
    });

    setIntakeModalOpen(false);
    setIntakeQty("");
    setIntakeTotalCost("");
    setIntakeDeliveryRef("");
    setIntakeNote("");
  };

  return o.jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: "12px", width: "100%" },
    children: [
      
      // Toast notification
      toast && o.jsxs("div", {
        style: {
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          background: "#0f172a",
          color: "#f8fafc",
          padding: "10px 16px",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          maxWidth: "90vw"
        },
        children: [
          o.jsx("span", { style: { color: "var(--brand-400)", fontSize: "15px" }, children: "✓" }),
          o.jsxs("div", {
            children: [
              o.jsx("strong", { style: { display: "block", fontSize: "12.5px" }, children: toast.title }),
              o.jsx("span", { style: { fontSize: "11px", color: "#cbd5e1" }, children: toast.message })
            ]
          })
        ]
      }),

      // Top Header Row
      o.jsxs("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", paddingBottom: "2px" },
        children: [
          o.jsxs("div", {
            children: [
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", gap: "8px" },
                children: [
                  o.jsx("h2", { style: { fontSize: "17px", fontWeight: 800, color: "#f8fafc", margin: 0 }, children: "Material Master & Live Inventory" }),
                  o.jsx("span", {
                    style: { fontSize: "11px", fontWeight: 700, padding: "2px 7px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1" },
                    children: "13 Materials"
                  })
                ]
              }),
              o.jsx("p", { style: { fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px", margin: 0 }, children: "Master catalog, current purchase costs & live stock counts" })
            ]
          }),
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "8px" },
            children: [
              o.jsxs("button", {
                type: "button",
                onClick: () => {
                  const target = materials[0];
                  openIntakeFor(target);
                },
                className: "btn btn-primary btn-sm",
                style: { padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 },
                children: [
                  o.jsx(t1, { size: 14 }),
                  o.jsx("span", { children: "+ Daily Material Intake" })
                ]
              }),
              o.jsxs("button", {
                type: "button",
                onClick: () => onNavigate("history"),
                className: "btn btn-secondary btn-sm",
                style: { padding: "8px 12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" },
                children: [
                  o.jsx(pc, { size: 14 }),
                  o.jsx("span", { children: "View Ledger" })
                ]
              })
            ]
          })
        ]
      }),

      // Restrained Minimal Top KPI Summary Bar (Single unified look, no multi-color clutter)
      o.jsxs("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          background: "var(--bg-surface-elevated)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "10px",
          padding: "10px 14px"
        },
        children: [
          // Total Valuation
          o.jsxs("div", {
            children: [
              o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Stock Valuation" }),
              o.jsxs("div", {
                style: { fontSize: "16px", fontWeight: 800, color: "#f8fafc", fontFamily: "var(--font-mono)", marginTop: "2px" },
                children: ["Tsh ", Math.round(totalValuation).toLocaleString()]
              })
            ]
          }),

          // Materials Tracked
          o.jsxs("div", {
            style: { borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: "12px" },
            children: [
              o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Materials" }),
              o.jsxs("div", {
                style: { fontSize: "16px", fontWeight: 800, color: "#f8fafc", marginTop: "2px" },
                children: ["13 ", o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }, children: "items" })]
              })
            ]
          }),

          // Reorder Alerts
          o.jsxs("div", {
            style: { borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: "12px" },
            children: [
              o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Safety Status" }),
              o.jsxs("div", {
                style: { fontSize: "16px", fontWeight: 800, color: lowStockItems.length > 0 ? "#fbbf24" : "#f8fafc", marginTop: "2px" },
                children: [
                  lowStockItems.length > 0 ? \`\${lowStockItems.length} Low\` : "All Safe"
                ]
              })
            ]
          })
        ]
      }),

      // Search & Category Filters (Restrained dark styling)
      o.jsxs("div", {
        style: { display: "flex", flexDirection: "column", gap: "8px" },
        children: [
          // Search box
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0 10px" },
            children: [
              o.jsx(ii, { size: 14, color: "var(--text-muted)" }),
              o.jsx("input", {
                type: "text",
                value: searchTerm,
                onChange: e => setSearchTerm(e.target.value),
                placeholder: "Filter material name, category or source (e.g. Msanga, Saruji)...",
                style: { border: "none", background: "transparent", padding: "9px 8px", fontSize: "12.5px", color: "#f8fafc", width: "100%", outline: "none" }
              }),
              searchTerm && o.jsx("button", {
                type: "button",
                onClick: () => setSearchTerm(""),
                style: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "13px" },
                children: "✕"
              })
            ]
          }),

          // Category filter pills
          o.jsx("div", {
            style: { display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" },
            children: categories.map(cat => {
              const count = cat === "All" ? materials.length : materials.filter(m => m.category === cat).length;
              const isActive = selectedCategory === cat;
              return o.jsxs("button", {
                type: "button",
                onClick: () => setSelectedCategory(cat),
                style: {
                  padding: "4px 9px",
                  borderRadius: "6px",
                  border: isActive ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.07)",
                  background: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  fontSize: "11px",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                },
                children: [
                  o.jsx("span", { children: cat }),
                  o.jsxs("span", { style: { opacity: 0.6, fontSize: "10px" }, children: ["(", count, ")"] })
                ]
              }, cat);
            })
          })
        ]
      }),

      // VERTICAL Materials Card List (Arranged vertically, full-width)
      o.jsx("div", {
        style: { display: "flex", flexDirection: "column", gap: "10px", width: "100%" },
        children: filteredMaterials.map(m => {
          const isLow = (m.currentBalance || 0) <= (m.reorderLevel || 0);
          const ratio = m.unitRatio || 1;
          const effPrice = (m.purchasePrice || 0) / ratio;
          const itemValuation = Math.round((m.currentBalance || 0) * effPrice);
          const stockInfo = formatStock(m);

          return o.jsxs("div", {
            className: "card-elevated",
            style: {
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "var(--bg-surface-elevated)",
              border: isLow ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px"
            },
            children: [
              
              // Row 1: Header (No, Category badge, Material Name & Source)
              o.jsxs("div", {
                style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" },
                children: [
                  o.jsxs("div", {
                    style: { display: "flex", flexDirection: "column", gap: "2px" },
                    children: [
                      o.jsxs("div", {
                        style: { display: "flex", alignItems: "center", gap: "6px" },
                        children: [
                          o.jsxs("span", {
                            style: {
                              fontSize: "10.5px",
                              fontWeight: 800,
                              background: "rgba(255, 255, 255, 0.06)",
                              color: "#cbd5e1",
                              padding: "1px 5px",
                              borderRadius: "4px"
                            },
                            children: ["#", m.no || "-"]
                          }),
                          o.jsx("span", {
                            style: {
                              fontSize: "10.5px",
                              fontWeight: 600,
                              background: "rgba(255, 255, 255, 0.04)",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                              color: "#cbd5e1",
                              padding: "1px 6px",
                              borderRadius: "4px"
                            },
                            children: m.category
                          })
                        ]
                      }),
                      o.jsx("h3", {
                        style: { fontSize: "15px", fontWeight: 800, color: "#f8fafc", margin: "2px 0 0 0" },
                        children: m.name
                      }),
                      m.source && o.jsxs("div", {
                        style: { fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" },
                        children: ["📍 Source: ", o.jsx("span", { style: { color: "#cbd5e1" }, children: m.source })]
                      })
                    ]
                  }),

                  // Status badge (low stock or healthy)
                  isLow ? o.jsx("span", {
                    style: {
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: "rgba(245, 158, 11, 0.12)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      color: "#fbbf24",
                      whiteSpace: "nowrap"
                    },
                    children: "LOW STOCK"
                  }) : o.jsx("span", {
                    style: {
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "#94a3b8",
                      whiteSpace: "nowrap"
                    },
                    children: "HEALTHY"
                  })
                ]
              }),

              // Row 2: Stock Count & Purchase Price (Structured cleanly)
              o.jsxs("div", {
                style: {
                  background: "var(--bg-surface)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                },
                children: [
                  
                  // Left: Stock Count in TRIPS (Main) and ndoo in small font (Additional detail for production)
                  o.jsxs("div", {
                    children: [
                      o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "Current Stock Count" }),
                      o.jsx("div", {
                        style: { fontSize: "18px", fontWeight: 800, color: "#f8fafc", fontFamily: "var(--font-mono)" },
                        children: stockInfo.mainDisplay
                      }),
                      // Small font additional detail: ndoo used only in production
                      stockInfo.subDetail ? o.jsx("div", {
                        style: { fontSize: "10.5px", color: "var(--text-muted)", marginTop: "2px" },
                        children: stockInfo.subDetail
                      }) : null
                    ]
                  }),

                  // Right: Current Purchase Price / Cost
                  o.jsxs("div", {
                    style: { borderLeft: "1px solid rgba(255, 255, 255, 0.07)", paddingLeft: "10px" },
                    children: [
                      o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "Current Purchase Price" }),
                      o.jsxs("div", {
                        style: { fontSize: "14px", fontWeight: 800, color: "#f8fafc", fontFamily: "var(--font-mono)" },
                        children: ["Tsh ", (m.purchasePrice || 0).toLocaleString()]
                      }),
                      o.jsxs("div", {
                        style: { fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" },
                        children: ["per ", m.purchaseUnit]
                      })
                    ]
                  })
                ]
              }),

              // Row 3: Valuation, Threshold & Quick Action Buttons
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", paddingTop: "2px" },
                children: [
                  o.jsxs("div", {
                    style: { fontSize: "11px", color: "var(--text-muted)" },
                    children: [
                      "Valuation: ",
                      o.jsxs("strong", { style: { color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: ["Tsh ", itemValuation.toLocaleString()] })
                    ]
                  }),

                  // Action Buttons (Edit Price & Qty, or Intake)
                  o.jsxs("div", {
                    style: { display: "flex", gap: "6px" },
                    children: [
                      o.jsxs("button", {
                        type: "button",
                        onClick: () => openEditFor(m),
                        className: "btn btn-secondary btn-sm",
                        style: { padding: "5px 9px", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" },
                        children: [
                          o.jsx("span", { children: "✏️" }),
                          o.jsx("span", { children: "Edit Price/Qty" })
                        ]
                      }),
                      o.jsxs("button", {
                        type: "button",
                        onClick: () => openIntakeFor(m),
                        className: "btn btn-primary btn-sm",
                        style: { padding: "5px 9px", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" },
                        children: [
                          o.jsx(t1, { size: 11 }),
                          o.jsx("span", { children: "Intake" })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }, m.key);
        })
      }),

      // Direct Edit Modal (Price & Qty in Trips)
      editModalOpen && editingItem && o.jsx("div", {
        className: "modal-overlay",
        onClick: () => setEditModalOpen(false),
        children: o.jsxs("div", {
          className: "modal-content",
          onClick: e => e.stopPropagation(),
          style: { padding: "20px", maxWidth: "440px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)" },
          children: [
            o.jsxs("div", {
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsxs("h3", { style: { fontSize: "16px", fontWeight: 800, margin: 0, color: "#f8fafc" }, children: ["Edit Material: ", editingItem.name] }),
                    o.jsx("p", { style: { fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }, children: "Update stock count (Trips/Qty), purchase price and source" })
                  ]
                }),
                o.jsx("button", {
                  type: "button",
                  onClick: () => setEditModalOpen(false),
                  className: "btn btn-ghost btn-sm",
                  children: "✕"
                })
              ]
            }),

            o.jsxs("form", {
              onSubmit: handleSaveDirectEdit,
              style: { display: "flex", flexDirection: "column", gap: "12px" },
              children: [
                
                // Qty Input in Trips (or bags/bars)
                o.jsxs("div", {
                  children: [
                    o.jsxs("label", {
                      style: { fontSize: "11.5px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: "4px" },
                      children: [
                        o.jsx("span", { children: editingItem.purchaseUnit && editingItem.purchaseUnit.includes("Trip") ? "Stock Count (Trips)" : "Stock Count (Qty)" }),
                        o.jsx("span", { style: { color: "var(--brand-400)" }, children: editingItem.purchaseUnit && editingItem.purchaseUnit.includes("Trip") ? "Trips" : editingItem.unit })
                      ]
                    }),
                    o.jsx("input", {
                      type: "number",
                      step: "any",
                      min: "0",
                      required: true,
                      value: editQty,
                      onChange: e => setEditQty(e.target.value),
                      className: "input-field mono",
                      style: { fontSize: "15px", fontWeight: 700 }
                    }),
                    editingItem.unitRatio && editingItem.unitRatio > 1 && o.jsxs("div", {
                      style: { fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" },
                      children: ["= ", ((parseFloat(editQty) || 0) * editingItem.unitRatio).toLocaleString(), " ", editingItem.unit, " for production"]
                    })
                  ]
                }),

                // Purchase Price / Cost Input
                o.jsxs("div", {
                  children: [
                    o.jsxs("label", {
                      style: { fontSize: "11.5px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: "4px" },
                      children: [
                        o.jsx("span", { children: "Current Purchase Price (Tsh)" }),
                        o.jsxs("span", { style: { color: "var(--brand-400)" }, children: ["per ", editingItem.purchaseUnit] })
                      ]
                    }),
                    o.jsx("input", {
                      type: "number",
                      step: "any",
                      min: "0",
                      required: true,
                      value: editPrice,
                      onChange: e => setEditPrice(e.target.value),
                      className: "input-field mono",
                      style: { fontSize: "15px", fontWeight: 700 }
                    })
                  ]
                }),

                // Source Input
                o.jsxs("div", {
                  children: [
                    o.jsx("label", { style: { fontSize: "11.5px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }, children: "Source / Supplier" }),
                    o.jsx("input", {
                      type: "text",
                      value: editSource,
                      onChange: e => setEditSource(e.target.value),
                      className: "input-field",
                      placeholder: "e.g. Msanga (27km)"
                    })
                  ]
                }),

                // Reorder Level Input
                o.jsxs("div", {
                  children: [
                    o.jsxs("label", {
                      style: { fontSize: "11.5px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: "4px" },
                      children: [
                        o.jsx("span", { children: "Safety Reorder Minimum" }),
                        o.jsxs("span", { style: { color: "var(--text-secondary)" }, children: [editingItem.unit] })
                      ]
                    }),
                    o.jsx("input", {
                      type: "number",
                      step: "any",
                      min: "0",
                      value: editReorder,
                      onChange: e => setEditReorder(e.target.value),
                      className: "input-field mono"
                    })
                  ]
                }),

                // Buttons
                o.jsxs("div", {
                  style: { display: "flex", gap: "8px", marginTop: "6px" },
                  children: [
                    o.jsx("button", {
                      type: "button",
                      onClick: () => setEditModalOpen(false),
                      className: "btn btn-secondary",
                      style: { flex: 1 },
                      children: "Cancel"
                    }),
                    o.jsx("button", {
                      type: "submit",
                      className: "btn btn-primary",
                      style: { flex: 1.5, fontWeight: 700 },
                      children: "Save Changes"
                    })
                  ]
                })
              ]
            })
          ]
        })
      }),

      // Daily Material Intake Modal
      intakeModalOpen && o.jsx("div", {
        className: "modal-overlay",
        onClick: () => setIntakeModalOpen(false),
        children: o.jsxs("div", {
          className: "modal-content",
          onClick: e => e.stopPropagation(),
          style: { padding: "20px", maxWidth: "460px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)" },
          children: [
            o.jsxs("div", {
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsx("h3", { style: { fontSize: "16px", fontWeight: 800, margin: 0, color: "#f8fafc" }, children: "Record Daily Material Intake" }),
                    o.jsx("p", { style: { fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }, children: "Record incoming deliveries, purchase prices, and delivery note" })
                  ]
                }),
                o.jsx("button", {
                  type: "button",
                  onClick: () => setIntakeModalOpen(false),
                  className: "btn btn-ghost btn-sm",
                  children: "✕"
                })
              ]
            }),

            o.jsxs("form", {
              onSubmit: handleSaveIntake,
              style: { display: "flex", flexDirection: "column", gap: "12px" },
              children: [
                
                // Row 1: Date & Material Selection
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "10px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11.5px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }, children: "Intake Date" }),
                        o.jsx("input", {
                          type: "date",
                          required: true,
                          value: intakeDate,
                          onChange: e => setIntakeDate(e.target.value),
                          className: "input-field mono",
                          style: { fontSize: "12.5px" }
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11.5px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }, children: "Select Material" }),
                        o.jsx("select", {
                          value: intakeKey,
                          onChange: e => handleSelectIntakeMaterial(e.target.value),
                          className: "input-field",
                          style: { fontSize: "12.5px", fontWeight: 600 },
                          children: materials.map(m => o.jsxs("option", {
                            value: m.key,
                            children: [\`#\${m.no} \${m.name} (\${m.category})\`]
                          }, m.key))
                        })
                      ]
                    })
                  ]
                }),

                // Mode toggle for materials with ratio > 1 (e.g. Trips vs ndoo, Barrels vs Liters)
                activeIntakeMat.unitRatio && activeIntakeMat.unitRatio > 1 && o.jsxs("div", {
                  style: {
                    background: "var(--bg-input)",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("span", { style: { fontSize: "11.5px", fontWeight: 700, color: "#f8fafc" }, children: "Delivery Unit" }),
                        o.jsxs("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", display: "block" }, children: ["1 ", activeIntakeMat.purchaseUnit, " = ", activeIntakeMat.unitRatio.toLocaleString(), " ", activeIntakeMat.unit] })
                      ]
                    }),
                    o.jsxs("div", {
                      style: { display: "flex", gap: "4px" },
                      children: [
                        o.jsx("button", {
                          type: "button",
                          onClick: () => setIntakeUnitMode("purchase"),
                          style: {
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 700,
                            border: "none",
                            background: intakeUnitMode === "purchase" ? "var(--brand-500)" : "transparent",
                            color: intakeUnitMode === "purchase" ? "#fff" : "var(--text-secondary)",
                            cursor: "pointer"
                          },
                          children: activeIntakeMat.purchaseUnit && activeIntakeMat.purchaseUnit.includes("Trip") ? "Trips" : activeIntakeMat.purchaseUnit
                        }),
                        o.jsx("button", {
                          type: "button",
                          onClick: () => setIntakeUnitMode("usage"),
                          style: {
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 700,
                            border: "none",
                            background: intakeUnitMode === "usage" ? "var(--brand-500)" : "transparent",
                            color: intakeUnitMode === "usage" ? "#fff" : "var(--text-secondary)",
                            cursor: "pointer"
                          },
                          children: activeIntakeMat.unit
                        })
                      ]
                    })
                  ]
                }),

                // Row 2: Quantity Delivered
                o.jsxs("div", {
                  children: [
                    o.jsxs("label", {
                      style: { fontSize: "11.5px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: "4px" },
                      children: [
                        o.jsx("span", { children: "Quantity Delivered" }),
                        o.jsxs("span", { style: { color: "var(--brand-400)", fontWeight: 700 }, children: [intakeUnitMode === "purchase" ? (activeIntakeMat.purchaseUnit.includes("Trip") ? "Trips" : activeIntakeMat.purchaseUnit) : activeIntakeMat.unit] })
                      ]
                    }),
                    o.jsx("input", {
                      type: "number",
                      min: "0.01",
                      step: "any",
                      required: true,
                      value: intakeQty,
                      onChange: e => {
                        const val = e.target.value;
                        setIntakeQty(val);
                        const q = parseFloat(val) || 0;
                        const p = parseFloat(intakeUnitPrice) || 0;
                        if (q > 0 && p > 0) {
                          setIntakeTotalCost((q * p).toFixed(0));
                        }
                      },
                      className: "input-field mono",
                      style: { fontSize: "16px", fontWeight: 800 },
                      placeholder: intakeUnitMode === "purchase" ? "e.g. 1" : "e.g. 2500"
                    }),
                    intakeUnitMode === "purchase" && activeIntakeMat.unitRatio && activeIntakeMat.unitRatio > 1 && intakeQty ? o.jsxs("div", {
                      style: { fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" },
                      children: ["= ", (parseFloat(intakeQty) * activeIntakeMat.unitRatio).toLocaleString(), " ", activeIntakeMat.unit, " for factory production"]
                    }) : null
                  ]
                }),

                // Row 3: Unit Price & Total Cost (Fill in prices)
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsxs("label", {
                          style: { fontSize: "11.5px", color: "var(--text-muted)", display: "block", marginBottom: "4px" },
                          children: ["Purchase Price / Cost", o.jsx("span", { style: { fontSize: "10px", display: "block", color: "var(--brand-400)" }, children: \`per \${intakeUnitMode === "purchase" ? activeIntakeMat.purchaseUnit : activeIntakeMat.unit}\` })]
                        }),
                        o.jsx("input", {
                          type: "number",
                          min: "0",
                          step: "any",
                          required: true,
                          value: intakeUnitPrice,
                          onChange: e => {
                            const val = e.target.value;
                            setIntakeUnitPrice(val);
                            const p = parseFloat(val) || 0;
                            const q = parseFloat(intakeQty) || 0;
                            if (q > 0 && p > 0) {
                              setIntakeTotalCost((q * p).toFixed(0));
                            }
                          },
                          className: "input-field mono",
                          style: { fontSize: "14px", fontWeight: 700 },
                          placeholder: "Tsh unit price"
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsxs("label", {
                          style: { fontSize: "11.5px", color: "var(--text-muted)", display: "block", marginBottom: "4px" },
                          children: ["Total Delivery Cost", o.jsx("span", { style: { fontSize: "10px", display: "block", color: "#f8fafc" }, children: "Tsh (auto-calculated)" })]
                        }),
                        o.jsx("input", {
                          type: "number",
                          min: "0",
                          step: "any",
                          value: intakeTotalCost,
                          onChange: e => {
                            const val = e.target.value;
                            setIntakeTotalCost(val);
                            const tot = parseFloat(val) || 0;
                            const q = parseFloat(intakeQty) || 0;
                            if (q > 0 && tot > 0) {
                              setIntakeUnitPrice((tot / q).toFixed(0));
                            }
                          },
                          className: "input-field mono",
                          style: { fontSize: "14px", fontWeight: 700 },
                          placeholder: "Tsh total"
                        })
                      ]
                    })
                  ]
                }),

                // Row 4: Source & Delivery / Invoice Note
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11.5px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }, children: "Supplier / Source" }),
                        o.jsx("input", {
                          type: "text",
                          value: intakeSource,
                          onChange: e => setIntakeSource(e.target.value),
                          className: "input-field",
                          placeholder: "e.g. Msanga (27km)"
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11.5px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }, children: "Truck / Waybill / Ref" }),
                        o.jsx("input", {
                          type: "text",
                          value: intakeDeliveryRef,
                          onChange: e => setIntakeDeliveryRef(e.target.value),
                          className: "input-field",
                          placeholder: "e.g. Truck T 823 DFP"
                        })
                      ]
                    })
                  ]
                }),

                // Row 5: Notes
                o.jsxs("div", {
                  children: [
                    o.jsx("label", { style: { fontSize: "11.5px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }, children: "Additional Notes / Comments" }),
                    o.jsx("input", {
                      type: "text",
                      value: intakeNote,
                      onChange: e => setIntakeNote(e.target.value),
                      className: "input-field",
                      placeholder: "Optional notes..."
                    })
                  ]
                }),

                // Submit Button
                o.jsxs("button", {
                  type: "submit",
                  className: "btn btn-primary btn-lg",
                  style: { marginTop: "4px", fontWeight: 800 },
                  children: [
                    o.jsx(pn, { size: 16 }),
                    o.jsx("span", { children: "Save Intake & Update Price" })
                  ]
                })
              ]
            })
          ]
        })
      })
    ]
  });
},
`;

bundle = bundle.substring(0, startIdx) + updatedRawMaterialMasterCode + bundle.substring(endIdx);

fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log('Saved bundle. Checking syntax...');
execSync('node --check ' + bundlePath);
console.log('✓ assets/index-hgjhj-0G.js syntax is 100% VALID!');

// Bump service worker cache version
const swPath = 'service-worker.js';
const nowTimestamp = Date.now();
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = ['"]stumarcot-pwa-v[^'"]+['"]/, () => {
    return "const CACHE_NAME = 'stumarcot-pwa-v1.9.0-" + nowTimestamp + "'";
  });
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('✓ Bumped service worker cache version to stumarcot-pwa-v1.9.0-' + nowTimestamp);
}

// Update index.html script tag cache buster
const htmlPath = 'index.html';
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/src="\.\/assets\/index-hgjhj-0G\.js[^"]*"/, 'src="./assets/index-hgjhj-0G.js?v=' + nowTimestamp + '"');
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('✓ Updated index.html with new cache buster timestamp');
}
