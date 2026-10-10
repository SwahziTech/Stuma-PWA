k1=()=>{
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
      ? `${itemName} + ${batchRelated.length - 1} related batch records (${batchRelated.reduce((sum, m) => sum + (m.quantity_pcs || 0), 0)} pcs on ${mov.date})`
      : `${itemName} (${mov.quantity_pcs} pcs on ${mov.date})`;
    const confirmed = window.confirm(
      `Delete this ${typeLabel} entry?\n\n` +
      `${detailMsg}\n\n` +
      `This will remove the transaction from the Unified Ledger and revert inventory balances.`
    );
    if (!confirmed) return;
    if (deleteMovements) {
      await deleteMovements({ ids: batchRelated.map(m => m.id), batch_id: mov.batch_id });
    }
    window.alert(`✓ Successfully deleted ${typeLabel} entry for ${itemName}.`);
  };

  const handleDeleteRawMovement = async (rawMov) => {
    if (!rawMov) return;
    const mat = oe.get(rawMov.materialKey);
    const matName = mat ? mat.name : rawMov.materialKey;
    const confirmed = window.confirm(
      `Delete this Raw Material log?\n\n` +
      `Material: ${matName}\n` +
      `Quantity: ${rawMov.delta > 0 ? "+" : ""}${rawMov.delta} ${rawMov.unit}\n` +
      `Date: ${rawMov.date}\n\n` +
      `This will remove the record from the raw materials ledger.`
    );
    if (!confirmed) return;
    if (deleteRawMovement) {
      await deleteRawMovement(rawMov.id);
    }
    window.alert(`✓ Successfully deleted raw material log for ${matName}.`);
  };

  const handleUndo = async () => {
    if (!s || s.length === 0) {
      window.alert("No recorded ledger entries found to undo.");
      return;
    }
    const latest = s[0];
    const targetMovs = latest.batch_id ? s.filter(m => m.batch_id === latest.batch_id) : [latest];
    const itemNames = Array.from(new Set(targetMovs.map(m => {
      const item = t.find(it => it.id === m.item_id);
      return item ? item.name : "Item";
    }))).join(", ");
    const typeLabel = latest.type === "production_in" ? "Production" : latest.type === "opening_balance" ? "Baseline" : latest.type === "dispatch_out" ? "Dispatch" : "Movement";
    const confirmed = window.confirm(`Undo last recorded ${typeLabel} entry for:\n${itemNames} (${targetMovs.length} ${targetMovs.length === 1 ? "record" : "records"} on ${latest.date})?\n\nThis will remove the transaction from the ledger and restore materials to inventory.`);
    if (!confirmed) return;
    if (deleteMovements) {
      await deleteMovements({ ids: targetMovs.map(m => m.id), batch_id: latest.batch_id });
    }
    window.alert(`✓ Successfully undid last ${typeLabel} entry for ${itemNames}.`);
  };
  const [d, f] = B.useState("finished_goods");
  const [m, g] = B.useState("");
  const [_, x] = B.useState("all");
  const [selectedCategory, setSelectedCategory] = B.useState("all");
  const [b, w] = B.useState("all");
  const [E, j] = B.useState("");
  const [k, A] = B.useState("");
  const [datePreset, setDatePreset] = B.useState("all");
  const [showAllProductBreakdown, setShowAllProductBreakdown] = B.useState(false);
  const [L, W] = B.useState(!1);
  const [H, ne] = B.useState("dispatch_out");
  const [Y, ae] = B.useState(((T = t[0]) == null ? void 0 : T.id) || "");
  const [fe, xe] = B.useState("Standard");
  const [Ie, Be] = B.useState("");
  const [M, ee] = B.useState("");
  const [le, he] = B.useState(null);

  const formatMoney = B.useCallback((n) => Math.round(Number(n) || 0).toLocaleString(), []);
  const formatCement = B.useCallback((c) => (c % 1 === 0 ? c : Number(c.toFixed(1))), []);

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

  const G = Pe.get(Y);

  // Available categories derived dynamically from items
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

  // Date range presets helper for weekly / monthly / custom determinations
  const applyDatePreset = B.useCallback((preset) => {
    setDatePreset(preset);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const toYMD = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;

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
    if (_ !== "all" && S.type !== _) return !1;
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
            Z = (S.note || "").toLowerCase(),
            se = (S.entered_by || "").toLowerCase(),
            we = m.toLowerCase();
      if (!F.includes(we) && !Z.includes(we) && !se.includes(we)) return !1;
    }
    return !0;
  }), [s, _, selectedCategory, b, E, k, m, Pe]);

  // Filtered raw materials movements
  const P = B.useMemo(() => c.filter(S => {
    if (_ !== "all" && S.type !== _) return !1;
    if (E && S.date < E || k && S.date > k) return !1;
    if (m.trim()) {
      const D = oe.get(S.materialKey),
            F = D ? (D.name + " " + D.nameSwahili).toLowerCase() : "",
            Z = (S.note || "").toLowerCase(),
            se = (S.enteredBy || "").toLowerCase(),
            we = m.toLowerCase();
      if (!F.includes(we) && !Z.includes(we) && !se.includes(we)) return !1;
    }
    return !0;
  }), [c, _, E, k, m, oe]);

  // Domain determination summary:
  // - Never count different products as one
  // - Production: Cement amount used (bags) is primary metric
  // - Sales: Total revenue amount (TSh) is primary metric
  // - In product qty lines: show how much cement was used to produce that qty
  const summary = B.useMemo(() => {
    const byProduct = new Map();
    const seenBatches = new Set();
    let totalCementBags = 0;
    let totalSalesAmount = 0;
    let prodBatchesCount = 0;
    let salesDispatchesCount = 0;

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
      } else if (mov.type === "dispatch_out") {
        stat.salesPcs += pcs;
        stat.salesSqm += sqm;
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

    return {
      totalCementBags: Number(totalCementBags.toFixed(1)),
      totalSalesAmount,
      prodBatchesCount,
      salesDispatchesCount,
      productsList,
      uniqueProductsCount: productsList.length
    };
  }, [ue, Pe]);

  const y = async S => {
    S.preventDefault();
    const D = parseFloat(Ie);
    if (isNaN(D) || D <= 0) return;
    const F = Pe.get(Y);
    if (!F) return;
    const Z = fe === "Standard" ? null : fe;
    let se = null;
    F.unit === "sqm" && F.pcs_per_sqm && F.pcs_per_sqm > 0 && (se = Number((D / F.pcs_per_sqm).toFixed(2)));
    let we = F.unit === "sqm" && se !== null ? se : D;
    H === "dispatch_out" && (we = -Math.abs(we));
    (await r({
      item_id: F.id,
      type: H,
      color: Z,
      quantity_pcs: D,
      quantity_sqm: se,
      delta: we,
      date: new Date().toISOString().split("T")[0],
      note: M || (H === "dispatch_out" ? "Manual Dispatch" : "Manual Adjustment")
    })) && (W(!1), Be(""), ee(""));
  };

  const O = S => {
    switch (S) {
      case "production_in":
        return o.jsxs("span", { className: "badge badge-success", style: { fontSize: "11px", padding: "2px 7px" }, children: [o.jsx(Gv, { size: 12 }), " Production"] });
      case "opening_balance":
        return o.jsxs("span", { className: "badge badge-info", style: { fontSize: "11px", padding: "2px 7px" }, children: [o.jsx(mc, { size: 12 }), " Baseline"] });
      case "dispatch_out":
        return o.jsxs("span", { className: "badge badge-danger", style: { fontSize: "11px", padding: "2px 7px" }, children: [o.jsx(Vp, { size: 12 }), " Dispatch"] });
      case "adjustment":
        return o.jsxs("span", { className: "badge badge-warning", style: { fontSize: "11px", padding: "2px 7px" }, children: [o.jsx(Sc, { size: 12 }), " Adjustment"] });
    }
  };

  const z = S => !S || S === "unspecified" ? null : S === "optimal" ? o.jsxs("span", { className: "badge badge-success", style: { fontSize: "10.5px", padding: "1px 6px" }, children: [o.jsx(Qp, { size: 11 }), " QC Optimal"] }) : S === "lean_warning" ? o.jsxs("span", { className: "badge badge-warning", style: { fontSize: "10.5px", padding: "1px 6px" }, children: [o.jsx(Kx, { size: 11 }), " QC Lean Alert"] }) : S === "rich_notice" ? o.jsxs("span", { className: "badge badge-info", style: { fontSize: "10.5px", padding: "1px 6px" }, children: [o.jsx(jx, { size: 11 }), " QC Rich Mix"] }) : null;

  return o.jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: "12px" },
    children: [
      // Top Header
      o.jsxs("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" },
        children: [
          o.jsxs("div", {
            children: [
              o.jsx("h1", { style: { fontSize: "19px", fontWeight: 800 }, children: "Append-Only Ledger Log" }),
              o.jsx("p", { style: { fontSize: "12px", color: "var(--text-muted)" }, children: "Immutable history of finished goods movements & raw material auto-deductions" })
            ]
          }),
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "8px" },
            children: [
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
          })
        ]
      }),

      // Main Finished Goods vs Raw Materials Tabs
      o.jsxs("div", {
        style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", background: "var(--bg-surface-elevated)", padding: "3px", borderRadius: "8px", border: "1px solid var(--border-subtle)" },
        children: [
          o.jsxs("button", {
            type: "button",
            onClick: () => { f("finished_goods"); x("all"); },
            style: { padding: "6px 8px", borderRadius: "6px", border: "none", fontSize: "12px", fontWeight: 700, background: d === "finished_goods" ? "var(--brand-500)" : "transparent", color: d === "finished_goods" ? "#fff" : "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" },
            children: [
              o.jsx(si, { size: 13 }),
              o.jsxs("span", { children: ["Finished Goods (", s.length, ")"] })
            ]
          }),
          o.jsxs("button", {
            type: "button",
            onClick: () => { f("raw_materials"); x("all"); },
            style: { padding: "6px 8px", borderRadius: "6px", border: "none", fontSize: "12px", fontWeight: 700, background: d === "raw_materials" ? "var(--brand-500)" : "transparent", color: d === "raw_materials" ? "#fff" : "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" },
            children: [
              o.jsx(pc, { size: 13 }),
              o.jsxs("span", { children: ["Raw Materials (", c.length, ")"] })
            ]
          })
        ]
      }),

      // Unified Filter Card
      o.jsxs("div", {
        className: "card",
        style: { padding: "10px 12px", display: "flex", flexDirection: "column", gap: "9px" },
        children: [
          // Row 1: Search Box
          o.jsxs("div", {
            className: "search-wrapper",
            children: [
              o.jsx(ii, { className: "search-icon", size: 15 }),
              o.jsx("input", {
                type: "text",
                className: "input-field search-input",
                style: { height: "34px", minHeight: "34px", fontSize: "12.5px" },
                placeholder: "Search product, operator, notes...",
                value: m,
                onChange: S => g(S.target.value)
              }),
              m && o.jsx("button", { className: "search-clear", onClick: () => g(""), children: "✕" })
            ]
          }),

          // Row 2: Same row - Movement type tabs on left, Timeframe dropdown on top right end
          o.jsxs("div", {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              flexWrap: "wrap"
            },
            children: [
              // Left: Movement Type Filter Tabs (Finished Goods)
              d === "finished_goods" ? o.jsx("div", {
                className: "filter-tabs",
                style: { gap: "4px", margin: 0 },
                children: [
                  { id: "all", label: "All" },
                  { id: "production_in", label: "Production (+)" },
                  { id: "opening_balance", label: "Opening" },
                  { id: "dispatch_out", label: "Dispatch (-)" },
                  { id: "adjustment", label: "Adjustment" }
                ].map(S => o.jsx("button", {
                  onClick: () => x(S.id),
                  className: `filter-tab ${_ === S.id ? "active" : ""}`,
                  style: { fontSize: "11px", padding: "4px 8px" },
                  children: S.label
                }, S.id))
              }) : o.jsx("div", {
                className: "filter-tabs",
                style: { gap: "4px", margin: 0 },
                children: [
                  { id: "all", label: "All Logs" },
                  { id: "opening_balance", label: "Baseline" },
                  { id: "restock_in", label: "Intake (+)" },
                  { id: "production_deduction", label: "Deduction (-)" }
                ].map(S => o.jsx("button", {
                  onClick: () => x(S.id),
                  className: `filter-tab ${_ === S.id ? "active" : ""}`,
                  style: { fontSize: "11px", padding: "4px 8px" },
                  children: S.label
                }, S.id))
              }),

              // Right End: Timeframe Filter Dropdown (Same Row!)
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", gap: "5px", marginLeft: "auto" },
                children: [
                  o.jsx(ni, { size: 13, color: "var(--brand-400)" }),
                  o.jsxs("select", {
                    className: "input-field",
                    style: {
                      height: "30px",
                      minHeight: "30px",
                      fontSize: "11.5px",
                      padding: "2px 8px",
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
                    style: { fontSize: "10.5px", padding: "1px 5px", height: "22px", minHeight: "22px", color: "var(--text-muted)" },
                    title: "Clear date filter",
                    children: "✕"
                  })
                ]
              })
            ]
          }),

          // Row 3: Product Category and Specific Product Dropdowns
          d === "finished_goods" && o.jsxs("div", {
            style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
            children: [
              o.jsxs("select", {
                className: "input-field",
                style: { width: "100%", height: "34px", minHeight: "34px", fontSize: "12px", padding: "4px 8px" },
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
                  categories.filter(cat => cat !== "all").map(cat => o.jsx("option", { value: cat, children: cat }, cat))
                ]
              }),

              o.jsxs("select", {
                className: "input-field",
                style: { width: "100%", height: "34px", minHeight: "34px", fontSize: "12px", padding: "4px 8px" },
                value: b,
                onChange: S => w(S.target.value),
                children: [
                  o.jsxs("option", { value: "all", children: ["All Products (", visibleProducts.length, ")"] }),
                  visibleProducts.map(S => o.jsxs("option", { value: S.id, children: [S.name, selectedCategory === "all" ? " (" + S.category + ")" : ""] }, S.id))
                ]
              })
            ]
          }),

          // Row 4: TAKES THE POSITION OF THE PREVIOUS TIMEFRAMES FILTER:
          // Production summary (total cement used) & Sales summary (total sales amount)
          // Also shows how much cement was used to produce that certain product quantity!
          d === "finished_goods" && o.jsxs("div", {
            style: {
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "7px",
              display: "flex",
              flexDirection: "column",
              gap: "5px"
            },
            children: [
              o.jsxs("div", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  flexWrap: "wrap",
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: "6px 10px",
                  borderRadius: "6px"
                },
                children: [
                  // Production Summary: Total Cement Used (Universal cross-product production metric)
                  o.jsxs("div", {
                    style: { display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap" },
                    children: [
                      o.jsx(Gv, { size: 14, color: "var(--status-success)" }),
                      o.jsx("span", { style: { fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }, children: "Cement Used:" }),
                      o.jsxs("strong", { style: { fontSize: "13px", color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [
                        summary.totalCementBags, " bags"
                      ]}),
                      // If single product is selected: show its specific pieces, sqm AND cement used for that qty!
                      summary.uniqueProductsCount === 1 && summary.productsList[0] && summary.productsList[0].prodPcs > 0 && o.jsxs("span", {
                        style: { fontSize: "11px", color: "var(--brand-400)", fontFamily: "var(--font-mono)" },
                        children: [
                          "(+", summary.productsList[0].prodPcs.toLocaleString(), " pcs",
                          summary.productsList[0].prodSqm > 0 ? " · " + summary.productsList[0].prodSqm + " m²" : "",
                          summary.productsList[0].prodCement > 0 ? " · " + formatCement(summary.productsList[0].prodCement) + " bags cem" : "",
                          ")"
                        ]
                      })
                    ]
                  }),

                  o.jsx("span", { style: { color: "var(--border-subtle)", opacity: 0.6 }, children: "│" }),

                  // Sales Summary: Total Sales Amount (Universal cross-product sales metric)
                  o.jsxs("div", {
                    style: { display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap" },
                    children: [
                      o.jsx(Vp, { size: 14, color: "#f87171" }),
                      o.jsx("span", { style: { fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }, children: "Total Sales:" }),
                      o.jsxs("strong", { style: { fontSize: "13px", color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [
                        "Tsh ", formatMoney(summary.totalSalesAmount)
                      ]}),
                      // If single product is selected, show its specific pieces & sqm
                      summary.uniqueProductsCount === 1 && summary.productsList[0] && summary.productsList[0].salesPcs > 0 && o.jsxs("span", {
                        style: { fontSize: "11px", color: "#f87171", fontFamily: "var(--font-mono)" },
                        children: [
                          "(-", summary.productsList[0].salesPcs.toLocaleString(), " pcs",
                          summary.productsList[0].salesSqm > 0 ? " · " + summary.productsList[0].salesSqm + " m²" : "",
                          ")"
                        ]
                      })
                    ]
                  }),

                  // Per-product breakdown toggle (if multiple products exist)
                  summary.uniqueProductsCount > 1 && o.jsx("button", {
                    type: "button",
                    onClick: () => setShowAllProductBreakdown(!showAllProductBreakdown),
                    className: "btn btn-ghost btn-sm",
                    style: { fontSize: "10.5px", padding: "1px 6px", height: "20px", minHeight: "20px", color: "var(--brand-400)" },
                    children: showAllProductBreakdown ? "▲ Hide Items" : `▼ Items (${summary.uniqueProductsCount})`
                  })
                ]
              }),

              // Per-Product Separate Quantities Breakdown:
              // For each product qty line, CEMENT USED for that qty is explicitly shown!
              summary.uniqueProductsCount > 1 && showAllProductBreakdown && o.jsx("div", {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                  padding: "4px 2px"
                },
                children: summary.productsList.map(p => o.jsxs("div", {
                  key: p.id,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "11.5px",
                    background: "rgba(255,255,255,0.02)",
                    padding: "4px 8px",
                    borderRadius: "4px"
                  },
                  children: [
                    o.jsx("span", { style: { fontWeight: 600, color: "#f8fafc", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: p.name }),
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-mono)", fontSize: "11px", flexWrap: "wrap", justifyContent: "flex-end" },
                      children: [
                        // Production line for this certain product with its exact qty AND cement used!
                        p.prodPcs > 0 && o.jsxs("span", { style: { color: "var(--status-success)" }, children: [
                          "+", p.prodPcs.toLocaleString(), " pcs",
                          p.prodSqm > 0 ? " (" + p.prodSqm + " m²)" : "",
                          p.prodCement > 0 ? " [" + formatCement(p.prodCement) + " bags cem]" : ""
                        ]}),
                        // Sales line for this certain product
                        p.salesPcs > 0 && o.jsxs("span", { style: { color: "#f87171" }, children: [
                          "-", p.salesPcs.toLocaleString(), " pcs",
                          p.salesSqm > 0 ? " (" + p.salesSqm + " m²)" : ""
                        ]}),
                        // Revenue for this certain product
                        p.salesAmount > 0 && o.jsxs("span", { style: { color: "var(--text-secondary)" }, children: [
                          "Tsh ", formatMoney(p.salesAmount)
                        ]})
                      ]
                    })
                  ]
                }))
              })
            ]
          }),

          // Row 5: Custom Date Inputs (only appears when Custom Dates is selected)
          (datePreset === "custom") && o.jsxs("div", {
            style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", paddingTop: "5px", borderTop: "1px dashed var(--border-subtle)" },
            children: [
              o.jsxs("div", {
                children: [
                  o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "1px" }, children: "From Date:" }),
                  o.jsx("input", {
                    type: "date",
                    className: "input-field mono",
                    style: { height: "30px", minHeight: "30px", fontSize: "11.5px", width: "100%", padding: "2px 6px" },
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
                    style: { height: "30px", minHeight: "30px", fontSize: "11.5px", width: "100%", padding: "2px 6px" },
                    value: k,
                    onChange: S => A(S.target.value)
                  })
                ]
              })
            ]
          })
        ]
      }),

      // Finished Goods Movement List
      d === "finished_goods" && o.jsxs("div", {
        style: { display: "flex", flexDirection: "column", gap: "8px" },
        children: [
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" },
            children: [
              o.jsxs("span", { style: { fontSize: "12.5px", fontWeight: 600, color: "var(--text-secondary)" }, children: ["Recorded Movements (", ue.length, ")"] }),
              o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: "Latest first" })
            ]
          }),
          ue.length === 0 ? o.jsxs("div", {
            className: "card",
            style: { textAlign: "center", padding: "36px 16px", color: "var(--text-muted)" },
            children: [
              o.jsx(mc, { size: 32, style: { margin: "0 auto 8px auto", opacity: .5 } }),
              o.jsx("div", { style: { fontSize: "14.5px", fontWeight: 600, color: "var(--text-secondary)" }, children: "No movements found" }),
              o.jsx("div", { style: { fontSize: "12px", marginTop: "4px" }, children: "Logged production or opening balance entries will appear here." })
            ]
          }) : ue.map(S => {
            const D = Pe.get(S.item_id),
                  F = S.delta >= 0;
            return o.jsxs("div", {
              onClick: () => he(S),
              className: "card",
              style: { padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", cursor: "pointer", borderColor: S.qc_status === "lean_warning" ? "rgba(245, 158, 11, 0.4)" : void 0 },
              children: [
                o.jsxs("div", {
                  style: { flex: 1, minWidth: 0 },
                  children: [
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" },
                      children: [
                        O(S.type),
                        o.jsx("span", { style: { fontSize: "14.5px", fontWeight: 700, color: "#f8fafc" }, children: D ? D.name : "Unknown Product" }),
                        S.color && o.jsx(xr, { color: S.color, size: "sm", showCount: !1 }),
                        z(S.qc_status)
                      ]
                    }),
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "center", gap: "10px", fontSize: "11.5px", color: "var(--text-muted)", flexWrap: "wrap" },
                      children: [
                        o.jsxs("span", { style: { display: "flex", alignItems: "center", gap: "3px" }, children: [o.jsx(ni, { size: 12 }), " ", S.date] }),
                        o.jsxs("span", { style: { display: "flex", alignItems: "center", gap: "3px" }, children: [o.jsx(Da, { size: 12 }), " ", S.entered_by] }),
                        S.computed_materials_deducted && o.jsxs("span", { style: { color: "var(--brand-400)" }, children: ["⚡ ", S.computed_materials_deducted.cementBags, " bags Cem"] }),
                        S.note && o.jsxs("span", { style: { color: "var(--text-secondary)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: ['"', S.note, '"'] })
                      ]
                    })
                  ]
                }),
                o.jsxs("div", {
                  style: { display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 },
                  children: [
                    o.jsxs("div", {
                      style: { textAlign: "right" },
                      children: [
                        o.jsxs("div", { style: { fontSize: "16px", fontWeight: 800, fontFamily: "var(--font-mono)", color: F ? "#34d399" : "#f87171" }, children: [F ? "+" : "", S.quantity_pcs, " pcs"] }),
                        S.quantity_sqm !== null && o.jsxs("div", { style: { fontSize: "12px", color: "var(--brand-400)", fontWeight: 600 }, children: [F ? "+" : "-", Math.abs(S.quantity_sqm), " sqm"] })
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
                        padding: "6px 8px",
                        color: "#ef4444",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "rgba(239, 68, 68, 0.08)",
                        cursor: "pointer"
                      },
                      title: "Delete this ledger entry",
                      children: [
                        o.jsx(Yp, { size: 13 }),
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

      // Raw Materials List
      d === "raw_materials" && o.jsxs("div", {
        style: { display: "flex", flexDirection: "column", gap: "8px" },
        children: [
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" },
            children: [
              o.jsxs("span", { style: { fontSize: "12.5px", fontWeight: 600, color: "var(--text-secondary)" }, children: ["Raw Material Ledger Logs (", P.length, ")"] }),
              o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: "Production deductions & restocks" })
            ]
          }),
          P.length === 0 ? o.jsxs("div", {
            className: "card",
            style: { textAlign: "center", padding: "36px 16px", color: "var(--text-muted)" },
            children: [
              o.jsx(pc, { size: 32, style: { margin: "0 auto 8px auto", opacity: .5 } }),
              o.jsx("div", { style: { fontSize: "14.5px", fontWeight: 600, color: "var(--text-secondary)" }, children: "No raw material logs yet" }),
              o.jsx("div", { style: { fontSize: "12px", marginTop: "4px" }, children: "Deductions will be automatically recorded when you log finished goods production." })
            ]
          }) : P.map(S => {
            const D = oe.get(S.materialKey),
                  isBase = S.type === "opening_balance",
                  isRestock = S.type === "restock_in" || (!isBase && S.delta > 0),
                  F = S.delta >= 0;
            return o.jsxs("div", {
              className: "card",
              style: { padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", borderLeft: isBase ? "3px solid #38bdf8" : isRestock ? "3px solid #34d399" : "3px solid #f87171" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" },
                      children: [
                        isBase ? o.jsxs("span", { className: "badge badge-info", style: { fontSize: "10.5px" }, children: [o.jsx(mc, { size: 11 }), " Baseline Stock"] }) :
                        isRestock ? o.jsx("span", { className: "badge badge-success", style: { fontSize: "10.5px" }, children: "+ Restock Intake" }) :
                        o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "10.5px" }, children: "- Auto Recipe Deduction" }),
                        o.jsx("strong", { style: { fontSize: "14px", color: "#f8fafc" }, children: D ? D.name : S.materialKey })
                      ]
                    }),
                    o.jsxs("div", {
                      style: { fontSize: "11.5px", color: "var(--text-muted)", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" },
                      children: [
                        o.jsxs("span", { children: [o.jsx(ni, { size: 11, style: { verticalAlign: "middle" } }), " ", S.date] }),
                        o.jsxs("span", { children: ["By: ", S.enteredBy] }),
                        S.source && o.jsxs("span", { style: { color: "var(--brand-400)", fontWeight: 600 }, children: ["📍 ", S.source] }),
                        S.totalCost && S.totalCost > 0 ? o.jsxs("span", { style: { color: "#34d399", fontWeight: 700 }, children: ["Tsh ", Number(S.totalCost).toLocaleString(), S.unitPrice ? " (" + Number(S.unitPrice).toLocaleString() + " / unit)" : ""] }) : null,
                        S.note && o.jsxs("span", { style: { color: "var(--text-secondary)" }, children: ['"', S.note, '"'] })
                      ]
                    })
                  ]
                }),
                o.jsxs("div", {
                  style: { display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 },
                  children: [
                    o.jsx("div", {
                      style: { textAlign: "right" },
                      children: o.jsxs("span", { style: { fontSize: "16px", fontWeight: 800, fontFamily: "var(--font-mono)", color: isBase ? "#38bdf8" : (F ? "#34d399" : "#f87171") }, children: [F ? "+" : "", S.delta, " ", S.unit] })
                    }),
                    o.jsxs("button", {
                      type: "button",
                      onClick: (e) => {
                        e.stopPropagation();
                        handleDeleteRawMovement(S);
                      },
                      className: "btn btn-ghost btn-sm",
                      style: {
                        padding: "6px 8px",
                        color: "#ef4444",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "rgba(239, 68, 68, 0.08)",
                        cursor: "pointer"
                      },
                      title: "Delete this raw material log",
                      children: [
                        o.jsx(Yp, { size: 13 }),
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

      // Movement Details Modal
      le && o.jsx("div", {
        className: "modal-overlay",
        onClick: () => he(null),
        children: o.jsxs("div", {
          className: "modal-content",
          onClick: S => S.stopPropagation(),
          style: { padding: "22px" },
          children: [
            o.jsxs("div", {
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
              children: [
                o.jsxs("div", {
                  style: { display: "flex", alignItems: "center", gap: "8px" },
                  children: [
                    o.jsx(xx, { size: 20, color: "var(--brand-400)" }),
                    o.jsx("h3", { style: { fontSize: "17px", fontWeight: 700 }, children: "Movement Ledger Record" })
                  ]
                }),
                o.jsx("button", { onClick: () => he(null), className: "btn btn-ghost btn-sm", children: o.jsx(Yn, { size: 18 }) })
              ]
            }),
            o.jsxs("div", {
              style: { display: "flex", flexDirection: "column", gap: "10px" },
              children: [
                o.jsxs("div", {
                  style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" },
                  children: [
                    o.jsx("span", { style: { fontSize: "13px", color: "var(--text-muted)" }, children: "Type" }),
                    o.jsxs("div", { style: { display: "flex", gap: "6px" }, children: [O(le.type), z(le.qc_status)] })
                  ]
                }),
                o.jsxs("div", {
                  style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" },
                  children: [
                    o.jsx("span", { style: { fontSize: "13px", color: "var(--text-muted)" }, children: "Product" }),
                    o.jsx("span", { style: { fontWeight: 700 }, children: ((N = Pe.get(le.item_id)) == null ? void 0 : N.name) || le.item_id })
                  ]
                }),
                le.color && o.jsxs("div", {
                  style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" },
                  children: [
                    o.jsx("span", { style: { fontSize: "13px", color: "var(--text-muted)" }, children: "Color" }),
                    o.jsx(xr, { color: le.color, size: "sm", showCount: !1 })
                  ]
                }),
                o.jsxs("div", {
                  style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" },
                  children: [
                    o.jsx("span", { style: { fontSize: "13px", color: "var(--text-muted)" }, children: "Quantity in Pieces" }),
                    o.jsxs("span", { style: { fontWeight: 700, fontFamily: "var(--font-mono)" }, children: [le.quantity_pcs, " pcs"] })
                  ]
                }),
                le.quantity_sqm !== null && o.jsxs("div", {
                  style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" },
                  children: [
                    o.jsx("span", { style: { fontSize: "13px", color: "var(--text-muted)" }, children: "Quantity in Sqm" }),
                    o.jsxs("span", { style: { fontWeight: 700, color: "var(--brand-400)", fontFamily: "var(--font-mono)" }, children: [le.quantity_sqm, " sqm"] })
                  ]
                }),
                le.computed_materials_deducted && o.jsxs("div", {
                  style: { padding: "10px", background: "var(--bg-input)", borderRadius: "8px", marginTop: "6px" },
                  children: [
                    o.jsx("div", { style: { fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--brand-400)" }, children: "⚡ Auto-Deducted Raw Materials:" }),
                    o.jsxs("div", {
                      style: { fontSize: "12px", color: "var(--text-secondary)" },
                      children: [
                        "• Cement: ",
                        o.jsxs("strong", { children: [le.computed_materials_deducted.cementBags, " bags"] }),
                        " (50kg)",
                        o.jsx("br", {}),
                        "• Sand: ",
                        o.jsxs("strong", { children: [le.computed_materials_deducted.sandBuckets, " buckets"] }),
                        o.jsx("br", {}),
                        "• Chipping: ",
                        o.jsxs("strong", { children: [le.computed_materials_deducted.chippingBuckets, " buckets"] }),
                        le.computed_materials_deducted.chemicalLiters > 0 && o.jsxs("div", { children: ["• Dawa: ", o.jsxs("strong", { children: [le.computed_materials_deducted.chemicalLiters, " L"] })] }),
                        le.computed_materials_deducted.pigmentRedKg > 0 && o.jsxs("div", { children: ["• Red Pigment: ", o.jsxs("strong", { children: [le.computed_materials_deducted.pigmentRedKg, " kg"] })] })
                      ]
                    })
                  ]
                }),
                o.jsxs("div", {
                  style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" },
                  children: [
                    o.jsx("span", { style: { fontSize: "13px", color: "var(--text-muted)" }, children: "Entered By" }),
                    o.jsx("span", { style: { fontWeight: 600 }, children: le.entered_by })
                  ]
                }),
                o.jsxs("div", {
                  style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" },
                  children: [
                    o.jsx("span", { style: { fontSize: "13px", color: "var(--text-muted)" }, children: "Date & Timestamp" }),
                    o.jsxs("span", { style: { fontSize: "12px", color: "var(--text-secondary)" }, children: [le.date, " (", le.created_at ? new Date(le.created_at).toLocaleTimeString() : "N/A", ")"] })
                  ]
                })
              ]
            }),
            o.jsxs("div", {
              style: { marginTop: "18px", display: "flex", gap: "10px" },
              children: [
                o.jsxs("button", {
                  type: "button",
                  onClick: () => {
                    const toDelete = le;
                    he(null);
                    handleDeleteMovement(toDelete);
                  },
                  className: "btn btn-ghost",
                  style: { color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.35)", background: "rgba(239, 68, 68, 0.08)", display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "13px", fontWeight: 700 },
                  children: [
                    o.jsx(Yp, { size: 15 }),
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
},