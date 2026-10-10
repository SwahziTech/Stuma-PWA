const fs = require('fs');
const vm = require('vm');

const k1NewCode = `k1=()=>{
  var T,N;
  const {movements:s, items:t, addMovement:r, staffName:a, rawMaterialMovements:c, rawMaterials:u, deleteMovements, deleteRawMovement} = Vt();

  const handleDeleteMovement = async (mov) => {
    if (!mov) return;
    const item = Pe.get(mov.item_id);
    const itemName = item ? item.name : (mov.item_id || "Product");
    const isProduction = mov.type === "production_in";
    const batchRelated = isProduction && mov.batch_id ? s.filter(m => m.batch_id === mov.batch_id) : [mov];
    const typeLabel = isProduction ? "Production" 
                    : (mov.type === "dispatch_out" || mov.type === "sale_out") ? "Sales Dispatch" 
                    : mov.type === "opening_balance" ? "Baseline" 
                    : "Movement";
    const detailMsg = batchRelated.length > 1 
      ? \`\${itemName} + \${batchRelated.length - 1} related batch records (\${batchRelated.reduce((sum, m) => sum + (m.quantity_pcs || 0), 0)} pcs on \${mov.date})\`
      : \`\${itemName} (\${mov.quantity_pcs} pcs on \${mov.date})\`;
    const confirmed = window.confirm(
      \`Delete this \${typeLabel} entry?\\n\\n\` +
      \`\${detailMsg}\\n\\n\` +
      \`This will remove the transaction from the Ledger and revert inventory balances.\`
    );
    if (!confirmed) return;
    if (deleteMovements) {
      await deleteMovements({ ids: batchRelated.map(m => m.id), batch_id: mov.batch_id });
    }
    window.alert(\`✓ Successfully deleted \${typeLabel} entry for \${itemName}.\`);
  };

  const handleDeleteRawMovement = async (rawMov) => {
    if (!rawMov) return;
    const mat = oe.get(rawMov.materialKey);
    const matName = mat ? mat.name : rawMov.materialKey;
    const confirmed = window.confirm(
      \`Delete this Raw Material log?\\n\\n\` +
      \`Material: \${matName}\\n\` +
      \`Quantity: \${rawMov.delta > 0 ? "+" : ""}\${rawMov.delta} \${rawMov.unit}\\n\` +
      \`Date: \${rawMov.date}\\n\\n\` +
      \`This will remove the record from the raw materials ledger.\`
    );
    if (!confirmed) return;
    if (deleteRawMovement) {
      await deleteRawMovement(rawMov.id);
    }
    window.alert(\`✓ Successfully deleted raw material log for \${matName}.\`);
  };

  const handleUndo = async () => {
    const latestFinished = s && s.length > 0 ? s[0] : null;
    const latestRaw = c && c.length > 0 ? c[0] : null;
    if (!latestFinished && !latestRaw) {
      window.alert("No recorded ledger entries found to undo.");
      return;
    }
    let isRawLatest = false;
    if (d === "materials" && latestRaw) {
      isRawLatest = true;
    } else if (!latestFinished) {
      isRawLatest = true;
    } else if (latestRaw && (d === "all")) {
      const finishedTime = latestFinished.created_at ? new Date(latestFinished.created_at).getTime() : 0;
      const rawTime = latestRaw.created_at ? new Date(latestRaw.created_at).getTime() : 0;
      if (rawTime > finishedTime) isRawLatest = true;
    }

    if (isRawLatest && latestRaw) {
      await handleDeleteRawMovement(latestRaw);
    } else if (latestFinished) {
      await handleDeleteMovement(latestFinished);
    }
  };

  // Main 4 ledger modes requested by user: all movement, production, sales, materials
  const [d, f] = B.useState("all");
  const [m, g] = B.useState("");
  const [_, x] = B.useState("all");
  const [selectedCategory, setSelectedCategory] = B.useState("all");
  const [b, w] = B.useState("all");
  const [E, j] = B.useState("");
  const [k, A] = B.useState("");
  const [datePreset, setDatePreset] = B.useState("all");
  const [showAllProductBreakdown, setShowAllProductBreakdown] = B.useState(false);
  const [le, he] = B.useState(null);

  const formatMoney = B.useCallback((n) => Math.round(Number(n) || 0).toLocaleString(), []);
  const formatCement = B.useCallback((val) => (val % 1 === 0 ? val : Number(val.toFixed(1))), []);

  const Pe = B.useMemo(() => {
    const S = new Map();
    for (const D of t) S.set(D.id, D);
    return S;
  }, [t]);

  const oe = B.useMemo(() => {
    const S = new Map();
    for (const D of u) { S.set(D.key, D); if (D.legacyKeys) for (const lk of D.legacyKeys) S.set(lk, D); }
    return S;
  }, [u]);

  // Categories derived dynamically
  const categories = B.useMemo(() => {
    const set = new Set();
    for (const item of t) {
      if (item.category) set.add(item.category);
    }
    return ["all", ...Array.from(set)];
  }, [t]);

  // Products filtered by selected category
  const visibleProducts = B.useMemo(() => {
    if (selectedCategory === "all") return t;
    return t.filter(it => it.category === selectedCategory);
  }, [t, selectedCategory]);

  const applyDatePreset = B.useCallback((preset) => {
    setDatePreset(preset);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const toYMD = (dt) => \`\${dt.getFullYear()}-\${pad(dt.getMonth() + 1)}-\${pad(dt.getDate())}\`;

    if (preset === "all") {
      j("");
      A("");
    } else if (preset === "today") {
      const td = toYMD(now);
      j(td);
      A(td);
    } else if (preset === "this_week") {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 6);
      j(toYMD(past7));
      A(toYMD(now));
    } else if (preset === "this_month") {
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      j(toYMD(firstOfMonth));
      A(toYMD(now));
    } else if (preset === "last_month") {
      const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      j(toYMD(firstOfLastMonth));
      A(toYMD(lastOfLastMonth));
    }
  }, []);

  // Filtered finished goods movements
  const ue = B.useMemo(() => s.filter(S => {
    if (d === "production" && S.type !== "production_in") return !1;
    if (d === "sales" && S.type !== "dispatch_out" && S.type !== "sale_out") return !1;
    if (d === "materials") return !1;

    if (_ !== "all") {
      if (_ === "production") {
        if (S.type !== "production_in") return !1;
      } else if (_ === "sales") {
        if (S.type !== "dispatch_out" && S.type !== "sale_out") return !1;
      } else if (_ === "materials") {
        return !1;
      } else if (S.type !== _) {
        return !1;
      }
    }

    if (selectedCategory !== "all") {
      const it = Pe.get(S.item_id);
      if (!it || it.category !== selectedCategory) return !1;
    }
    if (b !== "all" && S.item_id !== b) return !1;
    if (E && S.date < E) return !1;
    if (k && S.date > k) return !1;

    if (m.trim()) {
      const D = Pe.get(S.item_id),
            F = D ? D.name.toLowerCase() : "",
            cat = D ? (D.category || "").toLowerCase() : "",
            Z = (S.note || "").toLowerCase(),
            se = (S.entered_by || "").toLowerCase(),
            cust = (S.customer_name || "").toLowerCase(),
            inv = (S.invoice_no || "").toLowerCase(),
            we = m.toLowerCase();
      if (!F.includes(we) && !cat.includes(we) && !Z.includes(we) && !se.includes(we) && !cust.includes(we) && !inv.includes(we)) return !1;
    }
    return !0;
  }), [s, d, _, selectedCategory, b, E, k, m, Pe]);

  // Filtered raw materials movements
  const P = B.useMemo(() => c.filter(S => {
    if (d === "production" || d === "sales") return !1;

    if (_ !== "all") {
      if (_ === "materials") {
        // keep all materials
      } else if (_ === "production" || _ === "sales" || _ === "production_in" || _ === "dispatch_out") {
        return !1;
      } else if (S.type !== _) {
        return !1;
      }
    }

    if (E && S.date < E || k && S.date > k) return !1;

    if (m.trim()) {
      const D = oe.get(S.materialKey),
            F = D ? (D.name + " " + (D.nameSwahili || "")).toLowerCase() : "",
            src = (S.source || "").toLowerCase(),
            Z = (S.note || "").toLowerCase(),
            se = (S.enteredBy || S.entered_by || "").toLowerCase(),
            we = m.toLowerCase();
      if (!F.includes(we) && !src.includes(we) && !Z.includes(we) && !se.includes(we)) return !1;
    }
    return !0;
  }), [c, d, _, E, k, m, oe]);

  // Unified combined movements list (handles All, Production, Sales, Materials)
  const unifiedMovements = B.useMemo(() => {
    if (d === "materials") {
      return P.map(rm => ({ ...rm, isRaw: true }));
    }
    if (d === "production" || d === "sales") {
      return ue.map(fm => ({ ...fm, isRaw: false }));
    }
    // d === "all"
    const finishedFormatted = ue.map(fm => ({ ...fm, isRaw: false }));
    const rawFormatted = P.map(rm => ({ ...rm, isRaw: true }));
    const combined = [...finishedFormatted, ...rawFormatted];

    combined.sort((a_mov, b_mov) => {
      const dateCmp = (b_mov.date || "").localeCompare(a_mov.date || "");
      if (dateCmp !== 0) return dateCmp;
      const timeA = a_mov.created_at ? new Date(a_mov.created_at).getTime() : 0;
      const timeB = b_mov.created_at ? new Date(b_mov.created_at).getTime() : 0;
      return timeB - timeA;
    });
    return combined;
  }, [d, ue, P]);

  // Aggregate stats across filtered movements
  const summary = B.useMemo(() => {
    const byProduct = new Map();
    const seenBatches = new Set();
    let totalCementBags = 0;
    let totalSalesAmount = 0;
    let prodBatchesCount = 0;
    let salesDispatchesCount = 0;
    let totalProdPcs = 0;
    let totalProdSqm = 0;
    let totalSalesPcs = 0;
    let totalSalesSqm = 0;

    for (const mov of ue) {
      const item = Pe.get(mov.item_id);
      const prodId = mov.item_id || "unknown";
      if (!byProduct.has(prodId)) {
        byProduct.set(prodId, {
          id: prodId,
          name: item ? item.name : (mov.item_id || "Unknown Product"),
          category: item ? item.category : "",
          unit: item ? item.unit : "pcs",
          prodPcs: 0,
          prodSqm: 0,
          prodCement: 0,
          salesPcs: 0,
          salesSqm: 0,
          salesAmount: 0
        });
      }
      const stat = byProduct.get(prodId);
      const pcs = Number(mov.quantity_pcs) || 0;
      const sqm = Number(mov.quantity_sqm) ? Math.abs(Number(mov.quantity_sqm)) : 0;

      if (mov.type === "production_in") {
        stat.prodPcs += pcs;
        stat.prodSqm += sqm;
        totalProdPcs += pcs;
        totalProdSqm += sqm;

        let cementThisMov = Number(mov.actual_cement_bags) || 
                            Number(mov.computed_materials_deducted && mov.computed_materials_deducted.cementBags) || 
                            0;
        if (!cementThisMov && item && item.wastani_per_bag && pcs > 0) {
          cementThisMov = pcs / item.wastani_per_bag;
        }

        const batchKey = mov.batch_id || mov.id;
        if (!seenBatches.has(batchKey)) {
          seenBatches.add(batchKey);
          totalCementBags += (Number(mov.actual_cement_bags) || Number(mov.computed_materials_deducted?.cementBags) || cementThisMov);
          prodBatchesCount++;
        }
        stat.prodCement += cementThisMov;
      } else if (mov.type === "dispatch_out" || mov.type === "sale_out") {
        stat.salesPcs += pcs;
        stat.salesSqm += sqm;
        totalSalesPcs += pcs;
        totalSalesSqm += sqm;
        salesDispatchesCount++;

        let amt = Number(mov.total_price) || Number(mov.total_amount) || 0;
        if (!amt && Number(mov.price_per_unit)) {
          const q = (item && item.unit === "sqm" && sqm) ? sqm : pcs;
          amt = Number(mov.price_per_unit) * q;
        }
        stat.salesAmount += amt;
        totalSalesAmount += amt;
      }
    }

    const productsList = Array.from(byProduct.values()).filter(p => p.prodPcs > 0 || p.salesPcs > 0);
    productsList.forEach(p => {
      p.prodCement = Number(p.prodCement.toFixed(1));
    });

    let rawIntakesCount = 0;
    let rawDeductionsCount = 0;
    for (const rm of P) {
      if (rm.delta > 0) rawIntakesCount++;
      else rawDeductionsCount++;
    }

    return {
      totalCementBags: Number(totalCementBags.toFixed(1)),
      totalSalesAmount,
      prodBatchesCount,
      salesDispatchesCount,
      totalProdPcs,
      totalProdSqm: Number(totalProdSqm.toFixed(1)),
      totalSalesPcs,
      totalSalesSqm: Number(totalSalesSqm.toFixed(1)),
      productsList,
      uniqueProductsCount: productsList.length,
      rawIntakesCount,
      rawDeductionsCount,
      rawTotalCount: P.length
    };
  }, [ue, P, Pe]);

  const O = (type, isRaw = false) => {
    if (isRaw) {
      switch (type) {
        case "opening_balance":
          return o.jsxs("span", { className: "badge badge-info", style: { fontSize: "10.5px", padding: "2px 7px" }, children: [o.jsx(mc, { size: 11 }), " Mat Baseline"] });
        case "restock_in":
          return o.jsxs("span", { className: "badge badge-success", style: { fontSize: "10.5px", padding: "2px 7px" }, children: [o.jsx(Gv, { size: 11 }), " Mat Intake"] });
        case "production_deduction":
          return o.jsxs("span", { className: "badge badge-neutral", style: { fontSize: "10.5px", padding: "2px 7px", color: "var(--brand-400)", border: "1px solid rgba(249, 115, 22, 0.3)" }, children: [o.jsx(pc, { size: 11 }), " Recipe Used"] });
        default:
          return o.jsxs("span", { className: "badge badge-neutral", style: { fontSize: "10.5px", padding: "2px 7px" }, children: [o.jsx(pc, { size: 11 }), " Material"] });
      }
    }
    switch (type) {
      case "production_in":
        return o.jsxs("span", { className: "badge badge-success", style: { fontSize: "10.5px", padding: "2px 7px" }, children: [o.jsx(fc, { size: 11 }), " Production"] });
      case "opening_balance":
        return o.jsxs("span", { className: "badge badge-info", style: { fontSize: "10.5px", padding: "2px 7px" }, children: [o.jsx(mc, { size: 11 }), " Baseline"] });
      case "dispatch_out":
      case "sale_out":
        return o.jsxs("span", { className: "badge badge-danger", style: { fontSize: "10.5px", padding: "2px 7px" }, children: [o.jsx(Ka, { size: 11 }), " Sales Dispatch"] });
      case "adjustment":
        return o.jsxs("span", { className: "badge badge-warning", style: { fontSize: "10.5px", padding: "2px 7px" }, children: [o.jsx(Sc, { size: 11 }), " Adjustment"] });
      default:
        return o.jsxs("span", { className: "badge badge-neutral", style: { fontSize: "10.5px", padding: "2px 7px" }, children: [o.jsx(xx, { size: 11 }), " ", type] });
    }
  };

  const z = S => !S || S === "unspecified" ? null : S === "optimal" ? o.jsxs("span", { className: "badge badge-success", style: { fontSize: "10px", padding: "1px 5px" }, children: [o.jsx(Qp, { size: 10 }), " Optimal"] }) : S === "lean_warning" ? o.jsxs("span", { className: "badge badge-warning", style: { fontSize: "10px", padding: "1px 5px" }, children: [o.jsx(Kx, { size: 10 }), " Lean Alert"] }) : S === "rich_notice" ? o.jsxs("span", { className: "badge badge-info", style: { fontSize: "10px", padding: "1px 5px" }, children: [o.jsx(jx, { size: 10 }), " Rich Mix"] }) : null;

  const totalAllCount = s.length + c.length;
  const prodCount = s.filter(mov => mov.type === "production_in").length;
  const salesCount = s.filter(mov => mov.type === "dispatch_out" || mov.type === "sale_out").length;
  const materialsCount = c.length;

  return o.jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: "14px" },
    children: [
      // Top Header: Title, Description, and Undo button
      o.jsxs("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" },
        children: [
          o.jsxs("div", {
            children: [
              o.jsx("h1", { style: { fontSize: "20px", fontWeight: 800 }, children: "Append-Only Stock Ledger" }),
              o.jsx("p", { style: { fontSize: "12px", color: "var(--text-muted)" }, children: "Complete audit record: All Movement, Production, Sales, & Materials" })
            ]
          }),
          o.jsx("button", {
            type: "button",
            onClick: handleUndo,
            className: "btn btn-secondary btn-sm",
            style: { gap: "6px", color: "var(--brand-400)", borderColor: "var(--border-subtle)" },
            title: "Undo the last recorded transaction in the ledger",
            children: [
              o.jsx(Mx, { size: 14 }),
              o.jsx("span", { children: "Undo" })
            ]
          })
        ]
      }),

      // MAIN 4 LEDGER TABS: All Movement, Production, Sales, Materials
      o.jsxs("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "4px",
          background: "var(--bg-surface-elevated)",
          padding: "3px",
          borderRadius: "8px",
          border: "1px solid var(--border-subtle)"
        },
        children: [
          // 1. ALL MOVEMENT
          o.jsxs("button", {
            type: "button",
            onClick: () => { f("all"); x("all"); },
            style: {
              padding: "7px 4px",
              borderRadius: "6px",
              border: "none",
              fontSize: "11.5px",
              fontWeight: 700,
              background: d === "all" ? "var(--brand-500)" : "transparent",
              color: d === "all" ? "#fff" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              transition: "all 0.15s ease"
            },
            title: "View all factory movements (production, sales, materials)",
            children: [
              o.jsx(mc, { size: 13 }),
              o.jsxs("span", { children: ["All (", totalAllCount, ")"] })
            ]
          }),

          // 2. PRODUCTION
          o.jsxs("button", {
            type: "button",
            onClick: () => { f("production"); x("all"); },
            style: {
              padding: "7px 4px",
              borderRadius: "6px",
              border: "none",
              fontSize: "11.5px",
              fontWeight: 700,
              background: d === "production" ? "var(--brand-500)" : "transparent",
              color: d === "production" ? "#fff" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              transition: "all 0.15s ease"
            },
            title: "View finished goods production logs",
            children: [
              o.jsx(fc, { size: 13 }),
              o.jsxs("span", { children: ["Production (", prodCount, ")"] })
            ]
          }),

          // 3. SALES
          o.jsxs("button", {
            type: "button",
            onClick: () => { f("sales"); x("all"); },
            style: {
              padding: "7px 4px",
              borderRadius: "6px",
              border: "none",
              fontSize: "11.5px",
              fontWeight: 700,
              background: d === "sales" ? "var(--brand-500)" : "transparent",
              color: d === "sales" ? "#fff" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              transition: "all 0.15s ease"
            },
            title: "View sales and customer dispatches",
            children: [
              o.jsx(Ka, { size: 13 }),
              o.jsxs("span", { children: ["Sales (", salesCount, ")"] })
            ]
          }),

          // 4. MATERIALS
          o.jsxs("button", {
            type: "button",
            onClick: () => { f("materials"); x("all"); },
            style: {
              padding: "7px 4px",
              borderRadius: "6px",
              border: "none",
              fontSize: "11.5px",
              fontWeight: 700,
              background: d === "materials" ? "var(--brand-500)" : "transparent",
              color: d === "materials" ? "#fff" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              transition: "all 0.15s ease"
            },
            title: "View raw materials intakes and recipe deductions",
            children: [
              o.jsx(pc, { size: 13 }),
              o.jsxs("span", { children: ["Materials (", materialsCount, ")"] })
            ]
          })
        ]
      }),

      // Filter & Summary Container
      o.jsxs("div", {
        className: "card",
        style: { padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px" },
        children: [
          // Search row
          o.jsxs("div", {
            className: "search-wrapper",
            children: [
              o.jsx(ii, { className: "search-icon", size: 15 }),
              o.jsx("input", {
                type: "text",
                className: "input-field search-input",
                style: { height: "34px", minHeight: "34px", fontSize: "12px" },
                placeholder: d === "materials" ? "Search material, supplier, operator, notes..." : "Search product, customer, operator, notes...",
                value: m,
                onChange: S => g(S.target.value)
              }),
              m && o.jsx("button", { className: "search-clear", onClick: () => g(""), children: "✕" })
            ]
          }),

          // Secondary filters row (Sub-pills on left, Timeframe dropdown on right end)
          o.jsxs("div", {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "6px",
              flexWrap: "wrap"
            },
            children: [
              // Sub-pill filters based on active tab
              d === "all" ? o.jsx("div", {
                className: "filter-tabs",
                style: { gap: "4px", margin: 0 },
                children: [
                  { id: "all", label: "All Movements" },
                  { id: "production", label: "Production (+)" },
                  { id: "sales", label: "Sales (-)" },
                  { id: "materials", label: "Materials (±)" },
                  { id: "opening_balance", label: "Baseline" }
                ].map(S => o.jsx("button", {
                  onClick: () => x(S.id),
                  className: `filter-tab ${_ === S.id ? "active" : ""}`,
                  style: { fontSize: "10.5px", padding: "3px 7px" },
                  children: S.label
                }, S.id))
              }) : d === "materials" ? o.jsx("div", {
                className: "filter-tabs",
                style: { gap: "4px", margin: 0 },
                children: [
                  { id: "all", label: "All Materials" },
                  { id: "restock_in", label: "Intakes (+)" },
                  { id: "production_deduction", label: "Recipe Deductions (-)" },
                  { id: "opening_balance", label: "Baseline" }
                ].map(S => o.jsx("button", {
                  onClick: () => x(S.id),
                  className: `filter-tab ${_ === S.id ? "active" : ""}`,
                  style: { fontSize: "10.5px", padding: "3px 7px" },
                  children: S.label
                }, S.id))
              }) : o.jsx("div", {
                className: "filter-tabs",
                style: { gap: "4px", margin: 0 },
                children: [
                  { id: "all", label: d === "production" ? "All Production" : "All Sales" },
                  { id: "opening_balance", label: "Baseline" }
                ].map(S => o.jsx("button", {
                  onClick: () => x(S.id),
                  className: `filter-tab ${_ === S.id ? "active" : ""}`,
                  style: { fontSize: "10.5px", padding: "3px 7px" },
                  children: S.label
                }, S.id))
              }),

              // Timeframe filter dropdown
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto" },
                children: [
                  o.jsx(ni, { size: 12, color: "var(--brand-400)" }),
                  o.jsxs("select", {
                    className: "input-field",
                    style: {
                      height: "28px",
                      minHeight: "28px",
                      fontSize: "11px",
                      padding: "1px 6px",
                      background: datePreset !== "all" ? "var(--brand-500)" : "var(--bg-input)",
                      color: datePreset !== "all" ? "#ffffff" : "var(--text-secondary)",
                      borderColor: datePreset !== "all" ? "var(--brand-400)" : "var(--border-subtle)",
                      fontWeight: datePreset !== "all" ? 700 : 500,
                      borderRadius: "6px",
                      cursor: "pointer"
                    },
                    value: datePreset,
                    onChange: (e) => applyDatePreset(e.target.value),
                    children: [
                      o.jsx("option", { value: "all", children: "All Time" }),
                      o.jsx("option", { value: "today", children: "Today" }),
                      o.jsx("option", { value: "this_week", children: "This Week" }),
                      o.jsx("option", { value: "this_month", children: "This Month" }),
                      o.jsx("option", { value: "last_month", children: "Last Month" }),
                      o.jsx("option", { value: "custom", children: "Custom Dates..." })
                    ]
                  }),
                  datePreset !== "all" && o.jsx("button", {
                    type: "button",
                    onClick: () => applyDatePreset("all"),
                    className: "btn btn-ghost btn-sm",
                    style: { fontSize: "10px", padding: "0 4px", height: "20px", minHeight: "20px", color: "var(--text-muted)" },
                    title: "Clear date filter",
                    children: "✕"
                  })
                ]
              })
            ]
          }),

          // Product category and Product dropdowns (when finished goods are relevant)
          (d === "all" || d === "production" || d === "sales") && o.jsxs("div", {
            style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" },
            children: [
              o.jsxs("select", {
                className: "input-field",
                style: { width: "100%", height: "32px", minHeight: "32px", fontSize: "11.5px", padding: "2px 6px" },
                value: selectedCategory,
                onChange: (e) => {
                  const newCat = e.target.value;
                  setSelectedCategory(newCat);
                  if (newCat !== "all" && b !== "all") {
                    const cur = Pe.get(b);
                    if (cur && cur.category !== newCat) w("all");
                  }
                },
                children: [
                  o.jsx("option", { value: "all", children: "All Categories" }),
                  categories.filter(c_cat => c_cat !== "all").map(c_cat => o.jsx("option", { value: c_cat, children: c_cat }, c_cat))
                ]
              }),
              o.jsxs("select", {
                className: "input-field",
                style: { width: "100%", height: "32px", minHeight: "32px", fontSize: "11.5px", padding: "2px 6px" },
                value: b,
                onChange: S => w(S.target.value),
                children: [
                  o.jsxs("option", { value: "all", children: ["All Products (", visibleProducts.length, ")"] }),
                  visibleProducts.map(S => o.jsx("option", { value: S.id, children: S.name }, S.id))
                ]
              })
            ]
          }),

          // Custom Date Picker (when datePreset === 'custom')
          (datePreset === "custom") && o.jsxs("div", {
            style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", paddingTop: "4px", borderTop: "1px dashed var(--border-subtle)" },
            children: [
              o.jsxs("div", {
                children: [
                  o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "1px" }, children: "From Date:" }),
                  o.jsx("input", {
                    type: "date",
                    className: "input-field mono",
                    style: { height: "28px", minHeight: "28px", fontSize: "11px", width: "100%", padding: "2px 6px" },
                    value: E,
                    onChange: S => j(S.target.value)
                  })
                ]
              }),
              o.jsxs("div", {
                children: [
                  o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "1px" }, children: "To Date:" }),
                  o.jsx("input", {
                    type: "date",
                    className: "input-field mono",
                    style: { height: "28px", minHeight: "28px", fontSize: "11px", width: "100%", padding: "2px 6px" },
                    value: k,
                    onChange: S => A(S.target.value)
                  })
                ]
              })
            ]
          }),

          // DOMAIN SUMMARY METRICS STRIP
          o.jsxs("div", {
            style: {
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            },
            children: [
              o.jsxs("div", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  flexWrap: "wrap",
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: "6px 8px",
                  borderRadius: "6px"
                },
                children: [
                  // Production Metric (Cement Used is primary metric)
                  (d === "all" || d === "production") && o.jsxs("div", {
                    style: { display: "inline-flex", alignItems: "center", gap: "5px", flexWrap: "wrap" },
                    children: [
                      o.jsx(fc, { size: 13, color: "var(--status-success)" }),
                      o.jsx("span", { style: { fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }, children: "Cement Used:" }),
                      o.jsxs("strong", { style: { fontSize: "12px", color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [
                        summary.totalCementBags, " bags"
                      ]}),
                      summary.totalProdPcs > 0 && o.jsxs("span", {
                        style: { fontSize: "10.5px", color: "var(--brand-400)", fontFamily: "var(--font-mono)" },
                        children: ["(+", summary.totalProdPcs.toLocaleString(), " pcs", summary.totalProdSqm > 0 ? \` · \${summary.totalProdSqm} m²\` : "", ")"]
                      })
                    ]
                  }),

                  (d === "all") && o.jsx("span", { style: { color: "var(--border-subtle)", opacity: 0.5 }, children: "│" }),

                  // Sales Metric (Total Revenue Tsh is primary metric)
                  (d === "all" || d === "sales") && o.jsxs("div", {
                    style: { display: "inline-flex", alignItems: "center", gap: "5px", flexWrap: "wrap" },
                    children: [
                      o.jsx(Ka, { size: 13, color: "#f87171" }),
                      o.jsx("span", { style: { fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }, children: "Sales:" }),
                      o.jsxs("strong", { style: { fontSize: "12px", color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [
                        "Tsh ", formatMoney(summary.totalSalesAmount)
                      ]}),
                      summary.totalSalesPcs > 0 && o.jsxs("span", {
                        style: { fontSize: "10.5px", color: "#f87171", fontFamily: "var(--font-mono)" },
                        children: ["(-", summary.totalSalesPcs.toLocaleString(), " pcs", summary.totalSalesSqm > 0 ? \` · \${summary.totalSalesSqm} m²\` : "", ")"]
                      })
                    ]
                  }),

                  // Materials Metric (for Materials tab)
                  (d === "materials") && o.jsxs("div", {
                    style: { display: "inline-flex", alignItems: "center", gap: "5px", flexWrap: "wrap" },
                    children: [
                      o.jsx(pc, { size: 13, color: "var(--brand-400)" }),
                      o.jsx("span", { style: { fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }, children: "Raw Movements:" }),
                      o.jsxs("strong", { style: { fontSize: "12px", color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [
                        summary.rawTotalCount, " entries"
                      ]}),
                      o.jsxs("span", {
                        style: { fontSize: "10.5px", color: "var(--text-muted)" },
                        children: ["(", summary.rawIntakesCount, " intakes · ", summary.rawDeductionsCount, " deductions)"]
                      })
                    ]
                  }),

                  // Product breakdown toggle
                  (d === "all" || d === "production" || d === "sales") && summary.uniqueProductsCount > 1 && o.jsx("button", {
                    type: "button",
                    onClick: () => setShowAllProductBreakdown(!showAllProductBreakdown),
                    className: "btn btn-ghost btn-sm",
                    style: { fontSize: "10px", padding: "1px 5px", height: "18px", minHeight: "18px", color: "var(--brand-400)" },
                    children: showAllProductBreakdown ? "▲ Hide Items" : \`▼ Items (\${summary.uniqueProductsCount})\`
                  })
                ]
              }),

              // Per-Product breakdown
              (d === "all" || d === "production" || d === "sales") && summary.uniqueProductsCount > 1 && showAllProductBreakdown && o.jsx("div", {
                style: { display: "flex", flexDirection: "column", gap: "3px", padding: "2px" },
                children: summary.productsList.map(p => o.jsxs("div", {
                  key: p.id,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    background: "rgba(255,255,255,0.02)",
                    padding: "3px 6px",
                    borderRadius: "4px"
                  },
                  children: [
                    o.jsx("span", { style: { fontWeight: 600, color: "#f8fafc", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: p.name }),
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "10.5px", flexWrap: "wrap", justifyContent: "flex-end" },
                      children: [
                        p.prodPcs > 0 && o.jsxs("span", { style: { color: "var(--status-success)" }, children: [
                          "+", p.prodPcs.toLocaleString(), " pcs",
                          p.prodSqm > 0 ? \` (\${p.prodSqm} m²)\` : "",
                          p.prodCement > 0 ? \` [\${formatCement(p.prodCement)} bags cem]\` : ""
                        ]}),
                        p.salesPcs > 0 && o.jsxs("span", { style: { color: "#f87171" }, children: [
                          "-\", p.salesPcs.toLocaleString(), \" pcs",
                          p.salesSqm > 0 ? \` (\${p.salesSqm} m²)\` : "",
                        ]}),
                        p.salesAmount > 0 && o.jsxs("span", { style: { color: "var(--text-secondary)" }, children: [
                          "Tsh \", formatMoney(p.salesAmount)
                        ]})
                      ]
                    })
                  ]
                }))
              })
            ]
          })
        ]
      }),

      // RECORDED MOVEMENTS LIST (Unified list covering all movement, production, sales, materials)
      o.jsxs("div", {
        style: { display: "flex", flexDirection: "column", gap: "8px" },
        children: [
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" },
            children: [
              o.jsxs("span", {
                style: { fontSize: "12.5px", fontWeight: 600, color: "var(--text-secondary)" },
                children: [
                  d === "all" ? "All Recorded Movements (" + unifiedMovements.length + ")" :
                  d === "production" ? "Production Movements (" + unifiedMovements.length + ")" :
                  d === "sales" ? "Sales Dispatches (" + unifiedMovements.length + ")" :
                  "Raw Material Logs (" + unifiedMovements.length + ")"
                ]
              }),
              o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)" }, children: "Latest first" })
            ]
          }),

          unifiedMovements.length === 0 ? o.jsxs("div", {
            className: "card",
            style: { textAlign: "center", padding: "36px 16px", color: "var(--text-muted)" },
            children: [
              o.jsx(mc, { size: 30, style: { margin: "0 auto 8px auto", opacity: 0.5 } }),
              o.jsx("div", { style: { fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }, children: "No movements found" }),
              o.jsx("div", { style: { fontSize: "11.5px", marginTop: "3px" }, children: "Transactions matching the selected filters will be recorded here." })
            ]
          }) : unifiedMovements.map(S => {
            // Case 1: Raw Material Movement
            if (S.isRaw) {
              const mat = oe.get(S.materialKey);
              const isBase = S.type === "opening_balance";
              const isRestock = S.type === "restock_in" || (!isBase && S.delta > 0);
              const isPositive = S.delta >= 0;

              return o.jsxs("div", {
                onClick: () => he(S),
                className: "card",
                style: {
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  cursor: "pointer",
                  borderLeft: isBase ? "3px solid #38bdf8" : isRestock ? "3px solid #34d399" : "3px solid #f97316"
                },
                children: [
                  o.jsxs("div", {
                    style: { flex: 1, minWidth: 0 },
                    children: [
                      o.jsxs("div", {
                        style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px", flexWrap: "wrap" },
                        children: [
                          O(S.type, true),
                          o.jsx("strong", { style: { fontSize: "13.5px", color: "#f8fafc" }, children: mat ? mat.name : S.materialKey })
                        ]
                      }),
                      o.jsxs("div", {
                        style: { fontSize: "11px", color: "var(--text-muted)", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" },
                        children: [
                          o.jsxs("span", { children: [o.jsx(ni, { size: 11, style: { verticalAlign: "middle" } }), " ", S.date] }),
                          o.jsxs("span", { children: [o.jsx(Da, { size: 11, style: { verticalAlign: "middle" } }), " ", S.enteredBy || S.entered_by || "Supervisor"] }),
                          S.source && o.jsxs("span", { style: { color: "var(--brand-400)", fontWeight: 600 }, children: ["📍 ", S.source] }),
                          S.totalCost && S.totalCost > 0 ? o.jsxs("span", { style: { color: "#34d399", fontWeight: 700 }, children: ["Tsh ", formatMoney(S.totalCost), S.unitPrice ? \` (\${formatMoney(S.unitPrice)} / unit)\` : ""] }) : null,
                          S.note && o.jsxs("span", { style: { color: "var(--text-secondary)", maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: ['"', S.note, '"'] })
                        ]
                      })
                    ]
                  }),
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 },
                    children: [
                      o.jsx("div", {
                        style: { textAlign: "right" },
                        children: o.jsxs("span", {
                          style: { fontSize: "15px", fontWeight: 800, fontFamily: "var(--font-mono)", color: isBase ? "#38bdf8" : (isPositive ? "#34d399" : "#f97316") },
                          children: [isPositive ? "+" : "", S.delta, " ", S.unit]
                        })
                      }),
                      o.jsxs("button", {
                        type: "button",
                        onClick: (e) => {
                          e.stopPropagation();
                          handleDeleteRawMovement(S);
                        },
                        className: "btn btn-ghost btn-sm",
                        style: {
                          padding: "5px 7px",
                          color: "#ef4444",
                          border: "1px solid rgba(239, 68, 68, 0.35)",
                          borderRadius: "6px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          background: "rgba(239, 68, 68, 0.08)",
                          cursor: "pointer"
                        },
                        title: "Delete this raw material log",
                        children: [
                          o.jsx(Yp, { size: 12 }),
                          o.jsx("span", { children: "Delete" })
                        ]
                      })
                    ]
                  })
                ]
              }, S.id);
            }

            // Case 2: Finished Goods Movement (Production, Sales, Baseline, Adjustment)
            const item = Pe.get(S.item_id);
            const isPositive = S.delta >= 0;
            const isSale = S.type === "dispatch_out" || S.type === "sale_out";
            const isProd = S.type === "production_in";

            return o.jsxs("div", {
              onClick: () => he(S),
              className: "card",
              style: {
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                cursor: "pointer",
                borderLeft: isProd ? "3px solid #34d399" : isSale ? "3px solid #f87171" : S.type === "opening_balance" ? "3px solid #38bdf8" : "3px solid #eab308",
                borderColor: S.qc_status === "lean_warning" ? "rgba(245, 158, 11, 0.5)" : void 0
              },
              children: [
                o.jsxs("div", {
                  style: { flex: 1, minWidth: 0 },
                  children: [
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px", flexWrap: "wrap" },
                      children: [
                        O(S.type, false),
                        o.jsx("span", { style: { fontSize: "13.5px", fontWeight: 700, color: "#f8fafc" }, children: item ? item.name : S.item_id }),
                        S.color && o.jsx(xr, { color: S.color, size: "sm", showCount: !1 }),
                        z(S.qc_status)
                      ]
                    }),
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--text-muted)", flexWrap: "wrap" },
                      children: [
                        o.jsxs("span", { style: { display: "flex", alignItems: "center", gap: "2px" }, children: [o.jsx(ni, { size: 11 }), " ", S.date] }),
                        o.jsxs("span", { style: { display: "flex", alignItems: "center", gap: "2px" }, children: [o.jsx(Da, { size: 11 }), " ", S.entered_by] }),
                        S.computed_materials_deducted && o.jsxs("span", { style: { color: "var(--brand-400)" }, children: ["⚡ ", S.computed_materials_deducted.cementBags, " bags Cem"] }),
                        (S.total_price || S.total_amount) && o.jsxs("span", { style: { color: "#34d399", fontWeight: 600 }, children: ["Tsh ", formatMoney(S.total_price || S.total_amount)] }),
                        S.customer_name && o.jsxs("span", { style: { color: "var(--text-secondary)" }, children: ["👤 ", S.customer_name] }),
                        S.note && o.jsxs("span", { style: { color: "var(--text-secondary)", maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: ['"', S.note, '"'] })
                      ]
                    })
                  ]
                }),
                o.jsxs("div", {
                  style: { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 },
                  children: [
                    o.jsxs("div", {
                      style: { textAlign: "right" },
                      children: [
                        o.jsxs("div", {
                          style: { fontSize: "15px", fontWeight: 800, fontFamily: "var(--font-mono)", color: isPositive ? "#34d399" : "#f87171" },
                          children: [isPositive ? "+" : "", S.quantity_pcs, " pcs"]
                        }),
                        S.quantity_sqm !== null && o.jsxs("div", {
                          style: { fontSize: "11px", color: "var(--brand-400)", fontWeight: 600 },
                          children: [isPositive ? "+" : "-", Math.abs(S.quantity_sqm), " sqm"]
                        })
                      ]
                    }),
                    o.jsxs("button", {
                      type: "button",
                      onClick: (e) => {
                        e.stopPropagation();
                        handleDeleteMovement(S);
                      },
                      className: "btn btn-ghost btn-sm",
                      style: {
                        padding: "5px 7px",
                        color: "#ef4444",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        background: "rgba(239, 68, 68, 0.08)",
                        cursor: "pointer"
                      },
                      title: "Delete this ledger entry",
                      children: [
                        o.jsx(Yp, { size: 12 }),
                        o.jsx("span", { children: "Delete" })
                      ]
                    })
                  ]
                })
              ]
            }, S.id);
          })
        ]
      }),

      // DETAILS MODAL (le state: handles both finished goods and raw materials)
      le && o.jsx("div", {
        className: "modal-overlay",
        onClick: () => he(null),
        children: o.jsxs("div", {
          className: "modal-content",
          onClick: S => S.stopPropagation(),
          style: { padding: "20px" },
          children: [
            o.jsxs("div", {
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" },
              children: [
                o.jsxs("div", {
                  style: { display: "flex", alignItems: "center", gap: "8px" },
                  children: [
                    o.jsx(xx, { size: 18, color: "var(--brand-400)" }),
                    o.jsx("h3", { style: { fontSize: "16.5px", fontWeight: 700 }, children: le.isRaw ? "Raw Material Ledger Record" : "Movement Ledger Record" })
                  ]
                }),
                o.jsx("button", { onClick: () => he(null), className: "btn btn-ghost btn-sm", children: o.jsx(Yn, { size: 18 }) })
              ]
            }),

            le.isRaw ? (
              // Raw Material Details View
              o.jsxs("div", {
                style: { display: "flex", flexDirection: "column", gap: "8px" },
                children: [
                  o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Type" }),
                      O(le.type, true)
                    ]
                  }),
                  o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Material" }),
                      o.jsx("span", { style: { fontWeight: 700 }, children: ((N = oe.get(le.materialKey)) == null ? void 0 : N.name) || le.materialKey })
                    ]
                  }),
                  o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Quantity" }),
                      o.jsxs("span", { style: { fontWeight: 700, fontFamily: "var(--font-mono)", color: le.delta >= 0 ? "#34d399" : "#f97316" }, children: [
                        le.delta >= 0 ? "+" : "", le.delta, " ", le.unit
                      ]})
                    ]
                  }),
                  le.source && o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Source / Supplier" }),
                      o.jsx("span", { style: { fontWeight: 600, color: "var(--brand-400)" }, children: le.source })
                    ]
                  }),
                  le.totalCost && le.totalCost > 0 && o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Total Cost" }),
                      o.jsxs("span", { style: { fontWeight: 700, color: "#34d399" }, children: ["Tsh ", formatMoney(le.totalCost)] })
                    ]
                  }),
                  le.related_batch_id && o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Related Batch" }),
                      o.jsx("span", { fontFamily: "var(--font-mono)", fontSize: "11px", children: le.related_batch_id })
                    ]
                  }),
                  o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Entered By" }),
                      o.jsx("span", { style: { fontWeight: 600 }, children: le.enteredBy || le.entered_by || "Supervisor" })
                    ]
                  }),
                  o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Date & Timestamp" }),
                      o.jsxs("span", { style: { fontSize: "11.5px", color: "var(--text-secondary)" }, children: [le.date, " (", le.created_at ? new Date(le.created_at).toLocaleTimeString() : "N/A", ")"] })
                    ]
                  }),
                  le.note && o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Notes" }),
                      o.jsx("span", { style: { fontSize: "12px", color: "var(--text-secondary)" }, children: le.note })
                    ]
                  })
                ]
              })
            ) : (
              // Finished Goods Details View
              o.jsxs("div", {
                style: { display: "flex", flexDirection: "column", gap: "8px" },
                children: [
                  o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Type" }),
                      o.jsxs("div", { style: { display: "flex", gap: "6px" }, children: [O(le.type, false), z(le.qc_status)] })
                    ]
                  }),
                  o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Product" }),
                      o.jsx("span", { style: { fontWeight: 700 }, children: ((N = Pe.get(le.item_id)) == null ? void 0 : N.name) || le.item_id })
                    ]
                  }),
                  le.color && o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Color" }),
                      o.jsx(xr, { color: le.color, size: "sm", showCount: !1 })
                    ]
                  }),
                  o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Quantity in Pieces" }),
                      o.jsxs("span", { style: { fontWeight: 700, fontFamily: "var(--font-mono)" }, children: [le.quantity_pcs, " pcs"] })
                    ]
                  }),
                  le.quantity_sqm !== null && o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Quantity in Sqm" }),
                      o.jsxs("span", { style: { fontWeight: 700, color: "var(--brand-400)", fontFamily: "var(--font-mono)" }, children: [le.quantity_sqm, " sqm"] })
                    ]
                  }),
                  le.computed_materials_deducted && o.jsxs("div", {
                    style: { padding: "8px 10px", background: "var(--bg-input)", borderRadius: "8px", marginTop: "4px" },
                    children: [
                      o.jsx("div", { style: { fontSize: "11.5px", fontWeight: 700, marginBottom: "4px", color: "var(--brand-400)" }, children: "⚡ Auto-Deducted Raw Materials:" }),
                      o.jsxs("div", {
                        style: { fontSize: "11.5px", color: "var(--text-secondary)" },
                        children: [
                          "• Cement: ", o.jsxs("strong", { children: [le.computed_materials_deducted.cementBags, " bags"] }), " (50kg)", o.jsx("br", {}),
                          "• Sand: ", o.jsxs("strong", { children: [le.computed_materials_deducted.sandBuckets, " buckets"] }), o.jsx("br", {}),
                          "• Chipping: ", o.jsxs("strong", { children: [le.computed_materials_deducted.chippingBuckets, " buckets"] }),
                          le.computed_materials_deducted.chemicalLiters > 0 && o.jsxs("div", { children: ["• Dawa: ", o.jsxs("strong", { children: [le.computed_materials_deducted.chemicalLiters, " L"] })] }),
                          le.computed_materials_deducted.pigmentRedKg > 0 && o.jsxs("div", { children: ["• Red Pigment: ", o.jsxs("strong", { children: [le.computed_materials_deducted.pigmentRedKg, " kg"] })] })
                        ]
                      })
                    ]
                  }),
                  (le.customer_name || le.total_price || le.total_amount) && o.jsxs("div", {
                    style: { padding: "8px 10px", background: "var(--bg-input)", borderRadius: "8px", marginTop: "4px" },
                    children: [
                      o.jsx("div", { style: { fontSize: "11.5px", fontWeight: 700, marginBottom: "4px", color: "#f87171" }, children: "🏷️ Sales & Dispatch Info:" }),
                      o.jsxs("div", {
                        style: { fontSize: "11.5px", color: "var(--text-secondary)" },
                        children: [
                          le.customer_name && o.jsxs("div", { children: ["• Customer: ", o.jsx("strong", { children: le.customer_name })] }),
                          (le.total_price || le.total_amount) && o.jsxs("div", { children: ["• Total Amount: ", o.jsxs("strong", { style: { color: "#34d399" }, children: ["Tsh ", formatMoney(le.total_price || le.total_amount)] })] }),
                          le.price_per_unit && o.jsxs("div", { children: ["• Price / unit: ", o.jsxs("strong", { children: ["Tsh ", formatMoney(le.price_per_unit)] })] }),
                          le.invoice_no && o.jsxs("div", { children: ["• Invoice #: ", o.jsx("strong", { children: le.invoice_no })] })
                        ]
                      })
                    ]
                  }),
                  o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Entered By" }),
                      o.jsx("span", { style: { fontWeight: 600 }, children: le.entered_by })
                    ]
                  }),
                  o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Date & Timestamp" }),
                      o.jsxs("span", { style: { fontSize: "11.5px", color: "var(--text-secondary)" }, children: [le.date, " (", le.created_at ? new Date(le.created_at).toLocaleTimeString() : "N/A", ")"] })
                    ]
                  }),
                  le.note && o.jsxs("div", {
                    style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" },
                    children: [
                      o.jsx("span", { style: { fontSize: "12.5px", color: "var(--text-muted)" }, children: "Notes" }),
                      o.jsx("span", { style: { fontSize: "12px", color: "var(--text-secondary)" }, children: le.note })
                    ]
                  })
                ]
              })
            ),

            o.jsxs("div", {
              style: { marginTop: "16px", display: "flex", gap: "10px" },
              children: [
                o.jsxs("button", {
                  type: "button",
                  onClick: () => {
                    const toDelete = le;
                    he(null);
                    if (toDelete.isRaw) handleDeleteRawMovement(toDelete);
                    else handleDeleteMovement(toDelete);
                  },
                  className: "btn btn-ghost",
                  style: { color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.35)", background: "rgba(239, 68, 68, 0.08)", display: "flex", alignItems: "center", gap: "6px", padding: "7px 12px", fontSize: "12px", fontWeight: 700 },
                  children: [
                    o.jsx(Yp, { size: 14 }),
                    o.jsx("span", { children: "Delete Entry" })
                  ]
                }),
                o.jsx("button", { type: "button", onClick: () => he(null), className: "btn btn-secondary", style: { flex: 1 }, children: "Close Details" })
              ]
            })
          ]
        })
      }),

      null
    ]
  });
},`;

