const fs = require('fs');
const vm = require('vm');

let child1 = fs.readFileSync('scratch/child1_critical.js', 'utf8');
let child2 = fs.readFileSync('scratch/child2_velocity.js', 'utf8');
let child4 = fs.readFileSync('scratch/child4_catalog.js', 'utf8');

// Replace oe with filteredOe in child1
child1 = child1.replace(/oe\.length/g, 'filteredOe.length').replace(/oe\.map/g, 'filteredOe.map');

// Replace G with filteredG in child2
// Notice child2 starts with: G.length>0&&o.jsxs("div" ...
// We want it conditioned on k === "high_velocity"
if (child2.startsWith('G.length>0&&')) {
  child2 = child2.slice('G.length>0&&'.length);
}
child2 = child2.replace(/G\.length/g, 'filteredG.length').replace(/G\.map/g, 'filteredG.map');

// Construct Child 3 (Search + Filter Button + Category Tabs)
const child3WithFilter = `o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[
  filterMenuOpen&&o.jsx("div",{style:{position:"fixed",inset:0,zIndex:55},onClick:()=>setFilterMenuOpen(!1)}),
  o.jsxs("div",{style:{display:"flex",gap:"8px",position:"relative"},children:[
    o.jsxs("div",{className:"search-wrapper",style:{flex:1},children:[
      o.jsx(ii,{className:"search-icon",size:17}),
      o.jsx("input",{
        type:"text",
        className:"input-field search-input",
        placeholder:k==="critical"?"Search critical low stock...":k==="high_velocity"?"Search operational drivers...":"Search product (e.g. Chuchu, Buibui, 600R)...",
        value:b,
        onChange:z=>w(z.target.value)
      }),
      b&&o.jsx("button",{className:"search-clear",onClick:()=>w(""),title:"Clear search",children:"✕"})
    ]}),
    o.jsxs("div",{style:{position:"relative"},children:[
      o.jsxs("button",{
        type:"button",
        onClick:()=>setFilterMenuOpen(!filterMenuOpen),
        className:"btn " + (k!=="general"?"btn-primary":"btn-secondary"),
        style:{
          height:"44px",
          minHeight:"44px",
          padding:"0 12px",
          fontSize:"12.5px",
          display:"flex",
          alignItems:"center",
          gap:"6px",
          borderRadius:"var(--radius-md)",
          border:filterMenuOpen?"1px solid var(--brand-500)":(k!=="general"?"1px solid var(--brand-400)":"1px solid var(--border-subtle)"),
          boxShadow:k!=="general"?"0 0 12px rgba(249, 115, 22, 0.4)":"none"
        },
        title:"Filter Catalog View",
        children:[
          o.jsx(Kp,{size:16}),
          o.jsx("span",{style:{fontWeight:700,fontSize:"12px",display:"inline-block",maxWidth:"90px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:k==="critical"?"Critical":k==="high_velocity"?"High-Velocity":"Filter"}),
          o.jsx("span",{style:{fontSize:"10px",opacity:0.8},children:filterMenuOpen?"▲":"▼"})
        ]
      }),
      filterMenuOpen&&o.jsxs("div",{
        style:{
          position:"absolute",
          right:0,
          top:"50px",
          width:"290px",
          backgroundColor:"var(--bg-surface-card)",
          border:"1px solid rgba(249, 115, 22, 0.4)",
          borderRadius:"12px",
          boxShadow:"0 20px 40px rgba(0,0,0,0.85)",
          zIndex:60,
          padding:"8px",
          display:"flex",
          flexDirection:"column",
          gap:"5px"
        },
        children:[
          o.jsx("div",{style:{fontSize:"11px",fontWeight:700,textTransform:"uppercase",color:"var(--text-muted)",padding:"4px 8px"},children:"Filter Catalog View"}),
          [
            {id:"general",label:"General Inventory ",icon:"📦",count:ue.length,desc:"Full catalog & structural sizes"},
            {id:"critical",label:"Critical Replenishment Alert",icon:"⚠️",count:filteredOe.length,desc:"Pinned items below safety reorder threshold",color:"#f87171"},
            {id:"high_velocity",label:"High-Velocity Operational Drivers",icon:"⚡",count:filteredG.length,desc:"Ranked by turnover & factory throughput",color:"var(--brand-400)"}
          ].map(opt=>o.jsxs("button",{
            key:opt.id,
            type:"button",
            onClick:()=>{A(opt.id);setFilterMenuOpen(!1);},
            style:{
              textAlign:"left",
              padding:"8px 10px",
              borderRadius:"8px",
              border:k===opt.id?"1px solid var(--brand-500)":"1px solid transparent",
              background:k===opt.id?"rgba(249, 115, 22, 0.2)":"transparent",
              color:"#f8fafc",
              cursor:"pointer",
              display:"flex",
              alignItems:"flex-start",
              justifyContent:"space-between",
              gap:"8px"
            },
            children:[
              o.jsxs("div",{
                style:{display:"flex",flexDirection:"column",gap:"2px"},
                children:[
                  o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",fontSize:"12.5px",fontWeight:700,color:opt.color||"#f8fafc"},children:[o.jsx("span",{children:opt.icon}),opt.label]}),
                  o.jsx("span",{style:{fontSize:"10.5px",color:"var(--text-muted)"},children:opt.desc})
                ]
              }),
              o.jsxs("div",{
                style:{display:"flex",alignItems:"center",gap:"4px"},
                children:[
                  o.jsx("span",{className:"badge badge-neutral",style:{fontSize:"10px",padding:"1px 5px",background:opt.id==="critical"&&opt.count>0?"rgba(239, 68, 68, 0.25)":void 0,color:opt.id==="critical"&&opt.count>0?"#f87171":void 0},children:opt.count}),
                  k===opt.id&&o.jsx("span",{style:{color:"var(--brand-400)",fontWeight:900,fontSize:"13px"},children:"✓"})
                ]
              })
            ]
          }))
        ]
      })
    ]})
  ]}),
  o.jsx("div",{className:"filter-tabs",children:Pe.map(z=>o.jsx("button",{key:z,onClick:()=>j(z),className:"filter-tab " + (E===z?"active":""),children:z}))})
]})`;

