const fs = require('fs');
const { execSync } = require('child_process');

console.log('Updating RawMaterialMasterView: Cement AS # 1 material and FIRST to appear category...');

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

// We replace RawMaterialMasterView while ensuring trailing comma '},\n' before x1
const newComponent = `RawMaterialMasterView = ({ rawMaterials: materials, addRawMaterialStock, updateRawMaterialMaster, addRawMaterial, removeRawMaterial, resetAllRawMaterialsToZero, onNavigate, staffName }) => {
  const [searchTerm, setSearchTerm] = B.useState("");
  const [selectedCategory, setSelectedCategory] = B.useState("All");
  
  // Full Baseline Modal State (Batch opening stock setup with Due Date)
  const [baselineModalOpen, setBaselineModalOpen] = B.useState(false);
  const [baselineData, setBaselineData] = B.useState({});
  const [baselineDate, setBaselineDate] = B.useState(() => new Date().toISOString().split("T")[0]);
  const [baselineGlobalDueDate, setBaselineGlobalDueDate] = B.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });

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
  const [newMatDueDate, setNewMatDueDate] = B.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().split("T")[0];
  });
  const [newMatReorder, setNewMatReorder] = B.useState("50");

  // Toast feedback
  const [toast, setToast] = B.useState(null);
  B.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Helper: check if a material is Cement
  const isCementMaterial = (m) => {
    if (!m) return false;
    const cat = (m.category || "").toLowerCase();
    const name = (m.name || "").toLowerCase();
    const key = (m.key || "").toLowerCase();
    return cat === "cement" || name.includes("cement") || key.includes("cement");
  };

  // Point 1: Cement is ALWAYS arranged FIRST to appear category!
  const categories = B.useMemo(() => {
    const otherCats = [];
    materials.forEach(m => {
      const c = (m.category || "").trim();
      if (c && c.toLowerCase() !== "cement" && !otherCats.includes(c)) {
        otherCats.push(c);
      }
    });
    // Cement MUST be the FIRST category to appear, followed by All, then other categories
    return ["Cement", "All", ...otherCats];
  }, [materials]);

  // Helper: Sort list so Cement is ALWAYS arranged at the very top as # 1 Material
  const sortWithCementFirst = (list) => {
    return [...list].sort((a, b) => {
      const aIsCement = isCementMaterial(a);
      const bIsCement = isCementMaterial(b);
      if (aIsCement && !bIsCement) return -1;
      if (!aIsCement && bIsCement) return 1;
      return (a.no || 0) - (b.no || 0);
    });
  };

  // Filtered & Sorted Materials
  const filteredMaterials = B.useMemo(() => {
    const list = materials.filter(m => {
      let matchCat = true;
      if (selectedCategory === "Cement") {
        matchCat = isCementMaterial(m);
      } else if (selectedCategory !== "All") {
        matchCat = m.category === selectedCategory;
      }

      const s = searchTerm.toLowerCase().trim();
      const matchSearch = !s || 
        (m.name && m.name.toLowerCase().includes(s)) || 
        (m.category && m.category.toLowerCase().includes(s)) ||
        (m.source && m.source.toLowerCase().includes(s));
      return matchCat && matchSearch;
    });

    return sortWithCementFirst(list);
  }, [materials, selectedCategory, searchTerm]);

  // All materials sorted with Cement first (for Baseline modal)
  const allMaterialsCementFirst = B.useMemo(() => {
    return sortWithCementFirst(materials);
  }, [materials]);

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

  // Format stock display: Trips as main, ndoo in small muted font
  const formatStock = (m) => {
    const bal = m.currentBalance || 0;
    const ratio = m.unitRatio || 1;
    const pUnit = m.purchaseUnit || m.unit;
    const isTrip = pUnit && pUnit.includes("Trip");

    if (isTrip && ratio > 1) {
      const trips = (bal / ratio).toFixed(2).replace(/\\.00$/, "");
      return {
        main: trips + " Trips",
        sub: "(" + bal.toLocaleString() + " ndoo)"
      };
    }

    return {
      main: bal.toLocaleString() + " " + (m.unit || "units"),
      sub: null
    };
  };

  // Open Full Baseline Modal
  const openFullBaselineModal = () => {
    const initial = {};
    materials.forEach(m => {
      const ratio = m.unitRatio || 1;
      const pUnit = m.purchaseUnit || m.unit;
      const isTrip = pUnit && pUnit.includes("Trip");
      const currentVal = m.currentBalance !== undefined ? m.currentBalance : 0;
      const currentPrice = m.purchasePrice !== undefined ? m.purchasePrice : 0;

      let displayQty = currentVal;
      if (isTrip && ratio > 1 && currentVal > 0) {
        displayQty = (currentVal / ratio).toFixed(2).replace(/\\.00$/, "");
      }

      initial[m.key] = {
        qty: displayQty ? String(displayQty) : "0",
        price: currentPrice ? String(currentPrice) : "0",
        source: m.source || "",
        dueDate: m.dueDate || baselineGlobalDueDate
      };
    });
    setBaselineData(initial);
    setBaselineModalOpen(true);
  };

  // Save Full Baseline
  const handleSaveFullBaseline = (e) => {
    e.preventDefault();
    if (!updateRawMaterialMaster) {
      alert("Baseline update handler is not available");
      return;
    }

    let updatedCount = 0;
    materials.forEach(m => {
      const entry = baselineData[m.key];
      if (entry) {
        const rawQty = parseFloat(entry.qty);
        const rawPrice = parseFloat(entry.price);
        const sourceVal = entry.source !== undefined ? entry.source.trim() : m.source;
        const dueDateVal = entry.dueDate || baselineGlobalDueDate;

        if (!isNaN(rawQty) && rawQty >= 0) {
          const ratio = m.unitRatio || 1;
          const pUnit = m.purchaseUnit || m.unit;
          const isTrip = pUnit && pUnit.includes("Trip");
          const finalInventoryBal = (isTrip && ratio > 1) ? (rawQty * ratio) : rawQty;
          const finalPrice = !isNaN(rawPrice) && rawPrice >= 0 ? rawPrice : (m.purchasePrice || 0);

          updateRawMaterialMaster(m.key, {
            currentBalance: finalInventoryBal,
            baselineBalance: finalInventoryBal,
            purchasePrice: finalPrice,
            source: sourceVal,
            dueDate: dueDateVal,
            baselineDate: baselineDate,
            lastUpdated: new Date().toISOString()
          });
          updatedCount++;
        }
      }
    });

    setBaselineModalOpen(false);
    setToast({
      message: \`✓ Opening stock baseline updated with due dates for \${updatedCount} materials\`,
      type: "success"
    });
  };

  // Quick Reset all to zero
  const handleQuickResetAllToZero = () => {
    const confirmed = window.confirm(
      "Are you sure you want to RESET ALL raw material quantities and prices to 0?\\n\\nThis lets you test entering baseline units and due dates as a real user."
    );
    if (!confirmed) return;

    if (resetAllRawMaterialsToZero) {
      resetAllRawMaterialsToZero();
      setToast({ message: "✓ All material quantities and prices reset to 0 for testing", type: "info" });
    } else if (updateRawMaterialMaster) {
      materials.forEach(m => {
        updateRawMaterialMaster(m.key, {
          currentBalance: 0,
          baselineBalance: 0,
          purchasePrice: 0,
          lastUpdated: new Date().toISOString()
        });
      });
      setToast({ message: "✓ All materials reset to 0", type: "info" });
    }
  };

  // Open Intake Modal
  const openIntakeModalFor = (materialKey) => {
    const mat = materials.find(m => m.key === materialKey) || materials[0];
    setIntakeKey(mat.key);
    setIntakeQty("");
    setIntakeUnitPrice(mat.purchasePrice ? String(mat.purchasePrice) : "");
    setIntakeTotalCost("");
    setIntakeSource(mat.source || "");
    setIntakeDeliveryRef("");
    setIntakeNote("");
    setIntakeUnitMode("purchase");
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

  const handleIntakePriceChange = (val) => {
    setIntakeUnitPrice(val);
    const p = parseFloat(val) || 0;
    const q = parseFloat(intakeQty) || 0;
    if (p > 0 && q > 0) {
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
    const finalInventoryBal = ratio > 1 ? (initQty * ratio) : initQty;

    const generatedKey = newMatName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_") + "_" + Date.now().toString().slice(-4);

    const newMaterialObj = {
      no: materials.length + 1,
      key: generatedKey,
      category: finalCategory,
      name: newMatName.trim(),
      nameSwahili: newMatName.trim(),
      unit: newMatUnit.trim() || "units",
      purchaseUnit: newMatPurchaseUnit.trim() || "units",
      displayUnit: newMatPurchaseUnit.trim() || "units",
      unitRatio: ratio,
      currentBalance: finalInventoryBal,
      baselineBalance: finalInventoryBal,
      purchasePrice: initPrice,
      dueDate: newMatDueDate,
      reorderLevel: parseFloat(newMatReorder) || 50,
      source: newMatSource.trim() || "Local Supplier",
      notes: "Custom raw material added by user",
      isCustom: true
    };

    if (addRawMaterial) {
      addRawMaterial(newMaterialObj);
      setToast({ message: \`✓ Added new material: \${newMaterialObj.name}\`, type: "success" });
    }

    setAddModalOpen(false);
    setNewMatName("");
    setNewMatSource("");
    setNewMatCustomCategory("");
    setNewMatInitialQty("0");
    setNewMatInitialPrice("0");
  };

  return o.jsxs("div", {
    style: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      boxSizing: "border-box"
    },
    children: [
      
      // Floating Toast
      toast && o.jsx("div", {
        style: {
          position: "fixed",
          top: "16px",
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
                title: "Set opening physical baseline units, prices and due dates for all materials",
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
                children: [zeroBaselineItems.length, " materials currently have 0 stock. Set initial physical counts, prices & due dates to begin."]
              })
            ]
          }),
          o.jsxs("button", {
            type: "button",
            onClick: openFullBaselineModal,
            className: "btn btn-primary btn-sm",
            style: { padding: "6px 12px", fontSize: "11.5px", fontWeight: 700, whiteSpace: "nowrap" },
            children: ["Configure Baseline ➔"]
          })
        ]
      }),

      // Summary Metric Cards (Compact)
      o.jsxs("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "8px",
          width: "100%",
          boxSizing: "border-box"
        },
        children: [
          o.jsxs("div", {
            className: "card-elevated",
            style: { padding: "8px 12px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px" },
            children: [
              o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", textTransform: "uppercase" }, children: "Total Materials" }),
              o.jsxs("div", { style: { fontSize: "14.5px", fontWeight: 800, color: "#f8fafc" }, children: [materials.length, " items"] })
            ]
          }),

          o.jsxs("div", {
            className: "card-elevated",
            style: { padding: "8px 12px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px" },
            children: [
              o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", textTransform: "uppercase" }, children: "Stock Valuation" }),
              o.jsxs("div", { style: { fontSize: "14.5px", fontWeight: 800, color: "#38bdf8" }, children: ["Tsh ", Math.round(totalValuation).toLocaleString()] })
            ]
          }),

          o.jsxs("div", {
            className: "card-elevated",
            style: { padding: "8px 12px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px" },
            children: [
              o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", textTransform: "uppercase" }, children: "Low Stock Alert" }),
              o.jsx("div", {
                style: { fontSize: "14.5px", fontWeight: 800, color: lowStockItems.length > 0 ? "#f87171" : "#10b981" },
                children: lowStockItems.length > 0 ? \`\${lowStockItems.length} Low\` : "Healthy"
              })
            ]
          }),

          o.jsxs("div", {
            className: "card-elevated",
            style: { padding: "8px 12px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px" },
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

      // Search & Category Filters (Cement arranged as FIRST category to appear)
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

          // Category Pills - CEMENT IS ALWAYS FIRST TO APPEAR CATEGORY
          o.jsx("div", {
            style: { display: "flex", gap: "5px", overflowX: "auto", paddingBottom: "2px" },
            children: categories.map(cat => {
              const count = cat === "All" 
                ? materials.length 
                : cat === "Cement"
                  ? materials.filter(m => isCementMaterial(m)).length
                  : materials.filter(m => m.category === cat).length;
              const isActive = selectedCategory === cat;
              const isCementCat = cat === "Cement";

              return o.jsxs("button", {
                type: "button",
                onClick: () => setSelectedCategory(cat),
                style: {
                  padding: "4px 10px",
                  borderRadius: "4px",
                  border: isActive 
                    ? (isCementCat ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.3)") 
                    : (isCementCat ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(255,255,255,0.07)"),
                  background: isActive 
                    ? (isCementCat ? "rgba(59, 130, 246, 0.28)" : "rgba(255,255,255,0.12)") 
                    : (isCementCat ? "rgba(59, 130, 246, 0.1)" : "rgba(255,255,255,0.03)"),
                  color: isActive 
                    ? (isCementCat ? "#93c5fd" : "#ffffff") 
                    : (isCementCat ? "#bfdbfe" : "var(--text-secondary)"),
                  fontSize: "11px",
                  fontWeight: isActive || isCementCat ? 700 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                },
                children: [
                  isCementCat && o.jsx("span", { style: { fontSize: "10px" }, children: "⭐" }),
                  cat, " (", count, ")"
                ]
              }, cat);
            })
          })
        ]
      }),

      // VERTICAL LIST OF CARDS: Cement arranged as # 1 Material, reduced length, top-right intake trip button
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
        }) : filteredMaterials.map((m, idx) => {
          const isZero = (m.currentBalance || 0) === 0;
          const isLow = !isZero && (m.currentBalance || 0) <= (m.reorderLevel || 0);
          const ratio = m.unitRatio || 1;
          const effPrice = (m.purchasePrice || 0) / ratio;
          const itemValuation = Math.round((m.currentBalance || 0) * effPrice);
          const stockInfo = formatStock(m);
          const isCement = isCementMaterial(m);
          
          // Count cement items ahead of this one to handle multiple cements
          let cementRank = 1;
          if (isCement) {
            const cementPreceding = filteredMaterials.slice(0, idx).filter(isCementMaterial).length;
            cementRank = cementPreceding + 1;
          }
          const displayRankText = isCement 
            ? (cementRank === 1 ? "# 1 Material" : \`# 1-\${String.fromCharCode(64 + cementRank)} Material\`)
            : \`# \${idx + 1}\`;

          return o.jsxs("div", {
            className: "card-elevated",
            style: {
              padding: "9px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              background: "var(--bg-surface-elevated)",
              border: isZero 
                ? "1px dashed rgba(255, 255, 255, 0.14)" 
                : isLow 
                  ? "1px solid rgba(245, 158, 11, 0.35)" 
                  : isCement 
                    ? "1px solid rgba(59, 130, 246, 0.45)" 
                    : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              width: "100%",
              boxSizing: "border-box"
            },
            children: [
              
              // TOP ROW: Details on Left (Cement arranged as # 1 Material), INTAKE TRIP BUTTON ON TOP RIGHT
              o.jsxs("div", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px"
                },
                children: [
                  // Left: # 1 badge, Category, Name, Supplier, Status
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", minWidth: 0 },
                    children: [
                      // Point 1: Cement ALWAYS arranged as # 1 Material
                      o.jsx("span", {
                        style: {
                          fontSize: "10.5px",
                          fontWeight: 800,
                          background: isCement ? "rgba(59, 130, 246, 0.25)" : "rgba(255, 255, 255, 0.06)",
                          color: isCement ? "#60a5fa" : "#cbd5e1",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          border: isCement ? "1px solid rgba(59, 130, 246, 0.4)" : "none",
                          letterSpacing: "0.02em"
                        },
                        children: displayRankText
                      }),
                      o.jsx("span", {
                        style: {
                          fontSize: "10px",
                          fontWeight: 600,
                          background: isCement ? "rgba(59, 130, 246, 0.12)" : "rgba(255, 255, 255, 0.04)",
                          border: isCement ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid rgba(255, 255, 255, 0.08)",
                          color: isCement ? "#bfdbfe" : "#cbd5e1",
                          padding: "1px 6px",
                          borderRadius: "3px"
                        },
                        children: m.category
                      }),
                      o.jsx("strong", {
                        style: { fontSize: "14px", fontWeight: 800, color: "#f8fafc", lineHeight: 1.2 },
                        children: m.name
                      }),
                      m.source && o.jsxs("span", {
                        style: { fontSize: "10.5px", color: "var(--text-muted)" },
                        children: ["· ", m.source]
                      }),
                      isZero && o.jsx("span", {
                        style: { fontSize: "9.5px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", background: "rgba(251, 191, 36, 0.15)", color: "#fbbf24" },
                        children: "0 Baseline"
                      }),
                      isLow && o.jsx("span", {
                        style: { fontSize: "9.5px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", background: "rgba(239, 68, 68, 0.15)", color: "#f87171" },
                        children: "Low Stock"
                      })
                    ]
                  }),

                  // Right: INTAKE TRIP BUTTON (replaces delete material button on top-right corner)
                  o.jsxs("button", {
                    type: "button",
                    onClick: () => openIntakeModalFor(m.key),
                    className: "btn btn-primary btn-sm",
                    style: {
                      padding: "4px 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      flexShrink: 0
                    },
                    title: \`Record intake trip or delivery for \${m.name}\`,
                    children: [
                      o.jsx("span", { style: { fontSize: "11px" }, children: "📥" }),
                      "Intake Trip"
                    ]
                  })
                ]
              }),

              // BOTTOM ROW: Metrics & Stock Count Strip (Trips as main, ndoo in small font)
              o.jsxs("div", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "8px",
                  paddingTop: "4px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.04)"
                },
                children: [
                  // Stock count: Trips large, ndoo small
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "baseline", gap: "5px" },
                    children: [
                      o.jsx("span", {
                        style: {
                          fontSize: "14px",
                          fontWeight: 800,
                          color: isZero ? "var(--text-muted)" : "#f8fafc",
                          fontFamily: "var(--font-mono)"
                        },
                        children: stockInfo.main
                      }),
                      stockInfo.sub && o.jsx("span", {
                        style: {
                          fontSize: "10.5px",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)"
                        },
                        children: stockInfo.sub
                      })
                    ]
                  }),

                  // Valuation, Unit Price & Due Date Metadata
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" },
                    children: [
                      o.jsxs("span", {
                        style: { color: "var(--text-secondary)", fontFamily: "var(--font-mono)" },
                        children: [
                          "Valuation: ",
                          o.jsx("strong", { style: { color: "#38bdf8" }, children: \`Tsh \${itemValuation.toLocaleString()}\` })
                        ]
                      }),
                      (m.purchasePrice > 0) && o.jsxs("span", {
                        style: { color: "var(--text-muted)" },
                        children: [
                          "@ Tsh ", m.purchasePrice.toLocaleString(), "/", (m.purchaseUnit ? m.purchaseUnit.split(" ")[0] : m.unit)
                        ]
                      }),
                      m.dueDate && o.jsxs("span", {
                        style: {
                          fontSize: "10px",
                          fontWeight: 600,
                          padding: "1px 5px",
                          borderRadius: "3px",
                          background: "rgba(59, 130, 246, 0.1)",
                          color: "#93c5fd",
                          border: "1px solid rgba(59, 130, 246, 0.2)"
                        },
                        children: ["📅 Due: ", m.dueDate]
                      })
                    ]
                  })
                ]
              })
            ]
          }, m.key);
        })
      }),

      // MODAL 1: BATCH BASELINE SETUP MODAL (All materials sorted with Cement # 1, with Due Date)
      baselineModalOpen && o.jsx("div", {
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.75)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        },
        children: o.jsxs("div", {
          className: "card-elevated",
          style: {
            background: "var(--bg-surface)",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.15)",
            width: "100%",
            maxWidth: "760px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
          },
          children: [
            // Modal Header
            o.jsxs("div", {
              style: {
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255,255,255,0.02)"
              },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsxs("h3", {
                      style: { margin: 0, fontSize: "14.5px", fontWeight: 800, color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px" },
                      children: [
                        o.jsx("span", { children: "🎯" }),
                        "Initial Material Baseline & Due Dates"
                      ]
                    }),
                    o.jsx("p", {
                      style: { margin: "2px 0 0 0", fontSize: "11px", color: "var(--text-muted)" },
                      children: "Set physical count units, prices and due dates for quantity added (Cement arranged as # 1 material)"
                    })
                  ]
                }),
                o.jsx("button", {
                  type: "button",
                  onClick: () => setBaselineModalOpen(false),
                  className: "btn btn-ghost btn-sm",
                  style: { color: "var(--text-muted)", fontSize: "16px", padding: "2px 6px" },
                  children: "✕"
                })
              ]
            }),

            // Global Due Date & Baseline Date Strip
            o.jsxs("div", {
              style: {
                padding: "8px 16px",
                background: "rgba(59, 130, 246, 0.08)",
                borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px"
              },
              children: [
                o.jsxs("div", {
                  style: { display: "flex", alignItems: "center", gap: "8px" },
                  children: [
                    o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "#93c5fd" }, children: "Baseline Date:" }),
                    o.jsx("input", {
                      type: "date",
                      value: baselineDate,
                      onChange: e => setBaselineDate(e.target.value),
                      style: { background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.15)", color: "#f8fafc", padding: "3px 7px", borderRadius: "4px", fontSize: "11.5px" }
                    })
                  ]
                }),
                o.jsxs("div", {
                  style: { display: "flex", alignItems: "center", gap: "8px" },
                  children: [
                    o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "#93c5fd" }, children: "📅 Default Due Date for Added Qty:" }),
                    o.jsx("input", {
                      type: "date",
                      value: baselineGlobalDueDate,
                      onChange: e => {
                        const newDue = e.target.value;
                        setBaselineGlobalDueDate(newDue);
                        setBaselineData(prev => {
                          const updated = { ...prev };
                          Object.keys(updated).forEach(k => {
                            updated[k] = { ...updated[k], dueDate: newDue };
                          });
                          return updated;
                        });
                      },
                      style: { background: "var(--bg-surface)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#f8fafc", padding: "3px 7px", borderRadius: "4px", fontSize: "11.5px" }
                    })
                  ]
                })
              ]
            }),

            // Modal Body: Scrollable Material Rows (Cement at top)
            o.jsx("div", {
              style: { padding: "12px 16px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "8px" },
              children: allMaterialsCementFirst.map((m, idx) => {
                const entry = baselineData[m.key] || { qty: "", price: "", source: "", dueDate: baselineGlobalDueDate };
                const isTrip = m.purchaseUnit && m.purchaseUnit.includes("Trip");
                const isCement = isCementMaterial(m);
                
                let cementRank = 1;
                if (isCement) {
                  const cementPreceding = allMaterialsCementFirst.slice(0, idx).filter(isCementMaterial).length;
                  cementRank = cementPreceding + 1;
                }
                const rowBadgeText = isCement 
                  ? (cementRank === 1 ? "# 1 Material" : \`# 1-\${String.fromCharCode(64 + cementRank)} Material\`)
                  : \`# \${idx + 1}\`;

                return o.jsxs("div", {
                  style: {
                    background: "var(--bg-surface-elevated)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    border: isCement ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(255, 255, 255, 0.06)",
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
                            o.jsx("span", {
                              style: {
                                fontSize: "10px",
                                fontWeight: 800,
                                background: isCement ? "rgba(59, 130, 246, 0.25)" : "rgba(255, 255, 255, 0.06)",
                                color: isCement ? "#93c5fd" : "var(--text-muted)",
                                padding: "1px 6px",
                                borderRadius: "3px"
                              },
                              children: rowBadgeText
                            }),
                            o.jsx("strong", { style: { fontSize: "13px", color: "#f8fafc" }, children: m.name }),
                            o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)" }, children: \`(\${m.category})\` })
                          ]
                        }),
                        o.jsx("span", { style: { fontSize: "10.5px", color: "#93c5fd", fontWeight: 600 }, children: m.purchaseUnit })
                      ]
                    }),

                    // 4 Columns: Qty, Price, Supplier, Due Date for quantity added
                    o.jsxs("div", {
                      style: { display: "grid", gridTemplateColumns: "1fr 1fr 1.1fr 1.1fr", gap: "8px" },
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
                        }),

                        // Due Date for Quantity Added
                        o.jsxs("div", {
                          children: [
                            o.jsx("label", { style: { fontSize: "10px", color: "#93c5fd", fontWeight: 700, display: "block", marginBottom: "2px" }, children: "Due / Target Date" }),
                            o.jsx("input", {
                              type: "date",
                              value: entry.dueDate || baselineGlobalDueDate,
                              onChange: e => {
                                const val = e.target.value;
                                setBaselineData(prev => ({
                                  ...prev,
                                  [m.key]: { ...(prev[m.key] || {}), dueDate: val }
                                }));
                              },
                              style: { width: "100%", padding: "6px 8px", background: "var(--bg-surface)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "4px", color: "#f8fafc", fontSize: "11px" }
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }, m.key);
              })
            }),

            // Modal Footer
            o.jsxs("div", {
              style: {
                padding: "10px 16px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255,255,255,0.02)"
              },
              children: [
                o.jsx("button", {
                  type: "button",
                  onClick: () => setBaselineModalOpen(false),
                  className: "btn btn-ghost btn-sm",
                  style: { color: "var(--text-muted)" },
                  children: "Cancel"
                }),
                o.jsxs("button", {
                  type: "button",
                  onClick: handleSaveFullBaseline,
                  className: "btn btn-primary btn-sm",
                  style: { fontWeight: 700, padding: "7px 16px" },
                  children: ["✓ Save Baseline & Due Dates"]
                })
              ]
            })
          ]
        })
      }),

      // MODAL 2: INTAKE TRIP / RESTOCK MODAL
      intakeModalOpen && activeIntakeMat && o.jsx("div", {
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.75)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        },
        children: o.jsxs("div", {
          className: "card-elevated",
          style: {
            background: "var(--bg-surface)",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.15)",
            width: "100%",
            maxWidth: "500px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
          },
          children: [
            // Modal Header
            o.jsxs("div", {
              style: {
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsxs("h3", {
                      style: { margin: 0, fontSize: "14px", fontWeight: 800, color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px" },
                      children: [
                        o.jsx("span", { children: "📥" }),
                        "Record Intake Trip / Delivery"
                      ]
                    }),
                    o.jsx("span", {
                      style: { fontSize: "11px", color: "var(--text-muted)" },
                      children: \`Restock: \${activeIntakeMat.name} (\${activeIntakeMat.category})\`
                    })
                  ]
                }),
                o.jsx("button", {
                  type: "button",
                  onClick: () => setIntakeModalOpen(false),
                  className: "btn btn-ghost btn-sm",
                  style: { color: "var(--text-muted)", fontSize: "16px", padding: "2px 6px" },
                  children: "✕"
                })
              ]
            }),

            // Form
            o.jsxs("form", {
              onSubmit: handleSaveIntake,
              style: { padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" },
              children: [
                // Material Selector
                o.jsxs("div", {
                  children: [
                    o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Select Material" }),
                    o.jsx("select", {
                      value: intakeKey,
                      onChange: e => {
                        const newKey = e.target.value;
                        const mat = materials.find(m => m.key === newKey);
                        setIntakeKey(newKey);
                        if (mat) {
                          setIntakeUnitPrice(mat.purchasePrice ? String(mat.purchasePrice) : "");
                          setIntakeSource(mat.source || "");
                          const q = parseFloat(intakeQty) || 0;
                          const p = mat.purchasePrice || 0;
                          if (q > 0 && p > 0) setIntakeTotalCost((q * p).toFixed(0));
                        }
                      },
                      style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12px" },
                      children: allMaterialsCementFirst.map(m => o.jsx("option", { value: m.key, children: \`\${isCementMaterial(m) ? '⭐ ' : ''}\${m.name} (\${m.purchaseUnit || m.unit})\` }, m.key))
                    })
                  ]
                }),

                // Date & Delivery Ref
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Intake Date" }),
                        o.jsx("input", {
                          type: "date",
                          value: intakeDate,
                          onChange: e => setIntakeDate(e.target.value),
                          style: { width: "100%", padding: "6px 8px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#f8fafc", fontSize: "12px" }
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Delivery / Invoice Ref" }),
                        o.jsx("input", {
                          type: "text",
                          value: intakeDeliveryRef,
                          onChange: e => setIntakeDeliveryRef(e.target.value),
                          placeholder: "e.g. TRK-084 / INV-209",
                          style: { width: "100%", padding: "6px 8px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#f8fafc", fontSize: "12px" }
                        })
                      ]
                    })
                  ]
                }),

                // Quantity & Unit Mode
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsxs("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: ["Intake Quantity (", intakeUnitMode === "purchase" ? activeIntakeMat.purchaseUnit : activeIntakeMat.unit, ")"] }),
                        o.jsx("input", {
                          type: "number",
                          step: "any",
                          min: "0.01",
                          required: true,
                          value: intakeQty,
                          onChange: e => handleIntakeQtyChange(e.target.value),
                          placeholder: activeIntakeMat.purchaseUnit && activeIntakeMat.purchaseUnit.includes("Trip") ? "e.g. 2 Trips" : "e.g. 100",
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-mono)" }
                        })
                      ]
                    }),
                    activeIntakeMat.unitRatio > 1 && o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Entry Unit" }),
                        o.jsxs("select", {
                          value: intakeUnitMode,
                          onChange: e => setIntakeUnitMode(e.target.value),
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "11.5px" },
                          children: [
                            o.jsx("option", { value: "purchase", children: \`Purchase: \${activeIntakeMat.purchaseUnit}\` }),
                            o.jsx("option", { value: "inventory", children: \`Inventory: \${activeIntakeMat.unit}\` })
                          ]
                        })
                      ]
                    })
                  ]
                }),

                // Pricing
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsxs("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: ["Unit Cost (Tsh/", activeIntakeMat.purchaseUnit ? activeIntakeMat.purchaseUnit.split(" ")[0] : activeIntakeMat.unit, ")"] }),
                        o.jsx("input", {
                          type: "number",
                          step: "any",
                          value: intakeUnitPrice,
                          onChange: e => handleIntakePriceChange(e.target.value),
                          placeholder: "e.g. 240000",
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12px", fontFamily: "var(--font-mono)" }
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Total Cost (Tsh)" }),
                        o.jsx("input", {
                          type: "number",
                          step: "any",
                          value: intakeTotalCost,
                          onChange: e => handleIntakeTotalCostChange(e.target.value),
                          placeholder: "e.g. 480000",
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#38bdf8", fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-mono)" }
                        })
                      ]
                    })
                  ]
                }),

                // Supplier & Note
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Supplier / Origin" }),
                        o.jsx("input", {
                          type: "text",
                          value: intakeSource,
                          onChange: e => setIntakeSource(e.target.value),
                          placeholder: "e.g. Msanga",
                          style: { width: "100%", padding: "6px 8px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#f8fafc", fontSize: "12px" }
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Notes / Truck #" }),
                        o.jsx("input", {
                          type: "text",
                          value: intakeNote,
                          onChange: e => setIntakeNote(e.target.value),
                          placeholder: "e.g. Scania T102-DKA",
                          style: { width: "100%", padding: "6px 8px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#f8fafc", fontSize: "12px" }
                        })
                      ]
                    })
                  ]
                }),

                // Modal Footer
                o.jsxs("div", {
                  style: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "6px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.08)" },
                  children: [
                    o.jsx("button", {
                      type: "button",
                      onClick: () => setIntakeModalOpen(false),
                      className: "btn btn-ghost btn-sm",
                      style: { color: "var(--text-muted)" },
                      children: "Cancel"
                    }),
                    o.jsx("button", {
                      type: "submit",
                      className: "btn btn-primary btn-sm",
                      style: { fontWeight: 700, padding: "7px 16px" },
                      children: "✓ Record Intake Trip"
                    })
                  ]
                })
              ]
            })
          ]
        })
      }),

      // MODAL 3: ADD NEW MATERIAL MODAL
      addModalOpen && o.jsx("div", {
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.75)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        },
        children: o.jsxs("div", {
          className: "card-elevated",
          style: {
            background: "var(--bg-surface)",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.15)",
            width: "100%",
            maxWidth: "520px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
          },
          children: [
            // Modal Header
            o.jsxs("div", {
              style: {
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsxs("h3", {
                      style: { margin: 0, fontSize: "14px", fontWeight: 800, color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px" },
                      children: [
                        o.jsx("span", { children: "➕" }),
                        "Add New Raw Material"
                      ]
                    }),
                    o.jsx("span", {
                      style: { fontSize: "11px", color: "var(--text-muted)" },
                      children: "Add a new material (e.g. second cement type, aggregate, pigment, additive)"
                    })
                  ]
                }),
                o.jsx("button", {
                  type: "button",
                  onClick: () => setAddModalOpen(false),
                  className: "btn btn-ghost btn-sm",
                  style: { color: "var(--text-muted)", fontSize: "16px", padding: "2px 6px" },
                  children: "✕"
                })
              ]
            }),

            // Form
            o.jsxs("form", {
              onSubmit: handleAddNewMaterial,
              style: { padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" },
              children: [
                // Name
                o.jsxs("div", {
                  children: [
                    o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Material Name *" }),
                    o.jsx("input", {
                      type: "text",
                      required: true,
                      value: newMatName,
                      onChange: e => setNewMatName(e.target.value),
                      placeholder: "e.g. Cement Twiga Extra 42.5R",
                      style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12px" }
                    })
                  ]
                }),

                // Category (Cement is first option)
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

                // Initial Baseline Qty, Price, Due Date
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Initial Qty" }),
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
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }, children: "Price (Tsh)" }),
                        o.jsx("input", {
                          type: "number",
                          step: "any",
                          value: newMatInitialPrice,
                          onChange: e => setNewMatInitialPrice(e.target.value),
                          placeholder: "0",
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#f8fafc", fontSize: "12px", fontFamily: "var(--font-mono)" }
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", fontWeight: 700, color: "#93c5fd", display: "block", marginBottom: "3px" }, children: "📅 Due Date" }),
                        o.jsx("input", {
                          type: "date",
                          value: newMatDueDate,
                          onChange: e => setNewMatDueDate(e.target.value),
                          style: { width: "100%", padding: "7px 9px", background: "var(--bg-surface)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "5px", color: "#f8fafc", fontSize: "11.5px" }
                        })
                      ]
                    })
                  ]
                }),

                // Modal Footer
                o.jsxs("div", {
                  style: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "6px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.08)" },
                  children: [
                    o.jsx("button", {
                      type: "button",
                      onClick: () => setAddModalOpen(false),
                      className: "btn btn-ghost btn-sm",
                      style: { color: "var(--text-muted)" },
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
