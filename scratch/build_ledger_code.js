const fs = require('fs');
const vm = require('vm');

// Construct the refactored k1 Ledger component
// Requirements:
// 1. Timeframe filter as dropdown at top right end, same row as [All, Production, Dispatch]
// 2. Production summary (total cement used) and Sales summary (total sales amount) take position of previous timeframe filter
// 3. Never count different products as same; each product has its own qty
// 4. In the production summary, in the certain product qty line, also show how much cement was used to produce that qty
const k1Code = `k1=()=>{
  var T,N;
  const {movements:s, items:t, addMovement:r, staffName:a, rawMaterialMovements:c, rawMaterials:u} = Vt();
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
    for (const D of u) S.set(D.key, D);
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
  }), [c, E, k, m, oe]);

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
          o.jsxs("button", {
            onClick: () => W(!0),
            className: "btn btn-secondary btn-sm",
            style: { gap: "4px" },
            children: [
              o.jsx(vr, { size: 14, color: "var(--brand-400)" }),
              o.jsx("span", { children: "Dispatch / Adjust" })
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
            onClick: () => f("finished_goods"),
            style: { padding: "6px 8px", borderRadius: "6px", border: "none", fontSize: "12px", fontWeight: 700, background: d === "finished_goods" ? "var(--brand-500)" : "transparent", color: d === "finished_goods" ? "#fff" : "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" },
            children: [
              o.jsx(si, { size: 13 }),
              o.jsxs("span", { children: ["Finished Goods (", s.length, ")"] })
            ]
          }),
          o.jsxs("button", {
            type: "button",
            onClick: () => f("raw_materials"),
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
                  className: \`filter-tab \${_ === S.id ? "active" : ""}\`,
                  style: { fontSize: "11px", padding: "4px 8px" },
                  children: S.label
                }, S.id))
              }) : o.jsx("span", { style: { fontSize: "11.5px", fontWeight: 600, color: "var(--text-secondary)" }, children: "Filter Raw Materials:" }),

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
                    children: showAllProductBreakdown ? "▲ Hide Items" : \`▼ Items (\${summary.uniqueProductsCount})\`
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
                  style: { textAlign: "right", flexShrink: 0 },
                  children: [
                    o.jsxs("div", { style: { fontSize: "16px", fontWeight: 800, fontFamily: "var(--font-mono)", color: F ? "#34d399" : "#f87171" }, children: [F ? "+" : "", S.quantity_pcs, " pcs"] }),
                    S.quantity_sqm !== null && o.jsxs("div", { style: { fontSize: "12px", color: "var(--brand-400)", fontWeight: 600 }, children: [F ? "+" : "-", Math.abs(S.quantity_sqm), " sqm"] })
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
                  F = S.delta >= 0;
            return o.jsxs("div", {
              className: "card",
              style: { padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" },
                      children: [
                        o.jsx("span", { className: \`badge \${F ? "badge-success" : "badge-neutral"}\`, style: { fontSize: "10.5px" }, children: F ? "+ Restock Intake" : "- Auto Recipe Deduction" }),
                        o.jsx("strong", { style: { fontSize: "14px", color: "#f8fafc" }, children: D ? D.name : S.materialKey })
                      ]
                    }),
                    o.jsxs("div", {
                      style: { fontSize: "11.5px", color: "var(--text-muted)", display: "flex", gap: "8px" },
                      children: [
                        o.jsxs("span", { children: [o.jsx(ni, { size: 11, style: { verticalAlign: "middle" } }), " ", S.date] }),
                        o.jsxs("span", { children: ["By: ", S.enteredBy] }),
                        S.note && o.jsxs("span", { style: { color: "var(--text-secondary)" }, children: ['"', S.note, '"'] })
                      ]
                    })
                  ]
                }),
                o.jsx("div", {
                  style: { textAlign: "right" },
                  children: o.jsxs("span", { style: { fontSize: "16px", fontWeight: 800, fontFamily: "var(--font-mono)", color: F ? "#34d399" : "#f87171" }, children: [F ? "+" : "", S.delta, " ", S.unit] })
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
            o.jsx("div", {
              style: { marginTop: "18px", textAlign: "right" },
              children: o.jsx("button", { type: "button", onClick: () => he(null), className: "btn btn-secondary", style: { width: "100%" }, children: "Close Details" })
            })
          ]
        })
      }),

      // Log Dispatch or Adjustment Modal
      L && o.jsx("div", {
        className: "modal-overlay",
        onClick: () => W(!1),
        children: o.jsxs("div", {
          className: "modal-content",
          onClick: S => S.stopPropagation(),
          style: { padding: "22px" },
          children: [
            o.jsxs("div", {
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
              children: [
                o.jsx("h3", { style: { fontSize: "18px", fontWeight: 700 }, children: "Log Dispatch or Stock Adjustment" }),
                o.jsx("button", { onClick: () => W(!1), className: "btn btn-ghost btn-sm", children: o.jsx(Yn, { size: 18 }) })
              ]
            }),
            o.jsxs("form", {
              onSubmit: y,
              children: [
                o.jsxs("div", {
                  className: "input-group",
                  children: [
                    o.jsx("label", { className: "input-label", children: "Movement Type" }),
                    o.jsxs("div", {
                      style: { display: "flex", gap: "8px" },
                      children: [
                        o.jsx("button", { type: "button", onClick: () => ne("dispatch_out"), className: \`btn \${H === "dispatch_out" ? "btn-primary" : "btn-secondary"}\`, style: { flex: 1, background: H === "dispatch_out" ? "var(--status-danger)" : void 0 }, children: "Dispatch Out (-)" }),
                        o.jsx("button", { type: "button", onClick: () => ne("adjustment"), className: \`btn \${H === "adjustment" ? "btn-primary" : "btn-secondary"}\`, style: { flex: 1 }, children: "Adjustment (±)" })
                      ]
                    })
                  ]
                }),
                o.jsxs("div", {
                  className: "input-group",
                  children: [
                    o.jsx("label", { className: "input-label", children: "Product" }),
                    o.jsx("select", {
                      value: Y,
                      onChange: S => ae(S.target.value),
                      className: "input-field",
                      children: t.map(S => o.jsxs("option", { value: S.id, children: [S.name, " (", S.category, ")"] }, S.id))
                    })
                  ]
                }),
                (G == null ? void 0 : G.colors) && G.colors.length > 0 && o.jsxs("div", {
                  className: "input-group",
                  children: [
                    o.jsx("label", { className: "input-label", children: "Color Variant" }),
                    o.jsx("select", {
                      value: fe,
                      onChange: S => xe(S.target.value),
                      className: "input-field",
                      children: G.colors.map(S => o.jsx("option", { value: S, children: S }, S))
                    })
                  ]
                }),
                o.jsxs("div", {
                  className: "input-group",
                  children: [
                    o.jsx("label", { className: "input-label", children: "Quantity in Pieces (pcs)" }),
                    o.jsx("input", { type: "number", min: "1", step: "1", required: !0, value: Ie, onChange: S => Be(S.target.value), className: "input-field mono", placeholder: "e.g. 50" })
                  ]
                }),
                o.jsxs("div", {
                  className: "input-group",
                  children: [
                    o.jsx("label", { className: "input-label", children: "Note / Customer / Reason" }),
                    o.jsx("input", { type: "text", value: M, onChange: S => ee(S.target.value), className: "input-field", placeholder: "e.g. Dispatched to Site B, truck T123 ABC..." })
                  ]
                }),
                o.jsx("button", { type: "submit", className: "btn btn-primary btn-lg", style: { width: "100%", marginTop: "8px" }, children: "Save Ledger Movement" })
              ]
            })
          ]
        })
      })
    ]
  });
}`;