const filterBanner = `k!=="general"&&o.jsxs("div",{
  style:{
    display:"flex",
    alignItems:"center",
    justifyContent:"space-between",
    padding:"6px 12px",
    borderRadius:"8px",
    background:k==="critical"?"rgba(239, 68, 68, 0.15)":"rgba(249, 115, 22, 0.15)",
    border:k==="critical"?"1px solid rgba(239, 68, 68, 0.3)":"1px solid rgba(249, 115, 22, 0.3)"
  },
  children:[
    o.jsxs("span",{
      style:{fontSize:"12px",fontWeight:700,color:k==="critical"?"#f87171":"var(--brand-400)"},
      children:[k==="critical"?"⚠️ Filtered by: Critical Replenishment Alert":"⚡ Filtered by: High-Velocity Operational Drivers"]
    }),
    o.jsxs("button",{
      type:"button",
      onClick:()=>A("general"),
      className:"btn btn-ghost btn-sm",
      style:{fontSize:"11px",padding:"2px 8px",height:"22px",minHeight:"22px",color:"#f8fafc"},
      children:["General Inventory ✕"]
    })
  ]
})`;

// Assemble complete new inventory block
const assembled = `L==="inventory"&&o.jsxs(o.Fragment,{children:[
  ${child3WithFilter},
  ${filterBanner},
  k==="general"&&${child4},
  k==="critical"&&${child1},
  k==="high_velocity"&&${child2}
]})`;

try {
  new vm.Script('function test() { return (' + assembled + '); }');
  console.log('✓ ASSEMBLED INVENTORY BLOCK IS 100% VALID JAVASCRIPT!');
  fs.writeFileSync('scratch/assembled_inventory.js', assembled);
} catch (e) {
  console.error('✗ Assembly error:', e);
}
