const fs = require('fs');
const { execSync } = require('child_process');

console.log('Writing updated RawMaterialMasterView...');
const bundlePath = 'assets/index-hgjhj-0G.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');

const startMarker = 'RawMaterialMasterView = ({ rawMaterials: materials';
const startIdx = bundle.indexOf(startMarker);
const endMarker = 'x1=({onNavigate:s})=>';
const endIdx = bundle.indexOf(endMarker, startIdx);

if (startIdx === -1 || endIdx === -1) {
  throw new Error('Could not find RawMaterialMasterView bounds');
}

const newComponent = `RawMaterialMasterView = ({ rawMaterials: materials, addRawMaterialStock, updateRawMaterialMaster, addRawMaterial, removeRawMaterial, resetAllRawMaterialsToZero, onNavigate, staffName }) => {
  const [searchTerm, setSearchTerm] = B.useState("");
  const [selectedCategory, setSelectedCategory] = B.useState("All");
  const [viewMode, setViewMode] = B.useState("cards"); // "cards" or "table"
  
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

  // Direct Edit Price & Qty Modal State
  const [editModalOpen, setEditModalOpen] = B.useState(false);
  const [editingItem, setEditingItem] = B.useState(null);
  const [editQty, setEditQty] = B.useState("");
  const [editPrice, setEditPrice] = B.useState("");
  const [editSource, setEditSource] = B.useState("");
  const [editReorder, setEditReorder] = B.useState("");

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

  const lowStockItems = B.useMemo(() => {
    return materials.filter(m => (m.currentBalance || 0) <= (m.reorderLevel || 0));
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
        subDetail: \`\${(m.currentBalance || 0).toLocaleString()} ndoo for prod\`
      };
    } else if (ratio > 1) {
      const pkgVal = (m.currentBalance || 0) / ratio;
      const pkgStr = pkgVal % 1 === 0 ? pkgVal.toString() : pkgVal.toFixed(2);
      return {
        mainDisplay: \`\${pkgStr} \${m.displayUnit || m.purchaseUnit}\`,
        subDetail: \`\${(m.currentBalance || 0).toLocaleString()} \${m.unit} for prod\`
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
      message: \`\${editingItem.name}: \${inputQty} \${isTrip ? "Trips" : editingItem.unit}, Tsh \${newPrice.toLocaleString()}\`
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
      title: "Intake Recorded",
      message: \`+\${rawQty} \${isTrip ? "Trips" : activeIntakeMat.purchaseUnit} \${activeIntakeMat.name} (Tsh \${totalCostNum.toLocaleString()})\`
    });

    setIntakeModalOpen(false);
    setIntakeQty("");
    setIntakeTotalCost("");
    setIntakeDeliveryRef("");
    setIntakeNote("");
  };

  // Add New Material
  const handleAddNewMaterialSubmit = (e) => {
    e.preventDefault();
    if (!newMatName.trim()) {
      alert("Please enter material name");
      return;
    }
    const cat = newMatCategory === "Other" && newMatCustomCategory.trim() ? newMatCustomCategory.trim() : newMatCategory;
    const isTrip = newMatPurchaseUnit.includes("Trip");
    const ratio = isTrip ? 2500 : (Number(newMatUnitRatio) || 1);
    const initialQtyNum = (parseFloat(newMatInitialQty) || 0) * (isTrip ? ratio : 1);
    const initialPriceNum = parseFloat(newMatInitialPrice) || 0;

    const added = addRawMaterial({
      name: newMatName.trim(),
      category: cat,
      source: newMatSource.trim() || "Local Supplier",
      purchaseUnit: newMatPurchaseUnit,
      unit: newMatUnit,
      unitRatio: ratio,
      currentBalance: initialQtyNum,
      purchasePrice: initialPriceNum,
      reorderLevel: parseFloat(newMatReorder) || 0
    });

    setToast({
      title: "Material Added",
      message: \`Added "\${newMatName.trim()}" to Material Master\`
    });

    setAddModalOpen(false);
    setNewMatName("");
    setNewMatSource("");
    setNewMatInitialQty("0");
    setNewMatInitialPrice("0");
  };

  // Remove Material
  const handleRemove = (item) => {
    if (window.confirm(\`Are you sure you want to remove "\${item.name}" from the Material Master?\`)) {
      if (removeRawMaterial) {
        removeRawMaterial(item.key);
      }
      setToast({
        title: "Material Removed",
        message: \`Removed "\${item.name}"\`
      });
      if (editModalOpen) setEditModalOpen(false);
    }
  };

  // Reset to Zero
  const handleResetToZero = () => {
    if (window.confirm("Reset all material quantities and prices to 0 for real-user testing?")) {
      if (resetAllRawMaterialsToZero) {
        resetAllRawMaterialsToZero();
      }
      setToast({
        title: "Reset to Zero",
        message: "All material stock counts and prices reset to 0."
      });
    }
  };

  return o.jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: "10px", width: "100%" },
    children: [
      
      // Toast notification
      toast && o.jsxs("div", {
        style: {
          position: "fixed",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          background: "#0f172a",
          color: "#f8fafc",
          padding: "8px 14px",
          borderRadius: "6px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          maxWidth: "90vw"
        },
        children: [
          o.jsx("span", { style: { color: "var(--brand-400)", fontSize: "14px" }, children: "✓" }),
          o.jsxs("div", {
            children: [
              o.jsx("strong", { style: { display: "block", fontSize: "12px" }, children: toast.title }),
              o.jsx("span", { style: { fontSize: "11px", color: "#cbd5e1" }, children: toast.message })
            ]
          })
        ]
      }),

      // Top Action Bar
      o.jsxs("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" },
        children: [
          o.jsxs("div", {
            children: [
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", gap: "6px" },
                children: [
                  o.jsx("h2", { style: { fontSize: "16px", fontWeight: 800, color: "#f8fafc", margin: 0 }, children: "Material Master" }),
                  o.jsxs("span", {
                    style: { fontSize: "10.5px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1" },
                    children: [materials.length, " items"]
                  })
                ]
              }),
              o.jsx("p", { style: { fontSize: "11px", color: "var(--text-muted)", margin: "1px 0 0 0" }, children: "Live stock in Trips, prices & master management" })
            ]
          }),
          
          // Action Buttons: Add Material, Reset to 0, View Ledger
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" },
            children: [
              o.jsxs("button", {
                type: "button",
                onClick: () => setAddModalOpen(true),
                className: "btn btn-secondary btn-sm",
                style: { padding: "6px 10px", fontSize: "11.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" },
                children: [
                  o.jsx(t1, { size: 13 }),
                  o.jsx("span", { children: "+ Add Material" })
                ]
              }),
              o.jsxs("button", {
                type: "button",
                onClick: () => {
                  const target = materials[0];
                  openIntakeFor(target);
                },
                className: "btn btn-primary btn-sm",
                style: { padding: "6px 12px", fontSize: "11.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" },
                children: [
                  o.jsx(pc, { size: 13 }),
                  o.jsx("span", { children: "+ Daily Intake" })
                ]
              }),
              o.jsxs("button", {
                type: "button",
                onClick: handleResetToZero,
                className: "btn btn-ghost btn-sm",
                style: { padding: "6px 8px", fontSize: "11px", color: "var(--text-muted)" },
                title: "Reset all quantities and prices to zero for test",
                children: [
                  o.jsx("span", { children: "🔄 0 Qty/Price" })
                ]
              }),
              // View mode toggle
              o.jsxs("div", {
                style: { display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: "6px", padding: "2px" },
                children: [
                  o.jsx("button", {
                    type: "button",
                    onClick: () => setViewMode("cards"),
                    style: {
                      padding: "4px 8px",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "11px",
                      cursor: "pointer",
                      background: viewMode === "cards" ? "rgba(255,255,255,0.15)" : "transparent",
                      color: viewMode === "cards" ? "#fff" : "var(--text-muted)"
                    },
                    title: "Compact Cards Grid",
                    children: "🗂️ Cards"
                  }),
                  o.jsx("button", {
                    type: "button",
                    onClick: () => setViewMode("table"),
                    style: {
                      padding: "4px 8px",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "11px",
                      cursor: "pointer",
                      background: viewMode === "table" ? "rgba(255,255,255,0.15)" : "transparent",
                      color: viewMode === "table" ? "#fff" : "var(--text-muted)"
                    },
                    title: "Compact Full Table",
                    children: "📋 Table"
                  })
                ]
              })
            ]
          })
        ]
      }),

      // Compact KPI Summary Bar
      o.jsxs("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "6px",
          background: "var(--bg-surface-elevated)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "8px",
          padding: "8px 12px"
        },
        children: [
          o.jsxs("div", {
            children: [
              o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }, children: "Stock Valuation" }),
              o.jsxs("div", {
                style: { fontSize: "14px", fontWeight: 800, color: "#f8fafc", fontFamily: "var(--font-mono)" },
                children: ["Tsh ", Math.round(totalValuation).toLocaleString()]
              })
            ]
          }),
          o.jsxs("div", {
            style: { borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: "10px" },
            children: [
              o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }, children: "Materials" }),
              o.jsxs("div", {
                style: { fontSize: "14px", fontWeight: 800, color: "#f8fafc" },
                children: [materials.length, " ", o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)" }, children: "tracked" })]
              })
            ]
          }),
          o.jsxs("div", {
            style: { borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: "10px" },
            children: [
              o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }, children: "Safety Status" }),
              o.jsx("div", {
                style: { fontSize: "14px", fontWeight: 800, color: lowStockItems.length > 0 ? "#fbbf24" : "#f8fafc" },
                children: lowStockItems.length > 0 ? \`\${lowStockItems.length} Low\` : "Healthy"
              })
            ]
          })
        ]
      }),

      // Search & Category Filters Row
      o.jsxs("div", {
        style: { display: "flex", flexDirection: "column", gap: "6px" },
        children: [
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "0 8px" },
            children: [
              o.jsx(ii, { size: 13, color: "var(--text-muted)" }),
              o.jsx("input", {
                type: "text",
                value: searchTerm,
                onChange: e => setSearchTerm(e.target.value),
                placeholder: "Search material, category or source...",
                style: { border: "none", background: "transparent", padding: "7px 6px", fontSize: "12px", color: "#f8fafc", width: "100%", outline: "none" }
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
            style: { display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "2px" },
            children: categories.map(cat => {
              const count = cat === "All" ? materials.length : materials.filter(m => m.category === cat).length;
              const isActive = selectedCategory === cat;
              return o.jsxs("button", {
                type: "button",
                onClick: () => setSelectedCategory(cat),
                style: {
                  padding: "3px 8px",
                  borderRadius: "4px",
                  border: isActive ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.07)",
                  background: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  fontSize: "10.5px",
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

      // TABLE VIEW (When toggled to table, shows all materials in a compact screen-friendly view)
      viewMode === "table" && o.jsx("div", {
        style: { overflowX: "auto", background: "var(--bg-surface-elevated)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" },
        children: o.jsxs("table", {
          style: { width: "100%", borderCollapse: "collapse", fontSize: "11.5px", textAlign: "left" },
          children: [
            o.jsx("thead", {
              children: o.jsxs("tr", {
                style: { borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", color: "var(--text-muted)" },
                children: [
                  o.jsx("th", { style: { padding: "8px 10px", width: "40px" }, children: "#" }),
                  o.jsx("th", { style: { padding: "8px 10px" }, children: "Material" }),
                  o.jsx("th", { style: { padding: "8px 10px" }, children: "Category" }),
                  o.jsx("th", { style: { padding: "8px 10px" }, children: "Stock Count (Trips)" }),
                  o.jsx("th", { style: { padding: "8px 10px" }, children: "Purchase Price" }),
                  o.jsx("th", { style: { padding: "8px 10px" }, children: "Source" }),
                  o.jsx("th", { style: { padding: "8px 10px", textAlign: "right" }, children: "Actions" })
                ]
              })
            }),
            o.jsx("tbody", {
              children: filteredMaterials.map(m => {
                const stockInfo = formatStock(m);
                return o.jsxs("tr", {
                  style: { borderBottom: "1px solid rgba(255,255,255,0.05)" },
                  children: [
                    o.jsx("td", { style: { padding: "8px 10px", color: "var(--text-muted)", fontWeight: 700 }, children: m.no || "-" }),
                    o.jsxs("td", {
                      style: { padding: "8px 10px" },
                      children: [
                        o.jsx("strong", { style: { color: "#f8fafc", display: "block" }, children: m.name }),
                        m.source && o.jsxs("span", { style: { fontSize: "10px", color: "var(--text-muted)" }, children: ["📍 ", m.source] })
                      ]
                    }),
                    o.jsx("td", { style: { padding: "8px 10px" }, children: o.jsx("span", { style: { fontSize: "10px", padding: "1px 5px", borderRadius: "3px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1" }, children: m.category }) }),
                    o.jsxs("td", {
                      style: { padding: "8px 10px" },
                      children: [
                        o.jsx("span", { style: { fontWeight: 800, color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: stockInfo.mainDisplay }),
                        stockInfo.subDetail ? o.jsx("span", { style: { display: "block", fontSize: "10px", color: "var(--text-muted)" }, children: stockInfo.subDetail }) : null
                      ]
                    }),
                    o.jsxs("td", {
                      style: { padding: "8px 10px", fontFamily: "var(--font-mono)" },
                      children: [
                        "Tsh ", (m.purchasePrice || 0).toLocaleString(),
                        o.jsx("span", { style: { fontSize: "9.5px", color: "var(--text-muted)", display: "block" }, children: \`/\${m.purchaseUnit}\` })
                      ]
                    }),
                    o.jsx("td", { style: { padding: "8px 10px", color: "#cbd5e1" }, children: m.source || "-" }),
                    o.jsxs("td", {
                      style: { padding: "8px 10px", textAlign: "right" },
                      children: [
                        o.jsxs("div", {
                          style: { display: "flex", justifyContent: "flex-end", gap: "4px" },
                          children: [
                            o.jsx("button", {
                              type: "button",
                              onClick: () => openEditFor(m),
                              className: "btn btn-secondary btn-sm",
                              style: { padding: "3px 6px", fontSize: "10.5px" },
                              children: "✏️"
                            }),
                            o.jsx("button", {
                              type: "button",
                              onClick: () => openIntakeFor(m),
                              className: "btn btn-primary btn-sm",
                              style: { padding: "3px 6px", fontSize: "10.5px" },
                              children: "+ Intake"
                            }),
                            o.jsx("button", {
                              type: "button",
                              onClick: () => handleRemove(m),
                              className: "btn btn-ghost btn-sm",
                              style: { padding: "3px 6px", fontSize: "11px", color: "#f87171" },
                              title: "Remove Material",
                              children: "🗑️"
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }, m.key);
              })
            })
          ]
        })
      }),

      // NARROW CARDS GRID (Narrow card width, multiple cards per row, no empty whitespace!)
      viewMode === "cards" && o.jsx("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: "8px",
          width: "100%"
        },
        children: filteredMaterials.map(m => {
          const isLow = (m.currentBalance || 0) <= (m.reorderLevel || 0);
          const ratio = m.unitRatio || 1;
          const effPrice = (m.purchasePrice || 0) / ratio;
          const itemValuation = Math.round((m.currentBalance || 0) * effPrice);
          const stockInfo = formatStock(m);

          return o.jsxs("div", {
            className: "card-elevated",
            style: {
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "8px",
              background: "var(--bg-surface-elevated)",
              border: isLow ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px"
            },
            children: [
              
              // Top Row: No, Category, Delete Button
              o.jsxs("div", {
                children: [
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" },
                    children: [
                      o.jsxs("div", {
                        style: { display: "flex", alignItems: "center", gap: "4px" },
                        children: [
                          o.jsxs("span", {
                            style: { fontSize: "10px", fontWeight: 800, background: "rgba(255, 255, 255, 0.06)", color: "#cbd5e1", padding: "1px 4px", borderRadius: "3px" },
                            children: ["#", m.no || "-"]
                          }),
                          o.jsx("span", {
                            style: { fontSize: "10px", fontWeight: 600, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#cbd5e1", padding: "1px 5px", borderRadius: "3px" },
                            children: m.category
                          })
                        ]
                      }),
                      // Quick remove button
                      o.jsx("button", {
                        type: "button",
                        onClick: () => handleRemove(m),
                        style: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "12px", padding: "0 2px" },
                        title: "Remove " + m.name,
                        children: "🗑️"
                      })
                    ]
                  }),

                  // Name
                  o.jsx("h3", {
                    style: { fontSize: "13.5px", fontWeight: 800, color: "#f8fafc", margin: "2px 0 0 0", lineHeight: 1.2 },
                    children: m.name
                  }),

                  // Source
                  m.source && o.jsxs("div", {
                    style: { fontSize: "10.5px", color: "var(--text-muted)", marginTop: "1px" },
                    children: ["📍 ", m.source]
                  })
                ]
              }),

              // Stock Count & Price Box (Compact)
              o.jsxs("div", {
                style: {
                  background: "var(--bg-surface)",
                  borderRadius: "6px",
                  padding: "7px 9px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                },
                children: [
                  // Stock in Trips
                  o.jsxs("div", {
                    children: [
                      o.jsx("span", { style: { fontSize: "9.5px", color: "var(--text-muted)", display: "block" }, children: "Stock Count" }),
                      o.jsx("div", {
                        style: { fontSize: "16px", fontWeight: 800, color: "#f8fafc", fontFamily: "var(--font-mono)" },
                        children: stockInfo.mainDisplay
                      }),
                      stockInfo.subDetail ? o.jsx("div", {
                        style: { fontSize: "10px", color: "var(--text-muted)" },
                        children: stockInfo.subDetail
                      }) : null
                    ]
                  }),

                  // Price
                  o.jsxs("div", {
                    style: { borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "baseline" },
                    children: [
                      o.jsx("span", { style: { fontSize: "9.5px", color: "var(--text-muted)" }, children: "Price:" }),
                      o.jsxs("span", { style: { fontSize: "11.5px", fontWeight: 700, color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: ["Tsh ", (m.purchasePrice || 0).toLocaleString(), o.jsx("span", { style: { fontSize: "9.5px", color: "var(--text-muted)" }, children: \`/\${m.purchaseUnit}\` })] })
                    ]
                  })
                ]
              }),

              // Card Bottom: Quick Actions
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" },
                children: [
                  o.jsxs("span", { style: { fontSize: "10px", color: "var(--text-muted)" }, children: ["Val: ", o.jsxs("strong", { style: { color: "#f8fafc" }, children: ["Tsh ", itemValuation.toLocaleString()] })] }),
                  o.jsxs("div", {
                    style: { display: "flex", gap: "4px" },
                    children: [
                      o.jsx("button", {
                        type: "button",
                        onClick: () => openEditFor(m),
                        className: "btn btn-secondary btn-sm",
                        style: { padding: "3px 6px", fontSize: "10.5px" },
                        children: "✏️ Edit"
                      }),
                      o.jsx("button", {
                        type: "button",
                        onClick: () => openIntakeFor(m),
                        className: "btn btn-primary btn-sm",
                        style: { padding: "3px 6px", fontSize: "10.5px" },
                        children: "+ Intake"
                      })
                    ]
                  })
                ]
              })
            ]
          }, m.key);
        })
      }),

      // Add New Material Modal
      addModalOpen && o.jsx("div", {
        className: "modal-overlay",
        onClick: () => setAddModalOpen(false),
        children: o.jsxs("div", {
          className: "modal-content",
          onClick: e => e.stopPropagation(),
          style: { padding: "18px", maxWidth: "440px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)" },
          children: [
            o.jsxs("div", {
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsx("h3", { style: { fontSize: "16px", fontWeight: 800, margin: 0, color: "#f8fafc" }, children: "Add New Material" }),
                    o.jsx("p", { style: { fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }, children: "Add another cement type, supplier variant, or site raw material" })
                  ]
                }),
                o.jsx("button", {
                  type: "button",
                  onClick: () => setAddModalOpen(false),
                  className: "btn btn-ghost btn-sm",
                  children: "✕"
                })
              ]
            }),

            o.jsxs("form", {
              onSubmit: handleAddNewMaterialSubmit,
              style: { display: "flex", flexDirection: "column", gap: "10px" },
              children: [
                // Material Name
                o.jsxs("div", {
                  children: [
                    o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Material Name *" }),
                    o.jsx("input", {
                      type: "text",
                      required: true,
                      value: newMatName,
                      onChange: e => setNewMatName(e.target.value),
                      className: "input-field",
                      placeholder: "e.g. Twiga Cement 42.5R, Dangote 32.5R, Mchanga Mweusi..."
                    })
                  ]
                }),

                // Category & Source Row
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Category" }),
                        o.jsxs("select", {
                          value: newMatCategory,
                          onChange: e => setNewMatCategory(e.target.value),
                          className: "input-field",
                          style: { fontSize: "12px" },
                          children: [
                            o.jsx("option", { value: "Cement", children: "Cement" }),
                            o.jsx("option", { value: "Mchanga (sand)", children: "Mchanga (sand)" }),
                            o.jsx("option", { value: "Dust", children: "Dust" }),
                            o.jsx("option", { value: "Chipping", children: "Chipping" }),
                            o.jsx("option", { value: "Kokoto / Aggregate", children: "Kokoto / Aggregate" }),
                            o.jsx("option", { value: "Chemical additive / hardener", children: "Chemical additive / hardener" }),
                            o.jsx("option", { value: "Rangi", children: "Rangi" }),
                            o.jsx("option", { value: "Mafuta/oil", children: "Mafuta/oil" }),
                            o.jsx("option", { value: "Steel", children: "Steel" }),
                            o.jsx("option", { value: "Other", children: "+ Other Category" })
                          ]
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Source / Supplier" }),
                        o.jsx("input", {
                          type: "text",
                          value: newMatSource,
                          onChange: e => setNewMatSource(e.target.value),
                          className: "input-field",
                          placeholder: "e.g. Twiga Plant, Dar..."
                        })
                      ]
                    })
                  ]
                }),

                newMatCategory === "Other" && o.jsxs("div", {
                  children: [
                    o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Custom Category Name" }),
                    o.jsx("input", {
                      type: "text",
                      value: newMatCustomCategory,
                      onChange: e => setNewMatCustomCategory(e.target.value),
                      className: "input-field",
                      placeholder: "Enter new category..."
                    })
                  ]
                }),

                // Units Row
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Delivery / Purchase Unit" }),
                        o.jsxs("select", {
                          value: newMatPurchaseUnit,
                          onChange: e => {
                            const val = e.target.value;
                            setNewMatPurchaseUnit(val);
                            if (val.includes("Trip")) {
                              setNewMatUnit("ndoo");
                              setNewMatUnitRatio("2500");
                            } else if (val.includes("Barrel")) {
                              setNewMatUnit("Liters");
                              setNewMatUnitRatio("200");
                            } else if (val.includes("Bags of 25kg")) {
                              setNewMatUnit("kg");
                              setNewMatUnitRatio("25");
                            } else if (val.includes("Dumu")) {
                              setNewMatUnit("Liters");
                              setNewMatUnitRatio("20");
                            } else if (val.includes("50 kg bags")) {
                              setNewMatUnit("bags");
                              setNewMatUnitRatio("1");
                            } else {
                              setNewMatUnit("pcs");
                              setNewMatUnitRatio("1");
                            }
                          },
                          className: "input-field",
                          style: { fontSize: "12px" },
                          children: [
                            o.jsx("option", { value: "50 kg bags", children: "50 kg bags (Cement)" }),
                            o.jsx("option", { value: "Trip (20 Cbm)", children: "Trip (20 Cbm = 2,500 ndoo)" }),
                            o.jsx("option", { value: "Barrel of 200L", children: "Barrel of 200L (Dawa)" }),
                            o.jsx("option", { value: "Bags of 25kg", children: "Bags of 25kg (Rangi)" }),
                            o.jsx("option", { value: "Dumu of 20L", children: "Dumu of 20L (Mafuta)" }),
                            o.jsx("option", { value: "Pcs / Bars (12m)", children: "Pcs / Bars (Steel)" }),
                            o.jsx("option", { value: "Units", children: "Individual Units" })
                          ]
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Usage Unit (Prod)" }),
                        o.jsx("input", {
                          type: "text",
                          value: newMatUnit,
                          onChange: e => setNewMatUnit(e.target.value),
                          className: "input-field",
                          placeholder: "e.g. ndoo, bags, Liters"
                        })
                      ]
                    })
                  ]
                }),

                // Initial Qty & Price Row (Default 0)
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Initial Stock" }),
                        o.jsx("input", {
                          type: "number",
                          step: "any",
                          min: "0",
                          value: newMatInitialQty,
                          onChange: e => setNewMatInitialQty(e.target.value),
                          className: "input-field mono",
                          placeholder: "0"
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Initial Price (Tsh)" }),
                        o.jsx("input", {
                          type: "number",
                          step: "any",
                          min: "0",
                          value: newMatInitialPrice,
                          onChange: e => setNewMatInitialPrice(e.target.value),
                          className: "input-field mono",
                          placeholder: "0"
                        })
                      ]
                    })
                  ]
                }),

                // Buttons
                o.jsxs("div", {
                  style: { display: "flex", gap: "6px", marginTop: "4px" },
                  children: [
                    o.jsx("button", {
                      type: "button",
                      onClick: () => setAddModalOpen(false),
                      className: "btn btn-secondary",
                      style: { flex: 1, padding: "8px" },
                      children: "Cancel"
                    }),
                    o.jsx("button", {
                      type: "submit",
                      className: "btn btn-primary",
                      style: { flex: 1.5, fontWeight: 700, padding: "8px" },
                      children: "Add to Material Master"
                    })
                  ]
                })
              ]
            })
          ]
        })
      }),

      // Direct Edit Modal (Price & Qty in Trips)
      editModalOpen && editingItem && o.jsx("div", {
        className: "modal-overlay",
        onClick: () => setEditModalOpen(false),
        children: o.jsxs("div", {
          className: "modal-content",
          onClick: e => e.stopPropagation(),
          style: { padding: "18px", maxWidth: "420px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)" },
          children: [
            o.jsxs("div", {
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsxs("h3", { style: { fontSize: "16px", fontWeight: 800, margin: 0, color: "#f8fafc" }, children: ["Edit: ", editingItem.name] }),
                    o.jsx("p", { style: { fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }, children: "Update stock count (Trips/Qty), purchase price and source" })
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
              style: { display: "flex", flexDirection: "column", gap: "10px" },
              children: [
                
                // Qty Input in Trips (or bags/bars)
                o.jsxs("div", {
                  children: [
                    o.jsxs("label", {
                      style: { fontSize: "11px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: "3px" },
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
                      style: { fontSize: "14px", fontWeight: 700 }
                    }),
                    editingItem.unitRatio && editingItem.unitRatio > 1 && o.jsxs("div", {
                      style: { fontSize: "10.5px", color: "var(--text-muted)", marginTop: "2px" },
                      children: ["= ", ((parseFloat(editQty) || 0) * editingItem.unitRatio).toLocaleString(), " ", editingItem.unit, " for production"]
                    })
                  ]
                }),

                // Purchase Price / Cost Input
                o.jsxs("div", {
                  children: [
                    o.jsxs("label", {
                      style: { fontSize: "11px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: "3px" },
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
                      style: { fontSize: "14px", fontWeight: 700 }
                    })
                  ]
                }),

                // Source Input
                o.jsxs("div", {
                  children: [
                    o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Source / Supplier" }),
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
                      style: { fontSize: "11px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: "3px" },
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

                // Actions: Remove Button & Save/Cancel
                o.jsxs("div", {
                  style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" },
                  children: [
                    o.jsxs("button", {
                      type: "button",
                      onClick: () => handleRemove(editingItem),
                      className: "btn btn-ghost btn-sm",
                      style: { color: "#f87171", fontSize: "11px" },
                      children: [
                        o.jsx("span", { children: "🗑️ Remove Material" })
                      ]
                    }),
                    o.jsxs("div", {
                      style: { display: "flex", gap: "6px" },
                      children: [
                        o.jsx("button", {
                          type: "button",
                          onClick: () => setEditModalOpen(false),
                          className: "btn btn-secondary btn-sm",
                          children: "Cancel"
                        }),
                        o.jsx("button", {
                          type: "submit",
                          className: "btn btn-primary btn-sm",
                          style: { fontWeight: 700 },
                          children: "Save Changes"
                        })
                      ]
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
          style: { padding: "18px", maxWidth: "440px", background: "var(--bg-surface-elevated)", border: "1px solid rgba(255,255,255,0.1)" },
          children: [
            o.jsxs("div", {
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsx("h3", { style: { fontSize: "16px", fontWeight: 800, margin: 0, color: "#f8fafc" }, children: "Record Material Intake" }),
                    o.jsx("p", { style: { fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }, children: "Insert daily deliveries, incoming prices & quantities" })
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
              style: { display: "flex", flexDirection: "column", gap: "10px" },
              children: [
                // Date & Material Selection
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Date" }),
                        o.jsx("input", {
                          type: "date",
                          required: true,
                          value: intakeDate,
                          onChange: e => setIntakeDate(e.target.value),
                          className: "input-field mono",
                          style: { fontSize: "12px" }
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Material" }),
                        o.jsx("select", {
                          value: intakeKey,
                          onChange: e => handleSelectIntakeMaterial(e.target.value),
                          className: "input-field",
                          style: { fontSize: "12px", fontWeight: 600 },
                          children: materials.map(m => o.jsxs("option", {
                            value: m.key,
                            children: [\`\${m.name} (\${m.category})\`]
                          }, m.key))
                        })
                      ]
                    })
                  ]
                }),

                // Mode toggle
                activeIntakeMat.unitRatio && activeIntakeMat.unitRatio > 1 && o.jsxs("div", {
                  style: { background: "var(--bg-input)", borderRadius: "6px", padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" },
                  children: [
                    o.jsxs("span", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: ["1 ", activeIntakeMat.purchaseUnit, " = ", activeIntakeMat.unitRatio.toLocaleString(), " ", activeIntakeMat.unit] }),
                    o.jsxs("div", {
                      style: { display: "flex", gap: "3px" },
                      children: [
                        o.jsx("button", {
                          type: "button",
                          onClick: () => setIntakeUnitMode("purchase"),
                          style: {
                            padding: "3px 6px",
                            borderRadius: "4px",
                            fontSize: "10.5px",
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
                            padding: "3px 6px",
                            borderRadius: "4px",
                            fontSize: "10.5px",
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

                // Qty Delivered
                o.jsxs("div", {
                  children: [
                    o.jsxs("label", {
                      style: { fontSize: "11px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: "3px" },
                      children: [
                        o.jsx("span", { children: "Quantity Delivered" }),
                        o.jsx("span", { style: { color: "var(--brand-400)", fontWeight: 700 }, children: intakeUnitMode === "purchase" ? (activeIntakeMat.purchaseUnit.includes("Trip") ? "Trips" : activeIntakeMat.purchaseUnit) : activeIntakeMat.unit })
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
                      style: { fontSize: "15px", fontWeight: 800 },
                      placeholder: intakeUnitMode === "purchase" ? "e.g. 1" : "e.g. 2500"
                    }),
                    intakeUnitMode === "purchase" && activeIntakeMat.unitRatio && activeIntakeMat.unitRatio > 1 && intakeQty ? o.jsxs("div", {
                      style: { fontSize: "10.5px", color: "var(--text-muted)", marginTop: "2px" },
                      children: ["= ", (parseFloat(intakeQty) * activeIntakeMat.unitRatio).toLocaleString(), " ", activeIntakeMat.unit, " for production"]
                    }) : null
                  ]
                }),

                // Price & Total Cost
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Price per unit (Tsh)" }),
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
                          style: { fontSize: "13px", fontWeight: 700 }
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Total Delivery Cost" }),
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
                          style: { fontSize: "13px", fontWeight: 700 }
                        })
                      ]
                    })
                  ]
                }),

                // Source & Ref
                o.jsxs("div", {
                  style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Source / Supplier" }),
                        o.jsx("input", {
                          type: "text",
                          value: intakeSource,
                          onChange: e => setIntakeSource(e.target.value),
                          className: "input-field"
                        })
                      ]
                    }),
                    o.jsxs("div", {
                      children: [
                        o.jsx("label", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }, children: "Truck / Ref" }),
                        o.jsx("input", {
                          type: "text",
                          value: intakeDeliveryRef,
                          onChange: e => setIntakeDeliveryRef(e.target.value),
                          className: "input-field",
                          placeholder: "e.g. T 823 DFP"
                        })
                      ]
                    })
                  ]
                }),

                // Submit
                o.jsxs("button", {
                  type: "submit",
                  className: "btn btn-primary btn-lg",
                  style: { marginTop: "4px", fontWeight: 800, padding: "9px" },
                  children: [
                    o.jsx(pn, { size: 15 }),
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

bundle = bundle.substring(0, startIdx) + newComponent + bundle.substring(endIdx);
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
    return "const CACHE_NAME = 'stumarcot-pwa-v2.0.0-" + nowTimestamp + "'";
  });
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('✓ Bumped service worker cache version to stumarcot-pwa-v2.0.0-' + nowTimestamp);
}

// Update index.html script tag cache buster
const htmlPath = 'index.html';
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/src="\.\/assets\/index-hgjhj-0G\.js[^"]*"/, 'src="./assets/index-hgjhj-0G.js?v=' + nowTimestamp + '"');
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('✓ Updated index.html with new cache buster timestamp');
}