// Read bundle
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const k1Idx = bundle.indexOf('k1=');
const c1Idx = bundle.indexOf('C1=', k1Idx);

if (k1Idx === -1 || c1Idx === -1) {
  console.error('Could not find k1 or C1 in bundle');
  process.exit(1);
}

// Validate new k1 code syntax
try {
  new vm.Script(k1NewCode.replace(/\bVt\b/g, '(()=>({movements:[],items:[],staffName:"",rawMaterialMovements:[],rawMaterials:[]}))'));
  console.log('✓ k1NewCode syntax validation PASSED!');
} catch(err) {
  console.error('Syntax error in k1NewCode:', err);
  process.exit(1);
}

// Backup bundle first
fs.writeFileSync('scratch/backup_before_unified_ledger.js', bundle);
console.log('✓ Saved backup before unified ledger replacement');

// Replace k1 in bundle
const newBundle = bundle.slice(0, k1Idx) + k1NewCode + bundle.slice(c1Idx);
fs.writeFileSync('assets/index-hgjhj-0G.js', newBundle);
console.log('✓ Successfully injected new Unified Ledger into assets/index-hgjhj-0G.js!');

// Bump cache in index.html and service-worker if needed
const indexHtml = fs.readFileSync('index.html', 'utf8');
const newTs = Date.now();
const updatedHtml = indexHtml.replace(/index-hgjhj-0G\.js\?v=\d+/, 'index-hgjhj-0G.js?v=' + newTs);
fs.writeFileSync('index.html', updatedHtml);
console.log('✓ Updated index.html cache buster with v=' + newTs);

const sw = fs.readFileSync('service-worker.js', 'utf8');
const updatedSw = sw.replace(/const CACHE_NAME = ['"][^'"]+['"]/, `const CACHE_NAME = 'stumarcot-v${newTs}'`);
fs.writeFileSync('service-worker.js', updatedSw);
console.log('✓ Updated service-worker.js cache with stumarcot-v' + newTs);
