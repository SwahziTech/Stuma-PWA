const fs = require('fs');
const { execSync } = require('child_process');

console.log('Applying reduced length material cards with top-right intake trip button...');

const bundlePath = 'assets/index-hgjhj-0G.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');

const startMarker = 'RawMaterialMasterView = ({ rawMaterials: materials';
const startIdx = bundle.indexOf(startMarker);
const endMarker = 'x1=({onNavigate:s})=>';
const endIdx = bundle.indexOf(endMarker, startIdx);

if (startIdx === -1 || endIdx === -1) {
  throw new Error('Could not find RawMaterialMasterView markers in bundle');
}

console.log('Found RawMaterialMasterView from', startIdx, 'to', endIdx);

const newComponent = `RawMaterialMasterView = ({ rawMaterials: materials, addRawMaterialStock, updateRawMaterialMaster, addRawMaterial, removeRawMaterial, resetAllRawMaterialsToZero, onNavigate, staffName }) => {
  const [searchTerm, setSearchTerm] = B.useState("");
  const [selectedCategory, setSelectedCategory] = B.useState("All");
  
  // Full Baseline Modal State (Batch opening stock setup - top button)
  const [baselineModalOpen, setBaselineModalOpen] = B.useState(false);
  const [baselineData, setBaselineData] = B.useState({});
  const [baselineDate, setBaselineDate] = B.useState(() => new Date().toISOString().split("T")[0]);

  // Daily Intake Modal State
  const [intakeModalOpen, setIntakeModalOpen] = B.useState(false);
  const [intakeKey, setIntakeKey] = B.useState("cement");
  const [intakeDate, setIntakeDate] = B.useState(() => new Date().toISOString().split("T")[0]);
  const [intakeUnitMode, setIntakeUnitMode] = B.useState("purchase");
  const [intakeQty, setIntakeQty] = B.useState("");
  const [intakeUnitPrice, setIntakeUnitPrice] = B.useState("");
  const [intakeTotalCost, setIntakeTotalCost] = B.useState("");
  const [intakeSource, setIntakeSource] = B.useState("");
  const [intakeDeliveryRef, setIntakeDeliveryRef] = B.useState("");
  const [intakeNote, setIntakeNote] = B.useState("");

  // Add New Material Modal State
  const [addModalOpen, setAddModalOpen] = B.useState(false);
  const [newMatName, setNewMatName] = B.useState("");
  const [newMatCategory, setNewMatCategory] = B.useState("Cement");
  const [newMatCustomCategory, setNewMatCustomCategory] = B.useState("");
  const [newMatSource, setNewMatSource] = B.useState("");
  const [newMatPurchaseUnit, setNewMatPurchaseUnit] = B.useState("50 kg bags");
  const [newMatUnit, setNewMatUnit] = B.useState("bags");
  const [newMatUnitRatio, setNewMatUnitRatio] = B.useState("1");
  const [newMatInitialQty, setNewMatInitialQty] = B.useState("0");
  const [newMatInitialPrice, setNewMatInitialPrice] = B.useState("0");
  const [newMatReorder, setNewMatReorder] = B.useState("50");

  // Toast feedback
  const [toast, setToast] = B.useState(null);
  B.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Categories
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
        (m.source && m.source.toLowerCase().includes(s));
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

  const zeroBaselineItems = B.useMemo(() => {
    return materials.filter(m => (m.currentBalance || 0) === 0);
  }, [materials]);

  const lowStockItems = B.useMemo(() => {
    return materials.filter(m => (m.currentBalance || 0) <= (m.reorderLevel || 0) && (m.currentBalance || 0) > 0);
  }, [materials]);

  const activeIntakeMat = B.useMemo(() => {
    return materials.find(m => m.key === intakeKey) || materials[0];
  }, [materials, intakeKey]);

  // Stock format helper (Trips as main, ndoo as small subtext)
  const formatStock = B.useCallback((m) => {
    const ratio = m.unitRatio || 1;
    const isTrip = m.purchaseUnit && m.purchaseUnit.includes("Trip");

    if (isTrip) {
      const tripsVal = (m.currentBalance || 0) / ratio;
      const tripsStr = tripsVal % 1 === 0 ? tripsVal.toString() : tripsVal.toFixed(2);
      return {
        mainDisplay: \`\${tripsStr} Trips\`,
        subDetail: \`(\${(m.currentBalance || 0).toLocaleString()} ndoo for prod)\`
      };
    } else if (ratio > 1) {
      const pkgVal = (m.currentBalance || 0) / ratio;
      const pkgStr = pkgVal % 1 === 0 ? pkgVal.toString() : pkgVal.toFixed(2);
      return {
        mainDisplay: \`\${pkgStr} \${m.displayUnit || m.purchaseUnit}\`,
        subDetail: \`(\${(m.currentBalance || 0).toLocaleString()} \${m.unit} for prod)\`
      };
    } else {
      return {
        mainDisplay: \`\${(m.currentBalance || 0).toLocaleString()} \${m.unit}\`,
        subDetail: ""
      };
    }
  }, []);

  // Open Full Baseline Modal (Top button)
  const openFullBaselineModal = () => {
    const initial = {};
    materials.forEach(m => {
      const ratio = m.unitRatio || 1;
      const isTrip = m.purchaseUnit && m.purchaseUnit.includes("Trip");
      const userQty = isTrip ? ((m.currentBalance || 0) / ratio) : (m.currentBalance || 0);
      initial[m.key] = {
        qty: userQty > 0 ? (userQty % 1 === 0 ? userQty.toString() : userQty.toFixed(2)) : "",
        price: m.purchasePrice ? m.purchasePrice.toString() : "",
        source: m.source || ""
      };
    });
    setBaselineData(initial);
    setBaselineModalOpen(true);
  };

  // Save Full Baseline
  const handleSaveFullBaseline = async (e) => {
    e.preventDefault();
    const Ce = new Date().toISOString();
    
    for (const m of materials) {
      const entry = baselineData[m.key] || {};
      const qtyNum = parseFloat(entry.qty) || 0;
      const priceNum = parseFloat(entry.price) || 0;
      const sourceStr = entry.source !== undefined && entry.source !== "" ? entry.source : (m.source || "Initial Baseline");
      
      const ratio = m.unitRatio || 1;
      const isTrip = m.purchaseUnit && m.purchaseUnit.includes("Trip");
      const inventoryQty = isTrip ? (qtyNum * ratio) : qtyNum;

      if (updateRawMaterialMaster) {
        await updateRawMaterialMaster(m.key, {
          currentBalance: inventoryQty,
          purchasePrice: priceNum,
          source: sourceStr,
          lastUpdated: Ce
        });
      }
    }
    
    setBaselineModalOpen(false);
    setToast({ message: "✓ Opening baseline for raw materials saved successfully!", type: "success" });
  };

  // Daily intake modal handlers
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
    handleSelectIntakeMaterial(item.key);
    setIntakeQty("");
    setIntakeTotalCost("");
    setIntakeDeliveryRef("");
    setIntakeNote("");
    setIntakeModalOpen(true);
  };

  const handleIntakeQtyChange = (val) => {
    setIntakeQty(val);
    const q = parseFloat(val) || 0;
    const p = parseFloat(intakeUnitPrice) || 0;
    if (q > 0 && p > 0) {
      setIntakeTotalCost((q * p).toFixed(0));
    }
  };

  const handleIntakeUnitPriceChange = (val) => {
    setIntakeUnitPrice(val);
    const p = parseFloat(val) || 0;
    const q = parseFloat(intakeQty) || 0;
    if (q > 0 && p > 0) {
      setIntakeTotalCost((q * p).toFixed(0));
    }
  };

  const handleIntakeTotalCostChange = (val) => {
    setIntakeTotalCost(val);
    const t = parseFloat(val) || 0;
    const q = parseFloat(intakeQty) || 0;
    if (t > 0 && q > 0) {
      setIntakeUnitPrice((t / q).toFixed(0));
    }
  };

  const handleSaveIntake = async (e) => {
    e.preventDefault();
    if (!activeIntakeMat) return;

    const qtyNum = parseFloat(intakeQty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      alert("Please enter a valid intake quantity greater than 0");
      return;
    }

    const priceNum = parseFloat(intakeUnitPrice) || 0;
    const totalCostNum = parseFloat(intakeTotalCost) || (qtyNum * priceNum);
    const ratio = activeIntakeMat.unitRatio || 1;
    const finalInventoryQty = intakeUnitMode === "purchase" ? (qtyNum * ratio) : qtyNum;

    const fullNote = [
      intakeNote,
      intakeDeliveryRef ? \`Delivery Ref: \${intakeDeliveryRef}\` : null,
      intakeUnitMode === "purchase" ? \`Entered as \${qtyNum} \${activeIntakeMat.purchaseUnit}\` : \`Entered as \${qtyNum} \${activeIntakeMat.unit}\`
    ].filter(Boolean).join(" · ");

    if (addRawMaterialStock) {
      await addRawMaterialStock(
        activeIntakeMat.key,
        finalInventoryQty,
        fullNote || \`Intake of \${activeIntakeMat.name}\`,
        priceNum,
        totalCostNum,
        intakeSource || activeIntakeMat.source,
        intakeDate
      );
    }

    setIntakeModalOpen(false);
    setToast({ message: \`✓ Restock intake recorded for \${activeIntakeMat.name}\`, type: "success" });
  };

  // Add new material
  const handleAddNewMaterial = (e) => {
    e.preventDefault();
    if (!newMatName.trim()) {
      alert("Please enter a material name");
      return;
    }

    const finalCategory = newMatCategory === "Custom" ? (newMatCustomCategory.trim() || "General") : newMatCategory;
    const ratio = parseFloat(newMatUnitRatio) || 1;
    const initQty = parseFloat(newMatInitialQty) || 0;
    const initPrice = parseFloat(newMatInitialPrice) || 0;
    const finalInitInventory = initQty * ratio;

    if (addRawMaterial) {
      addRawMaterial({
        name: newMatName.trim(),
        nameSwahili: newMatName.trim(),
        category: finalCategory,
        source: newMatSource.trim() || "Local Supplier",
        purchaseUnit: newMatPurchaseUnit.trim() || "units",
        unit: newMatUnit.trim() || "units",
        displayUnit: newMatPurchaseUnit.trim() || "units",
        unitRatio: ratio,
        currentBalance: finalInitInventory,
        purchasePrice: initPrice,
        reorderLevel: parseFloat(newMatReorder) || 0
      });
    }

    setAddModalOpen(false);
    setNewMatName("");
    setNewMatCustomCategory("");
    setNewMatSource("");
    setNewMatInitialQty("0");
    setNewMatInitialPrice("0");
    setToast({ message: \`✓ Added \${newMatName}\`, type: "success" });
  };

  // Quick reset all to 0
  const handleQuickResetAllToZero = () => {
    if (window.confirm("Reset all raw material quantities and prices to ZERO (0)? This is ideal for fresh testing.")) {
      if (resetAllRawMaterialsToZero) {
        resetAllRawMaterialsToZero();
      }
      setToast({ message: "✓ All raw material quantities and prices reset to 0", type: "info" });
    }
  };

  return o.jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: "10px", width: "100%", padding: "10px 0 36px 0" },
    children: [
      
      // Toast notification
      toast && o.jsx("div", {
        style: {
          position: "fixed",
          top: "14px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          background: toast.type === "info" ? "#0284c7" : "#059669",
          color: "#ffffff",
          padding: "8px 14px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 700,
          boxShadow: "0 4px 14px rgba(0,0,0,0.3)"
        },
        children: toast.message
      }),

      // Header Bar
      o.jsxs("div", {
        style: {
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px"
        },
        children: [
          o.jsxs("div", {
            children: [
              o.jsx("h2", {
                style: { margin: 0, fontSize: "16px", fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.01em" },
                children: "Raw Material Master"
              }),
              o.jsx("span", {
                style: { fontSize: "11px", color: "var(--text-muted)" },
                children: "Malighafi za Kiwanda · Baseline & Stock Management"
              })
            ]
          }),
          
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "6px" },
            children: [
              // + Add Material
              o.jsxs("button", {
                type: "button",
                onClick: () => setAddModalOpen(true),
                className: "btn btn-secondary btn-sm",
                style: { padding: "5px 9px", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" },
                title: "Add a new material (e.g. 2nd cement brand)",
                children: [o.jsx("span", { children: "+" }), "Material"]
              }),

              // TOP BASELINE BUTTON - Preserved as the central opening stock setup
              o.jsxs("button", {
                type: "button",
                onClick: openFullBaselineModal,
                className: "btn btn-primary btn-sm",
                style: { padding: "5px 10px", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" },
                title: "Set opening physical baseline units and prices for all materials",
                children: [o.jsx("span", { children: "🎯" }), "Baseline"]
              }),

              // 🔄 0 Qty/Price Reset
              o.jsx("button", {
                type: "button",
                onClick: handleQuickResetAllToZero,
                className: "btn btn-ghost btn-sm",
                style: { padding: "5px 7px", fontSize: "11px", color: "var(--text-muted)" },
                title: "Reset all quantities & prices to 0 for fresh testing",
                children: "0 Qty"
              })
            ]
          })
        ]
      }),

      // Initial Baseline Setup Prompt Banner
      zeroBaselineItems.length > 0 && o.jsxs("div", {
        style: {
          width: "100%",
          background: "rgba(59, 130, 246, 0.08)",
          border: "1px solid rgba(59, 130, 246, 0.25)",
          borderRadius: "8px",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          boxSizing: "border-box"
        },
        children: [
          o.jsxs("div", {
            children: [
              o.jsxs("div", {
                style: { fontSize: "12.5px", fontWeight: 700, color: "#93c5fd", display: "flex", alignItems: "center", gap: "5px" },
                children: [
                  o.jsx("span", { children: "🎯" }),
                  "Initial Stock Baseline Ready"
                ]
              }),
              o.jsxs("div", {
                style: { fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" },
                children: [zeroBaselineItems.length, " materials currently have 0 stock. Set initial physical counts & prices to begin."]
              })
            ]
          }),
          o.jsx("button", {
            type: "button",
            onClick: openFullBaselineModal,
            className: "btn btn-primary btn-sm",
            style: { fontSize: "11px", padding: "6px 12px", whiteSpace: "nowrap", fontWeight: 700 },
            children: "Set Baseline"
          })
        ]
      }),

      // Summary KPI bar
      o.jsxs("div", {
        style: {
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          background: "var(--bg-surface-elevated)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "8px",
          padding: "10px 14px",
          boxSizing: "border-box"
        },
        children: [
          o.jsxs("div", {
            children: [
              o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", textTransform: "uppercase" }, children: "Stock Valuation" }),
              o.jsxs("div", {
                style: { fontSize: "14.5px", fontWeight: 800, color: "#f8fafc", fontFamily: "var(--font-mono)" },
                children: ["Tsh ", Math.round(totalValuation).toLocaleString()]
              })
            ]
          }),
          o.jsxs("div", {
            style: { borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: "12px" },
            children: [
              o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", textTransform: "uppercase" }, children: "Materials" }),
              o.jsxs("div", {
                style: { fontSize: "14.5px", fontWeight: 800, color: "#f8fafc" },
                children: [materials.length, " ", o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)" }, children: "items" })]
              })
            ]
          }),
          o.jsxs("div", {
            style: { borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: "12px" },
            children: [
              o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", textTransform: "uppercase" }, children: "Baseline Status" }),
              o.jsx("div", {
                style: { fontSize: "14.5px", fontWeight: 800, color: zeroBaselineItems.length > 0 ? "#fbbf24" : "#10b981" },
                children: zeroBaselineItems.length > 0 ? \`\${zeroBaselineItems.length} at 0\` : "✓ Configured"
              })
            ]
          })
        ]
      }),

      // Search & Category Filters
      o.jsxs("div", {
        style: { width: "100%", display: "flex", flexDirection: "column", gap: "6px" },
        children: [
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "0 10px" },
            children: [
              o.jsx(ii, { size: 13, color: "var(--text-muted)" }),
              o.jsx("input", {
                type: "text",
                value: searchTerm,
                onChange: e => setSearchTerm(e.target.value),
                placeholder: "Search material, category, source...",
                style: { border: "none", background: "transparent", padding: "7px 8px", fontSize: "12px", color: "#f8fafc", width: "100%", outline: "none" }
              }),
              searchTerm && o.jsx("button", {
                type: "button",
                onClick: () => setSearchTerm(""),
                style: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "12px" },
                children: "✕"
              })
            ]
          }),

          // Category Pills
          o.jsx("div", {
            style: { display: "flex", gap: "5px", overflowX: "auto", paddingBottom: "2px" },
            children: categories.map(cat => {
              const count = cat === "All" ? materials.length : materials.filter(m => m.category === cat).length;
              const isActive = selectedCategory === cat;
              return o.jsxs("button", {
                type: "button",
                onClick: () => setSelectedCategory(cat),
                style: {
                  padding: "4px 9px",
                  borderRadius: "4px",
                  border: isActive ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.07)",
                  background: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  fontSize: "11px",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                },
                children: [
                  cat, " (", count, ")"
                ]
              }, cat);
            })
          })
        ]
      }),

      // VERTICAL LIST OF CARDS WITH REDUCED LENGTH & TOP-RIGHT INTAKE TRIP BUTTON
      o.jsx("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "100%",
          boxSizing: "border-box"
        },
        children: filteredMaterials.length === 0 ? o.jsx("div", {
          style: { textAlign: "center", padding: "30px 16px", color: "var(--text-muted)", fontSize: "12px" },
          children: "No materials match the filter."
        }) : filteredMaterials.map(m => {
          const isZero = (m.currentBalance || 0) === 0;
          const isLow = !isZero && (m.currentBalance || 0) <= (m.reorderLevel || 0);
          const ratio = m.unitRatio || 1;
          const effPrice = (m.purchasePrice || 0) / ratio;
          const itemValuation = Math.round((m.currentBalance || 0) * effPrice);
          const stockInfo = formatStock(m);

          return o.jsxs("div", {
            className: "card-elevated",
            style: {
              padding: "9px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              background: "var(--bg-surface-elevated)",
              border: isZero ? "1px dashed rgba(255, 255, 255, 0.14)" : isLow ? "1px solid rgba(245, 158, 11, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              width: "100%",
              boxSizing: "border-box"
            },
            children: [
              
              // TOP ROW: Material Details on Left, INTAKE TRIP BUTTON ON TOP RIGHT CORNER
              o.jsxs("div", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px"
                },
                children: [
                  // Left details: Number, Category, Name, Supplier, Status
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", minWidth: 0 },
                    children: [
                      o.jsxs("span", {
                        style: { fontSize: "10px", fontWeight: 800, background: "rgba(255, 255, 255, 0.06)", color: "#cbd5e1", padding: "1px 5px", borderRadius: "3px" },
                        children: ["#", m.no || "-"]
                      }),
                      o.jsx("span", {
                        style: { fontSize: "10px", fontWeight: 600, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#cbd5e1", padding: "1px 6px", borderRadius: "3px" },
                        children: m.category
                      }),
                      o.jsx("strong", {
                        style: { fontSize: "14px", fontWeight: 800, color: "#f8fafc", lineHeight: 1.2 },
                        children: m.name
                      }),
                      m.source && o.jsxs("span", {
                        style: { fontSize: "11px", color: "var(--text-muted)" },
                        children: ["· 📍 ", m.source]
                      }),
                      isZero ? o.jsx("span", {
                        style: { fontSize: "9.5px", color: "#fbbf24", background: "rgba(251, 191, 36, 0.08)", padding: "1px 5px", borderRadius: "3px", border: "1px solid rgba(251, 191, 36, 0.2)" },
                        children: "Baseline: 0"
                      }) : isLow ? o.jsx("span", {
                        style: { fontSize: "9.5px", color: "#f87171", background: "rgba(239, 68, 68, 0.08)", padding: "1px 5px", borderRadius: "3px", border: "1px solid rgba(239, 68, 68, 0.2)" },
                        children: "Low Stock"
                      }) : null
                    ]
                  }),

                  // TOP RIGHT CORNER: INTAKE TRIP BUTTON (Replaces previous delete button)
                  o.jsxs("button", {
                    type: "button",
                    onClick: () => openIntakeFor(m),
                    className: "btn btn-primary btn-sm",
                    style: {
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      whiteSpace: "nowrap",
                      flexShrink: 0
                    },
                    title: "Record daily intake / restock delivery for " + m.name,
                    children: [
                      o.jsx("span", { children: "📥" }),
                      "Intake Trip"
                    ]
                  })
                ]
              }),

              // BOTTOM ROW: COMPACT METRICS STRIP (Reduced length, single-row summary)
              o.jsxs("div", {
                style: {
                  background: "var(--bg-surface)",
                  borderRadius: "5px",
                  padding: "6px 10px",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "8px"
                },
                children: [
                  // Stock Count in Trips
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "baseline", gap: "6px" },
                    children: [
                      o.jsx("span", { style: { fontSize: "9.5px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }, children: "Stock:" }),
                      o.jsx("span", { style: { fontSize: "14px", fontWeight: 800, color: isZero ? "var(--text-muted)" : "#f8fafc", fontFamily: "var(--font-mono)" }, children: stockInfo.mainDisplay }),
                      stockInfo.subDetail ? o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)" }, children: stockInfo.subDetail }) : null
                    ]
                  }),

                  // Unit Price
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "baseline", gap: "5px" },
                    children: [
                      o.jsx("span", { style: { fontSize: "9.5px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }, children: "Price:" }),
                      o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "#cbd5e1", fontFamily: "var(--font-mono)" }, children: ["Tsh ", (m.purchasePrice || 0).toLocaleString(), "/", m.purchaseUnit] })
                    ]
                  }),

                  // Total Valuation
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "baseline", gap: "5px" },
                    children: [
                      o.jsx("span", { style: { fontSize: "9.5px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }, children: "Value:" }),
                      o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "#cbd5e1", fontFamily: "var(--font-mono)" }, children: ["Tsh ", itemValuation.toLocaleString()] })
                    ]
                  })
                ]
              })
            ]
          }, m.key);
        })
      }),

      // ================= FULL BASELINE SETUP MODAL (Top button) =================
      baselineModalOpen && o.jsx("div", {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px"
        },
        children: o.jsxs("div", {
          style: {
            background: "#0f172a",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "10px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            overflow: "hidden"
          },
          children: [
            // Modal Header
            o.jsxs("div", {
              style: { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsxs("h3", { style: { margin: 0, fontSize: "15px", fontWeight: 800, color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px" }, children: [o.jsx("span", { children: "🎯" }), "Initial Material Baseline Setup"] }),
                    o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: "Enter opening stock counts and purchase prices for testing or yard launch" })
                  ]
                }),
                o.jsx("button", {
                  type: "button",
                  onClick: () => setBaselineModalOpen(false),
                  style: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" },
                  children: "✕"
                })
              ]
            }),

            // Baseline Form (Scrollable)
            o.jsxs("form", {
              onSubmit: handleSaveFullBaseline,
              style: { display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" },
              children: [
                o.jsxs("div", {
                  style: { padding: "12px 16px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "10px" },
                  children: [
                    o.jsx("div", {
                      style: { fontSize: "11px", color: "#93c5fd", background: "rgba(59, 130, 246, 0.08)", padding: "8px 10px", borderRadius: "6px", border: "1px solid rgba(59, 130, 246, 0.2)" },
                      children: "💡 Bulk materials (Mchanga, Chipping, Kokoto, Dust) are entered in Trips (1 Trip = 2,500 ndoo). Non-bulk are entered in Bags, Rolls, or Kg."
                    }),

                    materials.map(m => {
                      const entry = baselineData[m.key] || { qty: "", price: "", source: "" };
                      const isTrip = m.purchaseUnit && m.purchaseUnit.includes("Trip");

                      return o.jsxs("div", {
                        style: {
                          background: "var(--bg-surface-elevated)",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px"
                        },
                        children: [
                          o.jsxs("div", {
                            style: { display: "flex", alignItems: "center", justifyContent: "space-between" },
                            children: [
                              o.jsxs("div", {
                                style: { display: "flex", alignItems: "center", gap: "6px" },
                                children: [
                                  o.jsxs("span", { style: { fontSize: "10px", fontWeight: 700, color: "var(--text-muted)" }, children: ["#", m.no] }),
                                  o.jsx("strong", { style: { fontSize: "13px", color: "#f8fafc" }, children: m.name }),
                                  o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)" }, children: \`(\${m.category})\` })
                                ]
                              }),
                              o.jsx("span", { style: { fontSize: "10.5px", color: "#93c5fd", fontWeight: 600 }, children: m.purchaseUnit })
                            ]
                          }),

                          o.jsxs("div", {
                            style: { display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "8px" },
                            children: [
                              // Baseline Qty
                              o.jsxs("div", {
                                children: [
                                  o.jsxs("label", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: ["Opening Qty (", isTrip ? "Trips" : m.unit, ")"] }),
                                  o.jsx("input", {
                                    type: "number",
                                    step: "any",
                                    min: "0",
                                    placeholder: isTrip ? "e.g. 5" : "0",
                                    value: entry.qty,
                                    onChange: e => {
                                      const val = e.target.value;
                                      setBaselineData(prev => ({
                                        ...prev,
                                        [m.key]: { ...(prev[m.key] || {}), qty: val }
                                      }));
                                    },
                                    style: { width: "100%", padding: "6px 8px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#f8fafc", fontSize: "12px", fontFamily: "var(--font-mono)" }
                                  })
                                ]
                              }),

                              // Purchase Price
                              o.jsxs("div", {
                                children: [
                                  o.jsxs("label", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: ["Price (Tsh/", isTrip ? "Trip" : m.unit, ")"] }),
                                  o.jsx("input", {
                                    type: "number",
                                    step: "any",
                                    min: "0",
                                    placeholder: "e.g. 250000",
                                    value: entry.price,
                                    onChange: e => {
                                      const val = e.target.value;
                                      setBaselineData(prev => ({
                                        ...prev,
                                        [m.key]: { ...(prev[m.key] || {}), price: val }
                                      }));
                                    },
                                    style: { width: "100%", padding: "6px 8px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#f8fafc", fontSize: "12px", fontFamily: "var(--font-mono)" }
                                  })
                                ]
                              }),

                              // Supplier / Source
                              o.jsxs("div", {
                                children: [
                                  o.jsx("label", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "Supplier / Source" }),
                                  o.jsx("input", {
                                    type: "text",
                                    placeholder: m.source || "Source",
                                    value: entry.source,
                                    onChange: e => {
                                      const val = e.target.value;
                                      setBaselineData(prev => ({
                                        ...prev,
                                        [m.key]: { ...(prev[m.key] || {}), source: val }
                                      }));
                                    },
                                    style: { width: "100%", padding: "6px 8px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#f8fafc", fontSize: "12px" }
                                  })
                                ]
                              })
                            ]
                          })
                        ]
                      }, m.key);
                    })
                  ]
                }),

                // Modal Footer
                o.jsxs("div", {
                  style: { padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" },
                  children: [
                    o.jsx("button", {
                      type: "button",
                      onClick: () => setBaselineModalOpen(false),
                      className: "btn btn-ghost btn-sm",
                      children: "Cancel"
                    }),
                    o.jsx("button", {
                      type: "submit",
                      className: "btn btn-primary btn-sm",
                      style: { fontWeight: 700, padding: "7px 14px" },
                      children: "💾 Save Baseline Opening Stock"
                    })
                  ]
                })
              ]
            })
          ]
        })
      }),

      // ================= DAILY INTAKE RESTOCK MODAL =================
      intakeModalOpen && activeIntakeMat && o.jsx("div", {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px"
        },
        children: o.jsxs("div", {
          style: {
            background: "#0f172a",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "10px",
            width: "100%",
            maxWidth: "460px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            overflow: "hidden"
          },
          children: [
            o.jsxs("div", {
              style: { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsxs("h3", { style: { margin: 0, fontSize: "14.5px", fontWeight: 800, color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px" }, children: [o.jsx("span", { children: "📥" }), "Record Daily Restock Intake"] }),
                    o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: "Add delivery note / trip intake to factory inventory" })
                  ]
                }),
                o.jsx("button", {
                  type: "button",
                  onClick: () => setIntakeModalOpen(false),
                  style: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" },
                  children: "✕"
                })
              ]
            }),

            o.jsxs("form", {
              onSubmit: handleSaveIntake,
              style: { padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" },
              children: [
                // Material Selector
                o.jsxs("div", {
                  children: [
                    o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Select Raw Material" }),
                    o.jsx("select", {
                      value: intakeKey,
                      onChange: e => handleSelectIntakeMaterial(e.target.value),
                      style: { width: "100%", padding: "8px 10px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12.5px" },
                      children: materials.map(m => o.jsxs("option", { value: m.key, children: [m.name, " (", m.purchaseUnit, ")"] }, m.key))
                    })
                  ]
                }),

                // Date
                o.jsxs("div", {
                  children: [
                    o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Delivery Date" }),
                    o.jsx("input", {
                      type: "date",
                      value: intakeDate,
                      onChange: e => setIntakeDate(e.target.value),
                      style: { width: "100%", padding: "7px 10px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12.5px" }
                    })
                  ]
                }),

                // Qty & Unit Mode
                o.jsxs("div", {
                  children: [
                    o.jsxs("div", {
                      style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" },
                      children: [
                        o.jsxs("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }, children: ["Delivered Quantity (", intakeUnitMode === "purchase" ? activeIntakeMat.purchaseUnit : activeIntakeMat.unit, ")"] }),
                        activeIntakeMat.unitRatio > 1 && o.jsxs("div", {
                          style: { display: "flex", gap: "4px" },
                          children: [
                            o.jsx("button", {
                              type: "button",
                              onClick: () => setIntakeUnitMode("purchase"),
                              style: { padding: "2px 6px", fontSize: "10px", borderRadius: "3px", border: "none", background: intakeUnitMode === "purchase" ? "var(--brand-500)" : "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer" },
                              children: activeIntakeMat.purchaseUnit
                            }),
                            o.jsx("button", {
                              type: "button",
                              onClick: () => setIntakeUnitMode("usage"),
                              style: { padding: "2px 6px", fontSize: "10px", borderRadius: "3px", border: "none", background: intakeUnitMode === "usage" ? "var(--brand-500)" : "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer" },
                              children: activeIntakeMat.unit
                            })
                          ]
                        })
                      ]
                    }),
                    o.jsx("input", {
                      type: "number",
                      step: "any",
                      min: "0",
                      value: intakeQty,
                      onChange: e => handleIntakeQtyChange(e.target.value),
                      placeholder: activeIntakeMat.purchaseUnit && activeIntakeMat.purchaseUnit.includes("Trip") ? "e.g. 2 Trips" : "e.g. 100",
                      required: true,
                      style: { width: "100%", padding: "8px 10px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "13px", fontFamily: "var(--font-mono)" }
                    })
                  ]
                }),

                // Pricing
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "10.5px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "Unit Price (Tsh)" }),
                        o.jsx("input", {
                          type: "number",
                          step: "any",
                          value: intakeUnitPrice,
                          onChange: e => handleIntakeUnitPriceChange(e.target.value),
                          placeholder: "Price",
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12px", fontFamily: "var(--font-mono)" }
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "10.5px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "Total Invoice (Tsh)" }),
                        o.jsx("input", {
                          type: "number",
                          step: "any",
                          value: intakeTotalCost,
                          onChange: e => handleIntakeTotalCostChange(e.target.value),
                          placeholder: "Total Cost",
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12px", fontFamily: "var(--font-mono)" }
                        })
                      ]
                    })
                  ]
                }),

                // Supplier & Ref
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "10.5px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "Supplier" }),
                        o.jsx("input", {
                          type: "text",
                          value: intakeSource,
                          onChange: e => setIntakeSource(e.target.value),
                          placeholder: activeIntakeMat.source || "Supplier",
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12px" }
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "10.5px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "Delivery / Invoice #" }),
                        o.jsx("input", {
                          type: "text",
                          value: intakeDeliveryRef,
                          onChange: e => setIntakeDeliveryRef(e.target.value),
                          placeholder: "e.g. TR-994",
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12px" }
                        })
                      ]
                    })
                  ]
                }),

                o.jsxs("div", {
                  style: { display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "6px" },
                  children: [
                    o.jsx("button", {
                      type: "button",
                      onClick: () => setIntakeModalOpen(false),
                      className: "btn btn-ghost btn-sm",
                      children: "Cancel"
                    }),
                    o.jsx("button", {
                      type: "submit",
                      className: "btn btn-primary btn-sm",
                      style: { fontWeight: 700, padding: "7px 14px" },
                      children: "+ Confirm Intake"
                    })
                  ]
                })
              ]
            })
          ]
        })
      }),

      // ================= ADD NEW MATERIAL MODAL =================
      addModalOpen && o.jsx("div", {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px"
        },
        children: o.jsxs("div", {
          style: {
            background: "#0f172a",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "10px",
            width: "100%",
            maxWidth: "460px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            overflow: "hidden"
          },
          children: [
            o.jsxs("div", {
              style: { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsxs("h3", { style: { margin: 0, fontSize: "14.5px", fontWeight: 800, color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px" }, children: [o.jsx("span", { children: "➕" }), "Add New Raw Material"] }),
                    o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: "e.g. Dangote 32.5R Cement or specialty additive" })
                  ]
                }),
                o.jsx("button", {
                  type: "button",
                  onClick: () => setAddModalOpen(false),
                  style: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" },
                  children: "✕"
                })
              ]
            }),

            o.jsxs("form", {
              onSubmit: handleAddNewMaterial,
              style: { padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto" },
              children: [
                // Name
                o.jsxs("div", {
                  children: [
                    o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Material Name *" }),
                    o.jsx("input", {
                      type: "text",
                      value: newMatName,
                      onChange: e => setNewMatName(e.target.value),
                      placeholder: "e.g. Dangote 32.5R Cement",
                      required: true,
                      style: { width: "100%", padding: "8px 10px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "13px" }
                    })
                  ]
                }),

                // Category
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Category" }),
                        o.jsxs("select", {
                          value: newMatCategory,
                          onChange: e => setNewMatCategory(e.target.value),
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12px" },
                          children: [
                            o.jsx("option", { value: "Cement", children: "Cement" }),
                            o.jsx("option", { value: "Aggregates & Sand", children: "Aggregates & Sand" }),
                            o.jsx("option", { value: "Reinforcements & Mesh", children: "Reinforcements & Mesh" }),
                            o.jsx("option", { value: "Oxides & Pigments", children: "Oxides & Pigments" }),
                            o.jsx("option", { value: "Chemicals & Additives", children: "Chemicals & Additives" }),
                            o.jsx("option", { value: "Custom", children: "+ Custom Category" })
                          ]
                        })
                      ]
                    }),
                    newMatCategory === "Custom" ? o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Custom Name" }),
                        o.jsx("input", {
                          type: "text",
                          value: newMatCustomCategory,
                          onChange: e => setNewMatCustomCategory(e.target.value),
                          placeholder: "Category",
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12px" }
                        })
                      ]
                    }) : o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Supplier / Source" }),
                        o.jsx("input", {
                          type: "text",
                          value: newMatSource,
                          onChange: e => setNewMatSource(e.target.value),
                          placeholder: "e.g. Dangote Depot",
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12px" }
                        })
                      ]
                    })
                  ]
                }),

                // Units & Ratio
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "Purchase Unit" }),
                        o.jsx("input", {
                          type: "text",
                          value: newMatPurchaseUnit,
                          onChange: e => setNewMatPurchaseUnit(e.target.value),
                          placeholder: "50 kg bags",
                          style: { width: "100%", padding: "6px 8px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#f8fafc", fontSize: "11.5px" }
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "Usage Unit" }),
                        o.jsx("input", {
                          type: "text",
                          value: newMatUnit,
                          onChange: e => setNewMatUnit(e.target.value),
                          placeholder: "bags",
                          style: { width: "100%", padding: "6px 8px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#f8fafc", fontSize: "11.5px" }
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "Ratio (1 unit = ?)" }),
                        o.jsx("input", {
                          type: "number",
                          step: "any",
                          value: newMatUnitRatio,
                          onChange: e => setNewMatUnitRatio(e.target.value),
                          placeholder: "1",
                          style: { width: "100%", padding: "6px 8px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#f8fafc", fontSize: "11.5px" }
                        })
                      ]
                    })
                  ]
                }),

                // Initial Baseline Qty & Price
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Initial Baseline Qty" }),
                        o.jsx("input", {
                          type: "number",
                          step: "any",
                          value: newMatInitialQty,
                          onChange: e => setNewMatInitialQty(e.target.value),
                          placeholder: "0",
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12px", fontFamily: "var(--font-mono)" }
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Purchase Price (Tsh)" }),
                        o.jsx("input", {
                          type: "number",
                          step: "any",
                          value: newMatInitialPrice,
                          onChange: e => setNewMatInitialPrice(e.target.value),
                          placeholder: "0",
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12px", fontFamily: "var(--font-mono)" }
                        })
                      ]
                    })
                  ]
                }),

                o.jsxs("div", {
                  style: { display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "6px" },
                  children: [
                    o.jsx("button", {
                      type: "button",
                      onClick: () => setAddModalOpen(false),
                      className: "btn btn-ghost btn-sm",
                      children: "Cancel"
                    }),
                    o.jsx("button", {
                      type: "submit",
                      className: "btn btn-primary btn-sm",
                      style: { fontWeight: 700, padding: "7px 14px" },
                      children: "+ Add Material"
                    })
                  ]
                })
              ]
            })
          ]
        })
      })
    ]
  });
},\n`;

bundle = bundle.substring(0, startIdx) + newComponent + bundle.substring(endIdx);
fs.writeFileSync(bundlePath, bundle, 'utf8');

console.log('Saved bundle. Checking syntax...');
execSync('node --check ' + bundlePath);
console.log('✓ assets/index-hgjhj-0G.js syntax is 100% VALID!');

// Bump cache busters
const now = Date.now();
const swPath = 'service-worker.js';
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = ['"][^'"]+['"]/, "const CACHE_NAME = 'stumarcot-pwa-v2.0.0-" + now + "'");
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('✓ Bumped service worker cache version to stumarcot-pwa-v2.0.0-' + now);
}

const htmlPath = 'index.html';
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/src="\.\/assets\/index-hgjhj-0G\.js[^"]*"/, 'src="./assets/index-hgjhj-0G.js?v=' + now + '"');
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('✓ Updated index.html with new cache buster timestamp: ' + now);
}
