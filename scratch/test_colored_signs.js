const fs = require('fs');
const vm = require('vm');

const buttonCode = `o.jsxs("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    alignItems: "flex-end",
    flexShrink: 0,
    marginLeft: "auto"
  },
  children: [
    o.jsxs("button", {
      type: "button",
      onClick: () => s("production", T.id),
      style: {
        padding: "2px 7px",
        fontSize: "10px",
        height: "20px",
        minHeight: "20px",
        borderRadius: "4px",
        display: "inline-flex",
        alignItems: "center",
        fontWeight: 600,
        lineHeight: "1",
        background: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        color: "#f8fafc",
        cursor: "pointer"
      },
      title: "Log production for " + T.name,
      children: [
        o.jsx("span", { style: { color: "#22c55e", fontWeight: 800, marginRight: "2px", fontSize: "11px" }, children: "+" }),
        "Produce"
      ]
    }),
    o.jsxs("button", {
      type: "button",
      onClick: () => s("sales", T.id),
      style: {
        padding: "2px 7px",
        fontSize: "10px",
        height: "20px",
        minHeight: "20px",
        borderRadius: "4px",
        display: "inline-flex",
        alignItems: "center",
        fontWeight: 600,
        lineHeight: "1",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        color: "#cbd5e1",
        cursor: "pointer"
      },
      title: "Record sale for " + T.name,
      children: [
        o.jsx("span", { style: { color: "#ef4444", fontWeight: 800, marginRight: "2px", fontSize: "11px" }, children: "-" }),
        "Sell"
      ]
    })
  ]
})`;

try {
  new vm.Script('function test() { return (' + buttonCode + '); }');
  console.log('✓ Colored sign button JSX syntax is 100% valid!');
} catch (e) {
  console.error('✗ Syntax error:', e);
}
