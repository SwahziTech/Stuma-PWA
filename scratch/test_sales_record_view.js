const vm = require('vm');

const code = `
const DashboardSalesRecordView = ({ movements: mv, items: d, onNavigate: s }) => {
  const [search, setSearch] = B.useState("");
  const [dateFilter, setDateFilter] = B.useState("all");

  const todayStr = B.useMemo(() => new Date().toISOString().split("T")[0], []);
  
  const salesMovements = B.useMemo(() => {
    return (mv || [])
      .filter(m => m.type === "dispatch_out" || m.type === "sale_out")
      .sort((A, B_item) => (B_item.date || "").localeCompare(A.date || "") || (B_item.id || 0) - (A.id || 0));
  }, [mv]);

  const todayRecords = B.useMemo(() => salesMovements.filter(m => m.date === todayStr), [salesMovements, todayStr]);
  const todayRevenue = B.useMemo(() => {
    return todayRecords.reduce((acc, m) => acc + (m.total_price || (m.price_per_unit ? m.price_per_unit * Math.abs(m.quantity_pcs || m.delta || 0) : 0)), 0);
  }, [todayRecords]);
  const todayPcs = B.useMemo(() => {
    return todayRecords.reduce((acc, m) => acc + Math.abs(m.quantity_pcs || m.delta || 0), 0);
  }, [todayRecords]);
  const todaySqm = B.useMemo(() => {
    return todayRecords.reduce((acc, m) => acc + (m.quantity_sqm || 0), 0);
  }, [todayRecords]);

  const filteredSales = B.useMemo(() => {
    const now = new Date();
    return salesMovements.filter(m => {
      if (dateFilter === "today" && m.date !== todayStr) return false;
      if (dateFilter === "week") {
        const dObj = new Date(m.date);
        const diffDays = (now - dObj) / (1000 * 60 * 60 * 24);
        if (diffDays > 7 || diffDays < 0) return false;
      }
      if (dateFilter === "month") {
        if (!m.date || m.date.slice(0, 7) !== todayStr.slice(0, 7)) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const item = d.find(it => it.id === m.item_id);
        const itemName = item ? item.name.toLowerCase() : "";
        const customer = (m.customer_name || "").toLowerCase();
        const phone = (m.customer_phone || "").toLowerCase();
        const note = (m.note || "").toLowerCase();
        return customer.includes(q) || phone.includes(q) || note.includes(q) || itemName.includes(q);
      }
      return true;
    });
  }, [salesMovements, dateFilter, search, todayStr, d]);

  return o.jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: "14px" },
    children: [
      o.jsxs("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" },
        children: [
          o.jsxs("div", {
            children: [
              o.jsx("h2", { style: { fontSize: "17px", fontWeight: 800, color: "#f8fafc", margin: 0 }, children: "Sales & Dispatch Records" }),
              o.jsx("p", { style: { fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }, children: "Customer shipments, dispatches & revenue ledger" })
            ]
          }),
          o.jsxs("button", {
            type: "button",
            onClick: () => s("sales"),
            className: "btn btn-primary btn-sm",
            style: { display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 12px rgba(249, 115, 22, 0.35)", padding: "7px 14px", borderRadius: "8px", fontWeight: 700 },
            children: [
              o.jsx(Ka, { size: 14 }),
              o.jsx("span", { children: "+ Record New Sale" })
            ]
          })
        ]
      }),
      o.jsxs("div", {
        style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" },
        children: [
          o.jsxs("div", {
            className: "card-elevated",
            style: { padding: "12px", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12), var(--bg-surface))", border: "1px solid rgba(16, 185, 129, 0.25)" },
            children: [
              o.jsx("span", { style: { fontSize: "10px", color: "#34d399", fontWeight: 700, textTransform: "uppercase", display: "block" }, children: "Today's Revenue" }),
              o.jsxs("div", { style: { fontSize: "16px", fontWeight: 800, color: "#10b981", marginTop: "4px" }, children: ["TZS ", todayRevenue.toLocaleString()] }),
              o.jsxs("span", { style: { fontSize: "10.5px", color: "var(--text-muted)" }, children: [todayRecords.length, " dispatches today"] })
            ]
          }),
          o.jsxs("div", {
            className: "card-elevated",
            style: { padding: "12px", background: "linear-gradient(135deg, rgba(56, 189, 248, 0.12), var(--bg-surface))", border: "1px solid rgba(56, 189, 248, 0.25)" },
            children: [
              o.jsx("span", { style: { fontSize: "10px", color: "#38bdf8", fontWeight: 700, textTransform: "uppercase", display: "block" }, children: "Today's Volume" }),
              o.jsxs("div", { style: { fontSize: "16px", fontWeight: 800, color: "#38bdf8", marginTop: "4px" }, children: [todayPcs.toLocaleString(), " pcs"] }),
              o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)" }, children: todaySqm > 0 ? todaySqm.toFixed(1) + " sqm" : "Precast volume" })
            ]
          }),
          o.jsxs("div", {
            className: "card-elevated",
            style: { padding: "12px", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" },
            children: [
              o.jsx("span", { style: { fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", display: "block" }, children: "All-Time Dispatches" }),
              o.jsxs("div", { style: { fontSize: "16px", fontWeight: 800, color: "#f8fafc", marginTop: "4px" }, children: [salesMovements.length, " Records"] }),
              o.jsx("span", { style: { fontSize: "10.5px", color: "var(--brand-400)" }, children: "Verified in ledger" })
            ]
          })
        ]
      }),
      o.jsxs("div", {
        className: "card",
        style: { padding: "12px", display: "flex", flexDirection: "column", gap: "10px" },
        children: [
          o.jsxs("div", {
            style: { display: "flex", gap: "8px", position: "relative" },
            children: [
              o.jsxs("div", {
                className: "search-wrapper",
                style: { flex: 1 },
                children: [
                  o.jsx(ii, { className: "search-icon", size: 16 }),
                  o.jsx("input", {
                    type: "text",
                    className: "input-field search-input",
                    placeholder: "Search customer, destination, phone, product...",
                    value: search,
                    onChange: e => setSearch(e.target.value)
                  })
                ]
              }),
              search ? o.jsx("button", {
                type: "button",
                onClick: () => setSearch(""),
                className: "btn-ghost",
                style: { padding: "6px 10px", fontSize: "12px", color: "var(--text-muted)" },
                children: "Clear"
              }) : null
            ]
          }),
          o.jsxs("div", {
            style: { display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" },
            children: [
              { id: "all", label: "All Dispatches" },
              { id: "today", label: "Today" },
              { id: "week", label: "Last 7 Days" },
              { id: "month", label: "This Month" }
            ].map(f => o.jsx("button", {
              key: f.id,
              type: "button",
              onClick: () => setDateFilter(f.id),
              style: {
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "11.5px",
                fontWeight: 600,
                border: "1px solid",
                borderColor: dateFilter === f.id ? "var(--brand-500)" : "var(--border-subtle)",
                background: dateFilter === f.id ? "rgba(249, 115, 22, 0.15)" : "var(--bg-input)",
                color: dateFilter === f.id ? "var(--brand-400)" : "var(--text-secondary)",
                cursor: "pointer",
                whiteSpace: "nowrap"
              },
              children: f.label
            }))
          })
        ]
      }),
      filteredSales.length === 0 ? o.jsxs("div", {
        className: "card",
        style: { padding: "32px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
        children: [
          o.jsx("div", { style: { fontSize: "36px" }, children: "📦" }),
          o.jsx("div", { style: { fontSize: "15px", fontWeight: 700, color: "#f8fafc" }, children: "No sales records found" }),
          o.jsx("p", { style: { fontSize: "12.5px", color: "var(--text-muted)", maxWidth: "340px", margin: 0 }, children: search ? "No dispatches matched your search criteria. Try a different query." : "No sales logged for the selected timeframe. Record client dispatches to track deliveries." }),
          o.jsxs("button", {
            type: "button",
            onClick: () => s("sales"),
            className: "btn btn-primary btn-sm",
            style: { marginTop: "6px" },
            children: [
              o.jsx(Ka, { size: 14 }),
              o.jsx("span", { children: "Record New Sale" })
            ]
          })
        ]
      }) : o.jsx("div", {
        style: { display: "flex", flexDirection: "column", gap: "8px" },
        children: filteredSales.map(sale => {
          const catItem = d.find(it => it.id === sale.item_id);
          const pcs = Math.abs(sale.quantity_pcs || sale.delta || 0);
          const amount = sale.total_price || (sale.price_per_unit ? sale.price_per_unit * pcs : 0);
          const colorName = sale.color || (sale.note && sale.note.includes("Color:") ? sale.note.split("Color:")[1].split("|")[0].trim() : "");

          return o.jsxs("div", {
            className: "card-elevated",
            style: { padding: "12px 14px", border: "1px solid var(--border-subtle)", background: "var(--bg-surface-elevated)", display: "flex", flexDirection: "column", gap: "8px" },
            children: [
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" },
                children: [
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "8px" },
                    children: [
                      o.jsx("span", { style: { fontWeight: 800, fontSize: "14px", color: "#f8fafc" }, children: sale.customer_name || "Direct Customer" }),
                      sale.customer_phone ? o.jsx("span", {
                        style: { fontSize: "11px", color: "var(--brand-400)", fontFamily: "var(--font-mono)", background: "rgba(249, 115, 22, 0.1)", padding: "1px 6px", borderRadius: "4px" },
                        children: sale.customer_phone
                      }) : null
                    ]
                  }),
                  o.jsx("span", {
                    style: { fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" },
                    children: sale.date || todayStr
                  })
                ]
              }),
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", background: "var(--bg-input)", padding: "8px 10px", borderRadius: "6px" },
                children: [
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" },
                    children: [
                      o.jsx("strong", { style: { fontSize: "13px", color: "#f8fafc" }, children: catItem ? catItem.name : "Precast Item" }),
                      catItem ? o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "10px", padding: "1px 5px" }, children: catItem.category }) : null,
                      colorName ? o.jsxs("span", {
                        className: "badge",
                        style: { fontSize: "10px", padding: "1px 6px", background: "rgba(255,255,255,0.08)", color: "#f8fafc", display: "inline-flex", alignItems: "center", gap: "4px" },
                        children: [
                          o.jsx("span", { style: { width: "6px", height: "6px", borderRadius: "50%", background: colorName === "Red" ? "#ef4444" : colorName === "Yellow" ? "#eab308" : colorName === "Black" ? "#475569" : "#94a3b8" } }),
                          colorName
                        ]
                      }) : null
                    ]
                  }),
                  o.jsxs("div", {
                    style: { textAlign: "right" },
                    children: [
                      o.jsxs("div", { style: { fontSize: "14px", fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono)" }, children: ["TZS ", amount > 0 ? amount.toLocaleString() : "—"] }),
                      o.jsxs("div", { style: { fontSize: "11.5px", color: "var(--text-secondary)", fontWeight: 700 }, children: [pcs.toLocaleString(), " pcs", sale.quantity_sqm ? " • " + sale.quantity_sqm + " sqm" : ""] })
                    ]
                  })
                ]
              }),
              sale.note ? o.jsx("div", {
                style: { fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
                children: sale.note
              }) : null
            ]
          }, sale.id || (sale.batch_id + "_" + sale.item_id));
        })
      })
    ]
  });
};
`;

new vm.Script(code);
console.log('✓ DashboardSalesRecordView syntax validation passed!');
