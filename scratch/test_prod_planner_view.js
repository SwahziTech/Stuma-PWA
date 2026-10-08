const vm = require('vm');

const code = `
const ProductionCapacityPlannerView = ({
  items: a,
  totalFactoryMolds: totalMolds,
  todayMoldsInUse: moldsUsed,
  overallMoldUtilizationPct: moldsPct,
  onStartProduction
}) => {
  const [selectedProductId, setSelectedProductId] = B.useState(a[0]?.id || "");
  const [targetPcsStr, setTargetPcsStr] = B.useState("200");
  const [searchQuery, setSearchQuery] = B.useState("");
  const [categoryFilter, setCategoryFilter] = B.useState("All");

  const categories = B.useMemo(() => {
    const set = new Set(a.map(item => item.category));
    return ["All", ...Array.from(set)];
  }, [a]);

  const selectedItem = B.useMemo(() => {
    return a.find(p => p.id === selectedProductId) || a[0];
  }, [a, selectedProductId]);

  const simData = B.useMemo(() => {
    if (!selectedItem) return null;
    const pcs = parseInt(targetPcsStr, 10) || 0;
    const spec = lt(selectedItem);
    const moldCount = selectedItem.moldCount || spec.moldCount || 50;
    const wastani = selectedItem.wastani_per_bag || spec.wastaniPcsPerBag || 50;
    const cyclesNeeded = moldCount > 0 ? Math.ceil(pcs / moldCount) : 1;
    const isOverOneCycle = pcs > moldCount;
    const utilizationPct = moldCount > 0 ? Math.min(100, Number(((pcs / moldCount) * 100).toFixed(1))) : 100;
    const materials = Pa(selectedItem, pcs, "White");
    let totalSqm = null;
    if (selectedItem.unit === "sqm" && selectedItem.pcs_per_sqm && selectedItem.pcs_per_sqm > 0) {
      totalSqm = Number((pcs / selectedItem.pcs_per_sqm).toFixed(2));
    }

    return {
      item: selectedItem,
      spec,
      pcs,
      totalSqm,
      moldCount,
      wastani,
      cyclesNeeded,
      isOverOneCycle,
      utilizationPct,
      materials
    };
  }, [selectedItem, targetPcsStr]);

  const filteredItems = B.useMemo(() => {
    return a.filter(item => {
      const matchCat = categoryFilter === "All" || item.category === categoryFilter;
      const matchQuery = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [a, categoryFilter, searchQuery]);

  return o.jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: "16px" },
    children: [
      // Fleet Turnaround KPI Hero Banner
      o.jsxs("div", {
        className: "card-elevated",
        style: {
          padding: "18px 20px",
          background: "linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.95))",
          border: "1px solid rgba(56, 189, 248, 0.35)",
          boxShadow: "0 8px 30px rgba(56, 189, 248, 0.15)",
          borderRadius: "var(--radius-lg)"
        },
        children: [
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "12px" },
            children: [
              o.jsxs("div", {
                children: [
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" },
                    children: [
                      o.jsx("span", { style: { fontSize: "11px", color: "#38bdf8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }, children: "🏭 Dodoma Factory Fleet Metrics" }),
                      o.jsx("span", { className: "badge", style: { background: "rgba(56, 189, 248, 0.2)", color: "#38bdf8", fontSize: "10px", padding: "1px 6px" }, children: "Live Capacity" })
                    ]
                  }),
                  o.jsxs("div", {
                    style: { fontSize: "clamp(18px, 4vw, 22px)", fontWeight: 800, color: "#f8fafc" },
                    children: [
                      (moldsUsed || 0).toLocaleString(),
                      " / ",
                      (totalMolds || 0).toLocaleString(),
                      " molds cast today"
                    ]
                  })
                ]
              }),
              o.jsxs("div", {
                style: { textAlign: "right" },
                children: [
                  o.jsxs("div", { style: { fontSize: "28px", fontWeight: 900, color: "#38bdf8", fontFamily: "var(--font-mono)", lineHeight: 1 }, children: [moldsPct || 0, "%"] }),
                  o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: "Daily fleet cast rate" })
                ]
              })
            ]
          }),
          // Animated Bar
          o.jsx("div", {
            style: { width: "100%", height: "10px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "6px", overflow: "hidden" },
            children: o.jsx("div", {
              style: {
                width: Math.min(100, moldsPct || 0) + "%",
                height: "100%",
                background: "linear-gradient(90deg, #38bdf8, #f97316)",
                borderRadius: "6px",
                transition: "width 0.4s ease"
              }
            })
          }),
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", fontSize: "11.5px", color: "var(--text-muted)" },
            children: [
              o.jsx("span", { children: "Full turnaround takes 24 hours per mold cycle." }),
              o.jsxs("span", { style: { color: "var(--brand-400)", fontWeight: 700 }, children: [(totalMolds - (moldsUsed || 0)).toLocaleString(), " molds remaining available"] })
            ]
          })
        ]
      }),

      // Interactive Order & Batch Capacity Simulator Card
      o.jsxs("div", {
        className: "card-elevated",
        style: {
          padding: "18px 20px",
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-surface-card)",
          borderRadius: "var(--radius-lg)"
        },
        children: [
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" },
            children: [
              o.jsx(qa, { size: 22, color: "var(--brand-400)" }),
              o.jsxs("div", {
                children: [
                  o.jsx("h3", { style: { fontSize: "16px", fontWeight: 800, color: "#f8fafc", margin: 0 }, children: "Production Capacity & Mix Simulator" }),
                  o.jsx("p", { style: { fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", margin: 0 }, children: "Simulate order size to calculate physical mold cycles, curing turnaround, and raw materials needed." })
                ]
              })
            ]
          }),

          // Simulator Inputs Grid
          o.jsxs("div", {
            style: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "12px", marginBottom: "12px" },
            children: [
              o.jsxs("div", {
                children: [
                  o.jsx("label", { style: { fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "5px" }, children: "1. Select Finished Product" }),
                  o.jsx("select", {
                    value: selectedProductId,
                    onChange: e => setSelectedProductId(e.target.value),
                    className: "input-field",
                    style: { fontSize: "13px", fontWeight: 600, padding: "9px 12px" },
                    children: a.map(item => o.jsxs("option", {
                      value: item.id,
                      children: [
                        item.name,
                        " (",
                        item.category,
                        " · ",
                        item.moldCount || lt(item).moldCount,
                        " molds)"
                      ]
                    }, item.id))
                  })
                ]
              }),
              o.jsxs("div", {
                children: [
                  o.jsx("label", { style: { fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "5px" }, children: "2. Target Output (pcs)" }),
                  o.jsx("input", {
                    type: "number",
                    min: "1",
                    step: "10",
                    value: targetPcsStr,
                    onChange: e => setTargetPcsStr(e.target.value),
                    className: "input-field mono",
                    style: { fontSize: "16px", fontWeight: 800, padding: "8px 12px" },
                    placeholder: "200"
                  })
                ]
              })
            ]
          }),

          // Quick Presets
          selectedItem && o.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "16px" },
            children: [
              o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)", marginRight: "4px" }, children: "Quick Quantity Presets:" }),
              [100, 200, 500, selectedItem.moldCount || lt(selectedItem).moldCount].filter((v, idx, arr) => arr.indexOf(v) === idx && v > 0).map(val => o.jsx("button", {
                key: val,
                type: "button",
                onClick: () => setTargetPcsStr(String(val)),
                style: {
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  background: targetPcsStr === String(val) ? "var(--brand-500)" : "rgba(255, 255, 255, 0.06)",
                  color: targetPcsStr === String(val) ? "#fff" : "var(--text-secondary)",
                  border: "1px solid",
                  borderColor: targetPcsStr === String(val) ? "var(--brand-500)" : "var(--border-subtle)",
                  cursor: "pointer"
                },
                children: val === (selectedItem.moldCount || lt(selectedItem).moldCount) ? "Fleet Max (" + val + " pcs)" : "+" + val + " pcs"
              }))
            ]
          }),

          // Simulation Results Box
          simData && o.jsxs("div", {
            style: {
              background: "var(--bg-surface)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            },
            children: [
              // Fleet capacity line
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" },
                children: [
                  o.jsxs("div", {
                    children: [
                      o.jsx("span", { style: { fontSize: "11.5px", color: "var(--text-muted)" }, children: "Physical Fleet Size:" }),
                      o.jsxs("strong", { style: { fontSize: "14px", color: "#f8fafc", marginLeft: "6px" }, children: [simData.moldCount, " molds (", simData.spec.size || "Standard", ")"] })
                    ]
                  }),
                  o.jsxs("span", {
                    className: "badge " + (simData.isOverOneCycle ? "badge-warning" : "badge-success"),
                    style: { fontSize: "11.5px", padding: "4px 10px", fontWeight: 700 },
                    children: [
                      simData.cyclesNeeded,
                      " Casting ",
                      simData.cyclesNeeded === 1 ? "Cycle (1 Day)" : "Cycles (" + simData.cyclesNeeded + " Days)"
                    ]
                  })
                ]
              }),

              // Alert Banner
              simData.isOverOneCycle ? o.jsxs("div", {
                style: {
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  color: "#fbbf24",
                  fontSize: "12px",
                  lineHeight: 1.4
                },
                children: [
                  "⚠️ Target of ",
                  o.jsx("strong", { children: simData.pcs + " pcs" }),
                  " exceeds 1-day mold fleet capacity (",
                  simData.moldCount,
                  " molds). Production requires ",
                  o.jsx("strong", { children: simData.cyclesNeeded + " daily cycles / curing days" }),
                  "."
                ]
              }) : o.jsxs("div", {
                style: {
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#34d399",
                  fontSize: "12px"
                },
                children: [
                  "✅ Target fits within a single day's mold fleet (",
                  simData.utilizationPct,
                  "% 1-day mold utilization)."
                ]
              }),

              // Raw Materials Needed Section
              o.jsxs("div", {
                children: [
                  o.jsxs("div", {
                    style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" },
                    children: [
                      "🏗️ Raw Materials Needed for ",
                      simData.pcs,
                      " pcs ",
                      simData.totalSqm ? "(" + simData.totalSqm + " sqm)" : "",
                      ":"
                    ]
                  }),
                  o.jsxs("div", {
                    style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" },
                    children: [
                      o.jsxs("div", {
                        style: { background: "var(--bg-input)", padding: "10px", borderRadius: "6px" },
                        children: [
                          o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block" }, children: "Cement" }),
                          o.jsxs("strong", { style: { fontSize: "14px", color: "var(--brand-400)", fontFamily: "var(--font-mono)" }, children: [simData.materials.cementBags, " bags"] }),
                          o.jsxs("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginTop: "2px" }, children: ["Wastani: ", simData.wastani, " pcs/bag"] })
                        ]
                      }),
                      o.jsxs("div", {
                        style: { background: "var(--bg-input)", padding: "10px", borderRadius: "6px" },
                        children: [
                          o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block" }, children: "Sand" }),
                          o.jsxs("strong", { style: { fontSize: "14px", color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [simData.materials.sandBuckets, " buckets"] }),
                          o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginTop: "2px" }, children: "Ndoo za mchanga" })
                        ]
                      }),
                      o.jsxs("div", {
                        style: { background: "var(--bg-input)", padding: "10px", borderRadius: "6px" },
                        children: [
                          o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block" }, children: "Chipping / Kokoto" }),
                          o.jsxs("strong", { style: { fontSize: "14px", color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [simData.materials.chippingBuckets, " buckets"] }),
                          o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", display: "block", marginTop: "2px" }, children: "Kokoto safi" })
                        ]
                      })
                    ]
                  })
                ]
              }),

              // Direct Action: Start Batch Production with this Product!
              o.jsxs("button", {
                type: "button",
                onClick: () => onStartProduction(simData.item.id),
                className: "btn btn-primary",
                style: { width: "100%", padding: "10px 16px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "4px" },
                children: [
                  o.jsx(fc, { size: 16 }),
                  o.jsxs("span", { children: ["Open Batch Production Form for ", simData.item.name] })
                ]
              })
            ]
          })
        ]
      }),

      // Factory Mold Fleet Reference Directory
      o.jsxs("div", {
        className: "card",
        style: { padding: "16px", display: "flex", flexDirection: "column", gap: "12px" },
        children: [
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" },
            children: [
              o.jsxs("h3", { style: { fontSize: "15px", fontWeight: 800, margin: 0, color: "#f8fafc" }, children: ["Factory Mold Fleet Directory (", a.length, " Products)"] }),
              o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: "Stumarcot Precast Molds Master" })
            ]
          }),

          // Search and Category Tabs
          o.jsxs("div", {
            style: { display: "flex", flexDirection: "column", gap: "8px" },
            children: [
              o.jsxs("div", {
                className: "search-wrapper",
                children: [
                  o.jsx(ii, { className: "search-icon", size: 15 }),
                  o.jsx("input", {
                    type: "text",
                    className: "input-field search-input",
                    placeholder: "Search mold catalog by product or category...",
                    value: searchQuery,
                    onChange: e => setSearchQuery(e.target.value)
                  })
                ]
              }),
              o.jsx("div", {
                style: { display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" },
                children: categories.map(cat => o.jsx("button", {
                  key: cat,
                  type: "button",
                  onClick: () => setCategoryFilter(cat),
                  style: {
                    padding: "3px 9px",
                    borderRadius: "16px",
                    fontSize: "11px",
                    fontWeight: 600,
                    border: "1px solid",
                    borderColor: categoryFilter === cat ? "var(--brand-500)" : "var(--border-subtle)",
                    background: categoryFilter === cat ? "rgba(249, 115, 22, 0.15)" : "var(--bg-input)",
                    color: categoryFilter === cat ? "var(--brand-400)" : "var(--text-secondary)",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  },
                  children: cat
                }))
              })
            ]
          }),

          // Mold Fleet List
          o.jsx("div", {
            style: { display: "flex", flexDirection: "column", gap: "8px", maxHeight: "380px", overflowY: "auto" },
            children: filteredItems.map(item => {
              const spec = lt(item);
              const mCount = item.moldCount || spec.moldCount || 0;
              const wastani = item.wastani_per_bag || spec.wastaniPcsPerBag || 50;

              return o.jsxs("div", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "var(--bg-surface-elevated)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "13px"
                },
                children: [
                  o.jsxs("div", {
                    children: [
                      o.jsxs("div", {
                        style: { display: "flex", alignItems: "center", gap: "6px" },
                        children: [
                          o.jsx("strong", { style: { color: "#f8fafc" }, children: item.name }),
                          o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "10px", padding: "1px 5px" }, children: item.category })
                        ]
                      }),
                      o.jsxs("div", {
                        style: { fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" },
                        children: [
                          spec.size ? "Size: " + spec.size + " • " : "",
                          "Wastani: ",
                          o.jsx("span", { style: { color: "var(--brand-400)", fontFamily: "var(--font-mono)" }, children: wastani + " pcs/bag" })
                        ]
                      })
                    ]
                  }),
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "8px" },
                    children: [
                      o.jsxs("span", {
                        className: "badge badge-neutral",
                        style: { fontSize: "11.5px", padding: "3px 8px", fontFamily: "var(--font-mono)", fontWeight: 700 },
                        children: [mCount, " molds"]
                      }),
                      o.jsx("button", {
                        type: "button",
                        onClick: () => {
                          setSelectedProductId(item.id);
                          setTargetPcsStr(String(mCount || 200));
                        },
                        style: {
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: "rgba(56, 189, 248, 0.12)",
                          border: "1px solid rgba(56, 189, 248, 0.3)",
                          color: "#38bdf8",
                          cursor: "pointer"
                        },
                        children: "Simulate"
                      })
                    ]
                  })
                ]
              }, item.id);
            })
          })
        ]
      })
    ]
  });
};
`;

new vm.Script(code);
console.log('✓ ProductionCapacityPlannerView syntax validation passed!');
