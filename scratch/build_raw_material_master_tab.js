const fs = require('fs');
const { execSync } = require('child_process');

console.log('Building Material Master Tab...');

const bundlePath = 'assets/index-hgjhj-0G.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');

// Component code for RawMaterialMasterView (declared without const so it fits the var/comma chain)
const rawMaterialMasterComponentCode = `RawMaterialMasterView = ({ rawMaterials: materials, addRawMaterialStock, updateRawMaterialMaster, onNavigate, staffName }) => {
  const [searchTerm, setSearchTerm] = B.useState("");
  const [selectedCategory, setSelectedCategory] = B.useState("All");
  
  // Daily Intake Modal State
  const [intakeModalOpen, setIntakeModalOpen] = B.useState(false);
  const [intakeKey, setIntakeKey] = B.useState("cement");
  const [intakeDate, setIntakeDate] = B.useState(() => new Date().toISOString().split("T")[0]);
  const [intakeUnitMode, setIntakeUnitMode] = B.useState("purchase"); // "purchase" or "usage"
  const [intakeQty, setIntakeQty] = B.useState("");
  const [intakeUnitPrice, setIntakeUnitPrice] = B.useState("");
  const [intakeTotalCost, setIntakeTotalCost] = B.useState("");
  const [intakeSource, setIntakeSource] = B.useState("");
  const [intakeDeliveryRef, setIntakeDeliveryRef] = B.useState("");
  const [intakeNote, setIntakeNote] = B.useState("");

  // Direct Edit Price & Qty Modal State
  const [editModalOpen, setEditModalOpen] = B.useState(false);
  const [editingItem, setEditingItem] = B.useState(null);
  const [editQty, setEditQty] = B.useState("");
  const [editPrice, setEditPrice] = B.useState("");
  const [editSource, setEditSource] = B.useState("");
  const [editReorder, setEditReorder] = B.useState("");

  // Toast feedback
  const [toast, setToast] = B.useState(null);
  B.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
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

  // When active intake material changes, prefill price and source
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

  // Open intake modal pre-selected
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

  // Open direct edit modal
  const openEditFor = (item) => {
    setEditingItem(item);
    setEditQty(item.currentBalance !== undefined ? item.currentBalance.toString() : "0");
    setEditPrice(item.purchasePrice !== undefined ? item.purchasePrice.toString() : "0");
    setEditSource(item.source || "");
    setEditReorder(item.reorderLevel !== undefined ? item.reorderLevel.toString() : "0");
    setEditModalOpen(true);
  };

  // Save Direct Edit (Prices & Qty)
  const handleSaveDirectEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    const newQty = parseFloat(editQty);
    const newPrice = parseFloat(editPrice);
    const newReorder = parseFloat(editReorder);
    
    if (isNaN(newQty) || newQty < 0) {
      alert("Please enter a valid stock quantity");
      return;
    }
    if (isNaN(newPrice) || newPrice < 0) {
      alert("Please enter a valid purchase price/cost");
      return;
    }

    if (updateRawMaterialMaster) {
      updateRawMaterialMaster(editingItem.key, {
        currentBalance: newQty,
        purchasePrice: newPrice,
        source: editSource.trim(),
        reorderLevel: isNaN(newReorder) ? editingItem.reorderLevel : newReorder
      });
    }

    setToast({
      type: "success",
      title: "Material Master Updated",
      message: \`\${editingItem.name}: Qty set to \${newQty.toLocaleString()} \${editingItem.unit}, Price set to \${newPrice.toLocaleString()} Tsh\`
    });
    setEditModalOpen(false);
  };

  // Save Daily Intake
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

    const fullNote = [
      intakeDeliveryRef ? \`Ref: \${intakeDeliveryRef}\` : "",
      intakeNote ? intakeNote : "",
      ratio > 1 ? \`(\${rawQty} \${activeIntakeMat.purchaseUnit} = \${finalInventoryQty.toLocaleString()} \${activeIntakeMat.unit})\` : ""
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
      type: "success",
      title: "Material Intake Recorded",
      message: \`Added +\${finalInventoryQty.toLocaleString()} \${activeIntakeMat.unit} \${activeIntakeMat.name} (Tsh \${totalCostNum.toLocaleString()})\`
    });

    setIntakeModalOpen(false);
    setIntakeQty("");
    setIntakeTotalCost("");
    setIntakeDeliveryRef("");
    setIntakeNote("");
  };

  return o.jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: "14px" },
    children: [
      
      // Toast notification
      toast && o.jsxs("div", {
        style: {
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          background: "#065f46",
          color: "#ecfdf5",
          padding: "12px 18px",
          borderRadius: "10px",
          border: "1px solid #10b981",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          maxWidth: "92vw"
        },
        children: [
          o.jsx(pn, { size: 18, color: "#34d399" }),
          o.jsxs("div", {
            children: [
              o.jsx("strong", { style: { display: "block", fontSize: "13px" }, children: toast.title }),
              o.jsx("span", { style: { fontSize: "11.5px", opacity: 0.9 }, children: toast.message })
            ]
          })
        ]
      }),

      // Top Header & Action Row
      o.jsxs("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" },
        children: [
          o.jsxs("div", {
            children: [
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", gap: "8px" },
                children: [
                  o.jsx("h2", { style: { fontSize: "18px", fontWeight: 800, color: "#f8fafc", margin: 0 }, children: "Material Master & Live Inventory" }),
                  o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "11px", fontWeight: 700 }, children: "13 Materials" })
                ]
              }),
              o.jsx("p", { style: { fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }, children: "Dodoma site precast factory raw materials master catalog, live stock counts & current purchase prices" })
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
                style: { padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, boxShadow: "0 4px 14px rgba(249, 115, 22, 0.4)" },
                children: [
                  o.jsx(t1, { size: 15 }),
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

      // Top KPI Cards
      o.jsxs("div", {
        style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px" },
        children: [
          // Total Valuation Card
          o.jsxs("div", {
            className: "card",
            style: { padding: "12px 14px", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), var(--bg-surface))", border: "1px solid rgba(16, 185, 129, 0.3)" },
            children: [
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" },
                children: [
                  o.jsx("span", { style: { fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }, children: "Stock Valuation" }),
                  o.jsx(Xp, { size: 15, color: "#34d399" })
                ]
              }),
              o.jsxs("div", {
                style: { fontSize: "18px", fontWeight: 800, color: "#34d399", fontFamily: "var(--font-mono)" },
                children: ["Tsh ", Math.round(totalValuation).toLocaleString()]
              }),
              o.jsx("div", { style: { fontSize: "10.5px", color: "var(--text-muted)", marginTop: "2px" }, children: "Current stock asset worth" })
            ]
          }),

          // Catalog Coverage Card
          o.jsxs("div", {
            className: "card",
            style: { padding: "12px 14px" },
            children: [
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" },
                children: [
                  o.jsx("span", { style: { fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }, children: "Master Items" }),
                  o.jsx($a, { size: 15, color: "var(--brand-400)" })
                ]
              }),
              o.jsxs("div", {
                style: { fontSize: "18px", fontWeight: 800, color: "#f8fafc" },
                children: ["13 ", o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: "materials" })]
              }),
              o.jsx("div", { style: { fontSize: "10.5px", color: "var(--text-muted)", marginTop: "2px" }, children: "Across 9 factory categories" })
            ]
          }),

          // Stock Alerts Card
          o.jsxs("div", {
            className: "card",
            style: { padding: "12px 14px", borderColor: lowStockItems.length > 0 ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.3)" },
            children: [
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" },
                children: [
                  o.jsx("span", { style: { fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }, children: "Safety Reorder" }),
                  o.jsx(Cc, { size: 15, color: lowStockItems.length > 0 ? "#ef4444" : "#34d399" })
                ]
              }),
              o.jsxs("div", {
                style: { fontSize: "18px", fontWeight: 800, color: lowStockItems.length > 0 ? "#f87171" : "#34d399" },
                children: [lowStockItems.length, " ", o.jsx("span", { style: { fontSize: "11px" }, children: lowStockItems.length === 1 ? "alert" : "alerts" })]
              }),
              o.jsx("div", { style: { fontSize: "10.5px", color: "var(--text-muted)", marginTop: "2px" }, children: lowStockItems.length > 0 ? "Below safety minimum" : "All inventories safe" })
            ]
          })
        ]
      }),

      // Search & Category Filters
      o.jsxs("div", {
        style: { display: "flex", flexDirection: "column", gap: "8px" },
        children: [
          // Search input
          o.jsxs("div", {
            className: "search-box",
            style: { display: "flex", alignItems: "center", background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "0 10px" },
            children: [
              o.jsx(ii, { size: 14, color: "var(--text-muted)" }),
              o.jsx("input", {
                type: "text",
                value: searchTerm,
                onChange: e => setSearchTerm(e.target.value),
                placeholder: "Search by material name, category or source (e.g. Msanga, Saruji, Rangi)...",
                className: "search-input",
                style: { border: "none", background: "transparent", padding: "10px 8px", fontSize: "13px", color: "#f8fafc", width: "100%", outline: "none" }
              }),
              searchTerm && o.jsx("button", {
                type: "button",
                onClick: () => setSearchTerm(""),
                style: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "14px" },
                children: "✕"
              })
            ]
          }),

          // Category filter pills
          o.jsx("div", {
            style: { display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" },
            children: categories.map(cat => {
              const count = cat === "All" ? materials.length : materials.filter(m => m.category === cat).length;
              const isActive = selectedCategory === cat;
              return o.jsxs("button", {
                type: "button",
                onClick: () => setSelectedCategory(cat),
                style: {
                  padding: "4px 10px",
                  borderRadius: "20px",
                  border: isActive ? "1px solid var(--brand-500)" : "1px solid var(--border-subtle)",
                  background: isActive ? "rgba(249, 115, 22, 0.2)" : "var(--bg-surface)",
                  color: isActive ? "#fff" : "var(--text-secondary)",
                  fontSize: "11.5px",
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

      // Materials Grid / Table List
      o.jsx("div", {
        style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" },
        children: filteredMaterials.map(m => {
          const isLow = (m.currentBalance || 0) <= (m.reorderLevel || 0);
          const ratio = m.unitRatio || 1;
          const effPrice = (m.purchasePrice || 0) / ratio;
          const itemValuation = Math.round((m.currentBalance || 0) * effPrice);

          return o.jsxs("div", {
            className: "card-elevated",
            style: {
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "10px",
              borderColor: isLow ? "rgba(245, 158, 11, 0.4)" : "var(--border-subtle)",
              background: isLow 
                ? "linear-gradient(180deg, rgba(245, 158, 11, 0.08), var(--bg-surface-elevated))" 
                : "var(--bg-surface-elevated)",
              position: "relative"
            },
            children: [
              
              // Card Top: Number, Category, Name & Source
              o.jsxs("div", {
                children: [
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" },
                    children: [
                      o.jsxs("div", {
                        style: { display: "flex", alignItems: "center", gap: "6px" },
                        children: [
                          o.jsxs("span", {
                            style: {
                              fontSize: "10px",
                              fontWeight: 800,
                              background: "rgba(255, 255, 255, 0.08)",
                              color: "var(--text-secondary)",
                              padding: "2px 6px",
                              borderRadius: "4px"
                            },
                            children: ["#", m.no || "-"]
                          }),
                          o.jsx("span", {
                            className: "badge badge-neutral",
                            style: { fontSize: "10px", padding: "1px 6px" },
                            children: m.category
                          })
                        ]
                      }),
                      isLow ? o.jsx("span", {
                        className: "badge badge-warning",
                        style: { fontSize: "10px", padding: "2px 6px", fontWeight: 700 },
                        children: "LOW STOCK"
                      }) : o.jsx("span", {
                        className: "badge badge-success",
                        style: { fontSize: "10px", padding: "2px 6px" },
                        children: "HEALTHY"
                      })
                    ]
                  }),

                  // Name & Swahili Name
                  o.jsx("h3", {
                    style: { fontSize: "15px", fontWeight: 800, color: "#f8fafc", margin: "0 0 2px 0" },
                    children: m.name
                  }),

                  // Source Tag
                  m.source && o.jsxs("div", {
                    style: { fontSize: "11px", color: "var(--brand-400)", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "8px" },
                    children: [
                      o.jsx("span", { children: "📍" }),
                      o.jsxs("span", { children: ["Source: ", o.jsx("strong", { children: m.source })] })
                    ]
                  })
                ]
              }),

              // Card Middle: Stock Count & Current Purchase Price Display
              o.jsxs("div", {
                style: {
                  background: "var(--bg-surface)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: "10px",
                  border: "1px solid var(--border-subtle)"
                },
                children: [
                  
                  // Left: Live Stock Count
                  o.jsxs("div", {
                    children: [
                      o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "Current Stock Count" }),
                      o.jsxs("div", {
                        style: { display: "flex", alignItems: "baseline", gap: "4px" },
                        children: [
                          o.jsx("span", {
                            style: { fontSize: "19px", fontWeight: 800, color: isLow ? "#fbbf24" : "#34d399", fontFamily: "var(--font-mono)" },
                            children: (m.currentBalance || 0).toLocaleString()
                          }),
                          o.jsx("span", { style: { fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }, children: m.unit })
                        ]
                      }),
                      // Conversion subtext if unitRatio > 1
                      ratio > 1 && o.jsxs("div", {
                        style: { fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" },
                        children: ["≈ ", ((m.currentBalance || 0) / ratio).toFixed(2), " ", m.purchaseUnit]
                      })
                    ]
                  }),

                  // Right: Current Purchase Price / Cost
                  o.jsxs("div", {
                    style: { borderLeft: "1px solid var(--border-subtle)", paddingLeft: "10px" },
                    children: [
                      o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "Current Purchase Price" }),
                      o.jsxs("div", {
                        style: { fontSize: "14px", fontWeight: 800, color: "#f8fafc", fontFamily: "var(--font-mono)" },
                        children: ["Tsh ", (m.purchasePrice || 0).toLocaleString()]
                      }),
                      o.jsxs("div", {
                        style: { fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" },
                        children: ["per ", m.purchaseUnit]
                      })
                    ]
                  })
                ]
              }),

              // Card Bottom Details & Quick Actions
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" },
                children: [
                  // Valuation & threshold
                  o.jsxs("div", {
                    children: [
                      o.jsxs("div", {
                        style: { fontSize: "11px", color: "var(--text-muted)" },
                        children: ["Valuation: ", o.jsxs("strong", { style: { color: "#34d399" }, children: ["Tsh ", itemValuation.toLocaleString()] })]
                      }),
                      o.jsxs("div", {
                        style: { fontSize: "10px", color: "var(--text-muted)" },
                        children: ["Min threshold: ", m.reorderLevel || 0, " ", m.unit]
                      })
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
                        style: { padding: "5px 9px", fontSize: "11.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" },
                        title: "Edit Price, Qty and Source for " + m.name,
                        children: [
                          o.jsx("span", { children: "✏️" }),
                          o.jsx("span", { children: "Edit" })
                        ]
                      }),
                      o.jsxs("button", {
                        type: "button",
                        onClick: () => openIntakeFor(m),
                        className: "btn btn-primary btn-sm",
                        style: { padding: "5px 9px", fontSize: "11.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" },
                        title: "Record Intake for " + m.name,
                        children: [
                          o.jsx(t1, { size: 12 }),
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

      // Direct Edit Modal (Price & Qty)
      editModalOpen && editingItem && o.jsx("div", {
        className: "modal-overlay",
        onClick: () => setEditModalOpen(false),
        children: o.jsxs("div", {
          className: "modal-content",
          onClick: e => e.stopPropagation(),
          style: { padding: "20px", maxWidth: "460px" },
          children: [
            o.jsxs("div", {
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsxs("h3", { style: { fontSize: "17px", fontWeight: 800, margin: 0 }, children: ["Edit Material: ", editingItem.name] }),
                    o.jsx("p", { style: { fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }, children: "Update stock count (Qty), purchase cost and supplier info" })
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
                
                // Qty Input
                o.jsxs("div", {
                  children: [
                    o.jsxs("label", {
                      style: { fontSize: "11.5px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: "4px" },
                      children: [
                        o.jsx("span", { children: "Current Stock Count (Qty)" }),
                        o.jsxs("span", { style: { color: "var(--brand-400)" }, children: ["Unit: ", editingItem.unit] })
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
                      children: ["≈ ", (parseFloat(editQty || 0) / editingItem.unitRatio).toFixed(2), " ", editingItem.purchaseUnit]
                    })
                  ]
                }),

                // Purchase Price / Cost Input
                o.jsxs("div", {
                  children: [
                    o.jsxs("label", {
                      style: { fontSize: "11.5px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: "4px" },
                      children: [
                        o.jsx("span", { children: "Current Purchase Price / Cost (Tsh)" }),
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
                      placeholder: "e.g. Msanga (27km), Dar, Whole sallers..."
                    })
                  ]
                }),

                // Reorder Level Input
                o.jsxs("div", {
                  children: [
                    o.jsxs("label", {
                      style: { fontSize: "11.5px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: "4px" },
                      children: [
                        o.jsx("span", { children: "Safety Reorder Threshold" }),
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
                  style: { display: "flex", gap: "8px", marginTop: "8px" },
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
          style: { padding: "22px", maxWidth: "480px" },
          children: [
            o.jsxs("div", {
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsx("h3", { style: { fontSize: "17px", fontWeight: 800, margin: 0 }, children: "Record Daily Material Intake" }),
                    o.jsx("p", { style: { fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }, children: "Insert daily deliveries, incoming prices, quantities and delivery references" })
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
                          style: { fontSize: "13px" }
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
                          style: { fontSize: "13px", fontWeight: 600 },
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
                        o.jsx("span", { style: { fontSize: "11.5px", fontWeight: 700, color: "#f8fafc" }, children: "Unit of Delivery" }),
                        o.jsxs("span", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block" }, children: ["1 ", activeIntakeMat.purchaseUnit, " = ", activeIntakeMat.unitRatio.toLocaleString(), " ", activeIntakeMat.unit] })
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
                          children: activeIntakeMat.purchaseUnit
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
                        o.jsxs("span", { style: { color: "var(--brand-400)", fontWeight: 700 }, children: [intakeUnitMode === "purchase" ? activeIntakeMat.purchaseUnit : activeIntakeMat.unit] })
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
                    // Preview conversion
                    intakeUnitMode === "purchase" && activeIntakeMat.unitRatio && activeIntakeMat.unitRatio > 1 && intakeQty ? o.jsxs("div", {
                      style: { fontSize: "11px", color: "#34d399", marginTop: "3px", fontWeight: 600 },
                      children: ["⚡ Adds ", (parseFloat(intakeQty) * activeIntakeMat.unitRatio).toLocaleString(), " ", activeIntakeMat.unit, " to factory stock"]
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
                          children: ["Total Delivery Cost", o.jsx("span", { style: { fontSize: "10px", display: "block", color: "#34d399" }, children: "Tsh (auto-calculated)" })]
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
                  style: { marginTop: "6px", fontWeight: 800 },
                  children: [
                    o.jsx(pn, { size: 18 }),
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

// Insert RawMaterialMasterView right before x1
const x1Marker = 'x1=({onNavigate:s})=>';
const x1Idx = bundle.indexOf(x1Marker);

if (x1Idx === -1) {
  throw new Error('Could not find x1 component');
}

console.log('x1 found at', x1Idx);

bundle = bundle.substring(0, x1Idx) + rawMaterialMasterComponentCode + bundle.substring(x1Idx);
console.log('✓ Injected RawMaterialMasterView before x1.');

// Now replace L==="raw_materials" inside x1 with our new component
const oldRawTabStart = bundle.indexOf('L==="raw_materials"&&o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"14px"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[o.jsxs("div",{children:[o.jsx("h2"');
const oldRawTabEnd = bundle.indexOf('L==="inventory"&&o.jsxs(o.Fragment', oldRawTabStart);

if (oldRawTabStart === -1 || oldRawTabEnd === -1) {
  throw new Error('Could not find oldRawTab boundaries in x1');
}

console.log('Replacing oldRawTab from', oldRawTabStart, 'to', oldRawTabEnd);

const newRawTab = `L==="raw_materials"&&o.jsx(RawMaterialMasterView,{rawMaterials:f,addRawMaterialStock:m,updateRawMaterialMaster:Vt().updateRawMaterialMaster,onNavigate:s,staffName:Vt().staffName}),`;

bundle = bundle.substring(0, oldRawTabStart) + newRawTab + bundle.substring(oldRawTabEnd);
console.log('✓ Replaced L===raw_materials with RawMaterialMasterView in x1.');

// Next: Enhance Raw Material Ledger display in k1
const k1RawMarker = 'o.jsxs("span", { style: { fontSize: "12.5px", fontWeight: 600, color: "var(--text-secondary)" }, children: ["Raw Material Ledger Logs (", P.length, ")"] })';
const k1RawIdx = bundle.indexOf(k1RawMarker);

if (k1RawIdx !== -1) {
  console.log('Found k1 raw materials marker at', k1RawIdx);
  const oldSDetails = 'o.jsxs("div", {\n                      style: { fontSize: "11.5px", color: "var(--text-muted)", display: "flex", gap: "8px" },\n                      children: [\n                        o.jsxs("span", { children: [o.jsx(ni, { size: 11, style: { verticalAlign: "middle" } }), " ", S.date] }),\n                        o.jsxs("span", { children: ["By: ", S.enteredBy] }),\n                        S.note && o.jsxs("span", { style: { color: "var(--text-secondary)" }, children: [\'"\', S.note, \'"\'] })\n                      ]\n                    })';
  
  const targetIdx = bundle.indexOf(oldSDetails, k1RawIdx);
  if (targetIdx !== -1) {
    const newSDetails = `o.jsxs("div", {
                      style: { fontSize: "11.5px", color: "var(--text-muted)", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" },
                      children: [
                        o.jsxs("span", { children: [o.jsx(ni, { size: 11, style: { verticalAlign: "middle" } }), " ", S.date] }),
                        o.jsxs("span", { children: ["By: ", S.enteredBy] }),
                        S.source && o.jsxs("span", { style: { color: "var(--brand-400)", fontWeight: 600 }, children: ["📍 ", S.source] }),
                        S.totalCost && S.totalCost > 0 ? o.jsxs("span", { style: { color: "#34d399", fontWeight: 700 }, children: ["Tsh ", Number(S.totalCost).toLocaleString(), S.unitPrice ? " (" + Number(S.unitPrice).toLocaleString() + " / unit)" : ""] }) : null,
                        S.note && o.jsxs("span", { style: { color: "var(--text-secondary)" }, children: ['"', S.note, '"'] })
                      ]
                    })`;
    bundle = bundle.substring(0, targetIdx) + newSDetails + bundle.substring(targetIdx + oldSDetails.length);
    console.log('✓ Enhanced Raw Material Ledger movement details in k1.');
  }
}

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
    return `const CACHE_NAME = 'stumarcot-pwa-v1.8.0-${nowTimestamp}'`;
  });
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('✓ Bumped service worker cache version to stumarcot-pwa-v1.8.0-' + nowTimestamp);
}

// Update index.html script tag cache buster
const htmlPath = 'index.html';
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/src="\.\/assets\/index-hgjhj-0G\.js[^"]*"/, `src="./assets/index-hgjhj-0G.js?v=${nowTimestamp}"`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('✓ Updated index.html with new cache buster timestamp');
}