// Validate syntax
try {
  new vm.Script('let ' + k1Code);
  console.log('✓ k1Code passed JS syntax validation!');
} catch (e) {
  console.error('Syntax error in k1Code:', e);
  process.exit(1);
}

// Check bundle replacement
const bundlePath = 'assets/index-hgjhj-0G.js';
const bundleContent = fs.readFileSync(bundlePath, 'utf8');

const k1Start = bundleContent.indexOf(',k1=');
const c1Start = bundleContent.indexOf(',C1=', k1Start);

if (k1Start === -1 || c1Start === -1) {
  throw new Error('Could not find k1 / C1 boundaries in ' + bundlePath);
}

console.log('Replacing k1 in bundle: from index', k1Start, 'to', c1Start);

const newBundle = bundleContent.substring(0, k1Start + 1) + k1Code + bundleContent.substring(c1Start);

fs.writeFileSync(bundlePath, newBundle, 'utf8');
console.log('✓ Successfully updated assets/index-hgjhj-0G.js with refactored Ledger Tab (k1)!');

// Bump service worker cache version
const swPath = 'service-worker.js';
const nowTimestamp = Date.now();
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = ['"]stumarcot-pwa-v[^'"]+['"]/, () => {
    return `const CACHE_NAME = 'stumarcot-pwa-v1.7.0-${nowTimestamp}'`;
  });
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('✓ Bumped service worker cache version to stumarcot-pwa-v1.7.0-' + nowTimestamp);
}

// Update index.html script tag cache buster
const htmlPath = 'index.html';
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/src="\.\/assets\/index-hgjhj-0G\.js[^"]*"/, `src="./assets/index-hgjhj-0G.js?v=${nowTimestamp}"`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('✓ Updated index.html with new cache buster timestamp');
}
