const fs = require('fs');
const vm = require('vm');

console.log('--- Refactoring Finished Goods view in DASHBOARD TAB (x1) ---');

let bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// 1. Locate state definitions in x1
// Currently: '[k,A]=B.useState(!1),'
const stateAnchor = '[k,A]=B.useState(!1),';
const stateIdx = bundle.indexOf(stateAnchor);
if (stateIdx === -1) {
  throw new Error('Could not find [k,A]=B.useState(!1), in x1');
}

// Replace [k,A]=B.useState(!1), with [k,A]=B.useState("general"),[filterMenuOpen,setFilterMenuOpen]=B.useState(!1),
const newState = '[k,A]=B.useState("general"),[filterMenuOpen,setFilterMenuOpen]=B.useState(!1),';
bundle = bundle.slice(0, stateIdx) + newState + bundle.slice(stateIdx + stateAnchor.length);
console.log('✓ Updated filter state in x1 to support "general", "critical", "high_velocity"');

// 2. Also add filteredOe and filteredG computations inside x1
// Find where ue is defined:
const ueAnchor = 'ue=B.useMemo(()=>t.filter(T=>{const N=E==="All"||T.item.category===E,S=T.item.name.toLowerCase().includes(b.toLowerCase())||T.item.category.toLowerCase().includes(b.toLowerCase());return N&&S}).sort((T,N)=>{if(k){if(T.is_low_stock&&!N.is_low_stock)return-1;if(!T.is_low_stock&&N.is_low_stock)return 1}const S=hn(T.item),D=hn(N.item);return S!==D?S-D:T.item.name.localeCompare(N.item.name)}),[t,E,b,k]),';
const ueIdx = bundle.indexOf(ueAnchor);
if (ueIdx === -1) {
  throw new Error('Could not find ue definition in x1');
}

const newUeAndFilteredLists = `ue=B.useMemo(()=>t.filter(T=>{const N=E==="All"||T.item.category===E,S=T.item.name.toLowerCase().includes(b.toLowerCase())||T.item.category.toLowerCase().includes(b.toLowerCase());return N&&S}).sort((T,N)=>{const S=hn(T.item),D=hn(N.item);return S!==D?S-D:T.item.name.localeCompare(N.item.name)}),[t,E,b]),filteredOe=B.useMemo(()=>oe.filter(T=>{const N=E==="All"||T.item.category===E,S=T.item.name.toLowerCase().includes(b.toLowerCase())||T.item.category.toLowerCase().includes(b.toLowerCase());return N&&S}),[oe,E,b]),filteredG=B.useMemo(()=>G.filter(T=>{const N=E==="All"||T.item.category===E,S=T.item.name.toLowerCase().includes(b.toLowerCase())||T.item.category.toLowerCase().includes(b.toLowerCase());return N&&S}),[G,E,b]),`;

bundle = bundle.slice(0, ueIdx) + newUeAndFilteredLists + bundle.slice(ueIdx + ueAnchor.length);
console.log('✓ Updated ue sort and added filteredOe and filteredG in x1');

// 3. Locate L==="inventory"&&o.jsxs(o.Fragment,{children:[ ... ]})
const invStartAnchor = 'L==="inventory"&&o.jsxs(o.Fragment,{children:[';
const invStartIdx = bundle.indexOf(invStartAnchor);
if (invStartIdx === -1) {
  throw new Error('Could not find L==="inventory"&& in bundle');
}

const openParenIdx = bundle.indexOf('(', invStartIdx);
let depth = 0;
let invEndIdx = -1;
for (let i = openParenIdx; i < bundle.length; i++) {
  if (bundle[i] === '(') depth++;
  else if (bundle[i] === ')') {
    depth--;
    if (depth === 0) {
      invEndIdx = i + 1;
      break;
    }
  }
}

if (invEndIdx === -1) {
  throw new Error('Could not find end of L==="inventory" block');
}

console.log('L===inventory found from index', invStartIdx, 'to', invEndIdx);

// Now construct the new refactored L==="inventory" block where:
// - Search bar + Filter button + Category tabs are ALWAYS AT THE TOP, right below Finished Goods
// - The filter button filters by "General Inventory ", "Critical Replenishment Alert", "High-Velocity Operational Drivers"
// - Based on the active filter (k), the corresponding catalog card/view is rendered right below
const newInventoryJSX = `L==="inventory"&&o.jsxs(o.Fragment,{children:[
  // Top: Search Bar + Filter Button (Filters by "General Inventory ", "Critical Replenishment Alert", "High-Velocity Operational Drivers")
  o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[
    filterMenuOpen&&o.jsx("div",{style:{position:"fixed",inset:0,zIndex:55},onClick:()=>setFilterMenuOpen(!1)}),
    o.jsxs("div",{style:{display:"flex",gap:"8px",position:"relative"},children:[
      o.jsxs("div",{className:"search-wrapper",style:{flex:1},children:[
        o.jsx(ii,{className:"search-icon",size:17}),
        o.jsx("input",{type:"text",className:"input-field search-input",placeholder:k==="critical"?"Search critical low stock...":k==="high_velocity"?"Search operational drivers...":"Search product (e.g. Chuchu, Buibui, 600R)...",value:b,onChange:z=>w(z.target.value)}),
        b&&o.jsx("button",{className:"search-clear",onClick:()=>w(""),title:"Clear search",children:"✕"})
      ]}),
      o.jsxs("div",{style:{position:"relative"},children:[
        o.jsxs("button",{
          type:"button",
          onClick:()=>setFilterMenuOpen(!filterMenuOpen),
          className:\`btn \${k!=="general"?"btn-primary":"btn-secondary"}\`,
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
          title:\`Filter by: \${k==="critical"?"Critical Replenishment Alert":k==="high_velocity"?"High-Velocity Operational Drivers":"General Inventory "}\`,
          children:[
            o.jsx(Kp,{size:16}),
            o.jsx("span",{style:{fontWeight:700,fontSize:"12px",display:"inline-block",maxWidth:"90px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:k==="critical"?"Critical":k==="high_velocity"?"High-Velocity":"Filter"}),
            o.jsx("span",{style:{fontSize:"10px",opacity:.8},children:filterMenuOpen?"▲":"▼"})
          ]
        }),
        filterMenuOpen&&o.jsxs("div",{
          style:{
            position:"absolute",
            right:0,
            top:"50px",
            width:"285px",
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
              {id:"critical",label:"Critical Replenishment Alert",icon:"⚠️",count:oe.length,desc:"Pinned items below safety reorder threshold",color:"#f87171"},
              {id:"high_velocity",label:"High-Velocity Operational Drivers",icon:"⚡",count:G.length,desc:"Ranked by turnover & factory throughput",color:"var(--brand-400)"}
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
                gap:"8px",
                transition:"all 0.15s ease"
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
                    k===opt.id&&o.jsx(Gp,{size:14,color:"var(--brand-400)"})
                  ]
                })
              ]
            }))
          ]
        })
      ]
    })
  ]}),
  // Category Tabs
  o.jsx("div",{className:"filter-tabs",children:Pe.map(z=>o.jsx("button",{onClick:()=>j(z),className:\`filter-tab \${E===z?"active":""}\`,children:z},z))}),
  
  // Active Filter Banner (When not in General Inventory)
  k!=="general"&&o.jsxs("div",{
    style:{
      display:"flex",
      alignItems:"center",
      justifyContent:"space-between",
      padding:"6px 12px",
      borderRadius:"8px",
      background:k==="critical"?"rgba(239, 68, 68, 0.15)":"rgba(249, 115, 22, 0.15)",
      border:\`1px solid \${k==="critical"?"rgba(239, 68, 68, 0.3)":"rgba(249, 115, 22, 0.3)"}\`
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
  }),

  // VIEW 1: GENERAL INVENTORY CATALOG (Always at top just below finished goods)
  k==="general"&&o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[
    o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 4px"},children:[
      o.jsxs("span",{style:{fontSize:"13px",fontWeight:700,color:"var(--text-secondary)"},children:["General Inventory Catalog (",ue.length,")"]}),
      o.jsx("span",{style:{fontSize:"11px",color:"var(--brand-400)",fontWeight:600},children:"Structural Size (Smallest → Largest)"})
    ]}),
    ue.length===0?o.jsxs("div",{className:"card",style:{textAlign:"center",padding:"36px 16px",color:"var(--text-muted)"},children:[
      o.jsx($a,{size:32,style:{margin:"0 auto 8px auto",opacity:.5}}),
      o.jsx("div",{style:{fontSize:"14.5px",fontWeight:600,color:"var(--text-secondary)"},children:"No products found"}),
      o.jsx("div",{style:{fontSize:"12px",marginTop:"4px"},children:"Try adjusting your category filter or search query"})
    ]}):o.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"6px"},children:ue.map(z=>{
      const{item:T,total_pcs:N,total_sqm:S,is_low_stock:D,by_color:F}=z,Z=T.unit==="sqm",se=T.pcs_per_sqm!==null&&T.pcs_per_sqm>0,we=T.colors&&T.colors.length>0,V=lt(T),J=T.moldCount||V.moldCount||0;
      return o.jsxs("div",{className:"card",style:{padding:"12px 14px",borderColor:D?"rgba(245, 158, 11, 0.4)":void 0,background:D?"linear-gradient(180deg, rgba(245, 158, 11, 0.06), var(--bg-surface-card))":void 0},children:[
        o.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"10px",marginBottom:"8px"},children:[
          o.jsx("div",{children:o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap"},children:[
            o.jsx("span",{style:{fontSize:"15.5px",fontWeight:800,color:"#f8fafc"},children:T.name}),
            o.jsx("span",{className:"badge badge-neutral",style:{fontSize:"10.5px",padding:"1px 6px"},children:T.category}),
            o.jsxs("span",{style:{fontSize:"10.5px",color:"var(--text-muted)",background:"rgba(255,255,255,0.05)",padding:"1px 5px",borderRadius:"4px"},children:[J," molds"]}),
            D&&o.jsx("span",{className:"badge badge-warning",style:{fontSize:"10px",padding:"1px 5px"},children:"LOW"})
          ]})}),
          o.jsx("div",{style:{textAlign:"right",flexShrink:0},children:Z?se?o.jsxs("div",{children:[
            o.jsxs("span",{style:{fontSize:"18px",fontWeight:800,color:"var(--brand-400)"},children:[S==null?void 0:S.toFixed(2)," ",o.jsx("span",{style:{fontSize:"12px",fontWeight:600},children:"sqm"})]}),
            o.jsxs("div",{style:{fontSize:"11px",color:"var(--text-muted)",fontFamily:"var(--font-mono)"},children:["(",N," pcs)"]})
          ]}):o.jsxs("div",{children:[
            o.jsxs("span",{style:{fontSize:"18px",fontWeight:800,color:"#f8fafc"},children:[N," ",o.jsx("span",{style:{fontSize:"12px",fontWeight:600,color:"var(--text-secondary)"},children:"pcs"})]}),
            o.jsx("div",{style:{fontSize:"10px",color:"#fbbf24"},children:"sqm not set"})
          ]}):o.jsx("div",{children:o.jsxs("span",{style:{fontSize:"18px",fontWeight:800,color:"#f8fafc"},children:[N," ",o.jsx("span",{style:{fontSize:"12px",fontWeight:600,color:"var(--text-secondary)"},children:"pcs"})]})})
        ]}),
        o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px",flexWrap:"wrap",borderTop:"1px solid rgba(255, 255, 255, 0.05)",paddingTop:"8px"},children:[
          o.jsx("div",{style:{display:"flex",alignItems:"center",gap:"5px",flexWrap:"wrap",flex:1},children:we?T.colors.map(ie=>{const Ce=F[ie]||{pcs:0,sqm:null};return o.jsx(xr,{color:ie,countPcs:Ce.pcs,countSqm:se?Ce.sqm:null,size:"sm"},ie)}):o.jsxs("span",{style:{fontSize:"12px",color:"var(--text-muted)"},children:["Single variant: ",o.jsxs("strong",{style:{color:"#fff"},children:[N," pcs"]})]})}),
          o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"5px"},children:[
            o.jsxs("button",{onClick:()=>s("production",T.id),className:"btn btn-secondary btn-sm",style:{padding:"3px 8px",fontSize:"11.5px",height:"28px",minHeight:"28px",borderRadius:"6px",display:"flex",alignItems:"center",gap:"3px"},title:\`Log production for \${T.name}\`,children:[o.jsx(vr,{size:12,color:"var(--brand-400)"}),o.jsx("span",{children:"Produce"})]}),
            o.jsxs("button",{onClick:()=>s("sales",T.id),className:"btn btn-secondary btn-sm",style:{padding:"3px 8px",fontSize:"11.5px",height:"28px",minHeight:"28px",borderRadius:"6px",display:"flex",alignItems:"center",gap:"3px",color:"#f87171",borderColor:"rgba(239, 68, 68, 0.3)"},title:\`Record sale/deduction for \${T.name}\`,children:[o.jsx(pp,{size:12,color:"#f87171"}),o.jsx("span",{children:"Sell"})]})
          ]})
        ]})
      ]},T.id);
    })})
  ]}),

  // VIEW 2: CRITICAL REPLENISHMENT ALERT VIEW (When selected from filter button)
  k==="critical"&&o.jsxs("div",{className:"card-elevated",style:{padding:"16px",border:filteredOe.length>0?"1px solid rgba(239, 68, 68, 0.4)":"1px solid rgba(16, 185, 129, 0.3)",background:filteredOe.length>0?"linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(15, 23, 42, 0.8))":"linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.6))",borderRadius:"var(--radius-lg)"},children:[
    o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"},children:[
      o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[
        o.jsx("div",{style:{width:"28px",height:"28px",borderRadius:"8px",background:filteredOe.length>0?"rgba(239, 68, 68, 0.2)":"rgba(16, 185, 129, 0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:filteredOe.length>0?"#ef4444":"#10b981"},children:o.jsx(Cc,{size:16})}),
        o.jsxs("div",{children:[
          o.jsx("h3",{style:{fontSize:"14px",fontWeight:800,color:"#f8fafc",margin:0},children:"Critical Replenishment Alert"}),
          o.jsx("span",{style:{fontSize:"11px",color:"var(--text-muted)"},children:"Pinned items below factory safety reorder threshold"})
        ]})
      ]}),
      o.jsxs("span",{className:"badge",style:{background:filteredOe.length>0?"rgba(239, 68, 68, 0.2)":"rgba(16, 185, 129, 0.2)",color:filteredOe.length>0?"#f87171":"#34d399",border:\`1px solid \${filteredOe.length>0?"rgba(239, 68, 68, 0.4)":"rgba(16, 185, 129, 0.4)"}\`,fontSize:"11px",fontWeight:700,padding:"3px 8px"},children:[filteredOe.length," ",filteredOe.length===1?"Deficit":"Deficits"]})
    ]}),
    filteredOe.length===0?o.jsxs("div",{style:{padding:"12px",borderRadius:"8px",background:"rgba(16, 185, 129, 0.08)",display:"flex",alignItems:"center",gap:"8px",color:"#34d399",fontSize:"12.5px",fontWeight:600},children:[
      o.jsx(pn,{size:16}),
      o.jsx("span",{children:"All product inventories are currently sitting safely above reorder levels."})
    ]}):o.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:filteredOe.map(z=>{
      const{item:T,total_pcs:N,total_sqm:S}=z,D=T.unit==="sqm",F=T.reorder_level||100,Z=D&&S!==null?S:N,se=Math.max(0,F-Z);
      return o.jsxs("div",{style:{padding:"10px 12px",borderRadius:"8px",background:"rgba(0, 0, 0, 0.4)",border:"1px solid rgba(239, 68, 68, 0.3)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px",flexWrap:"wrap"},children:[
        o.jsxs("div",{children:[
          o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[
            o.jsx("span",{style:{fontWeight:800,fontSize:"14px",color:"#f8fafc"},children:T.name}),
            o.jsx("span",{className:"badge badge-neutral",style:{fontSize:"10px",padding:"1px 5px"},children:T.category})
          ]}),
          o.jsxs("div",{style:{fontSize:"11.5px",color:"#f87171",marginTop:"2px",fontWeight:600},children:["Current: ",Z," ",T.unit," · Min Threshold: ",F," ",T.unit," (Deficit: -",D?se.toFixed(1):se," ",T.unit,")"]})
        ]}),
        o.jsxs("button",{onClick:()=>s("production",T.id),className:"btn btn-primary btn-sm",style:{padding:"4px 10px",fontSize:"12px",height:"30px"},children:[
          o.jsx(vr,{size:13}),
          o.jsx("span",{children:"Produce Batch"})
        ]})
      ]},T.id);
    })})
  ]}),

  // VIEW 3: HIGH-VELOCITY OPERATIONAL DRIVERS (When selected from filter button)
  k==="high_velocity"&&o.jsxs("div",{className:"card-elevated",style:{padding:"16px",border:"1px solid rgba(249, 115, 22, 0.35)",background:"linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(15, 23, 42, 0.8))",borderRadius:"var(--radius-lg)"},children:[
    o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"},children:[
      o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[
        o.jsx("div",{style:{width:"28px",height:"28px",borderRadius:"8px",background:"rgba(249, 115, 22, 0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--brand-400)"},children:o.jsx(bx,{size:16})}),
        o.jsxs("div",{children:[
          o.jsx("h3",{style:{fontSize:"14px",fontWeight:800,color:"#f8fafc",margin:0},children:"High-Velocity Operational Drivers"}),
          o.jsx("span",{style:{fontSize:"11px",color:"var(--text-muted)"},children:"Products dynamically ranked by volume turnover & factory throughput"})
        ]})
      ]}),
      o.jsxs("span",{className:"badge",style:{background:"rgba(249, 115, 22, 0.15)",color:"var(--brand-400)",border:"1px solid rgba(249, 115, 22, 0.3)",fontSize:"11px",fontWeight:700,padding:"3px 8px"},children:["Top ",filteredG.length," Movers"]})
    ]}),
    filteredG.length===0?o.jsx("div",{style:{textAlign:"center",padding:"20px",color:"var(--text-muted)",fontSize:"13px"},children:"No high-velocity movers matching current filter."}):o.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:"8px"},children:filteredG.map((z,T)=>{
      const{item:N,production_volume_pcs:S,sales_volume_pcs:D,total_velocity_score:F,total_pcs:Z}=z,se=Ua(N);
      return o.jsxs("div",{style:{padding:"10px 12px",borderRadius:"8px",background:"rgba(0, 0, 0, 0.35)",border:"1px solid var(--border-subtle)",display:"flex",flexDirection:"column",justifyContent:"space-between",gap:"6px"},children:[
        o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[
          o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[
            o.jsxs("span",{style:{fontSize:"11px",fontWeight:800,color:T===0?"#fbbf24":"var(--brand-400)",background:"rgba(255, 255, 255, 0.08)",padding:"1px 5px",borderRadius:"4px"},children:["#",T+1]}),
            o.jsx("span",{style:{fontSize:"13.5px",fontWeight:800,color:"#f8fafc"},children:N.name})
          ]}),
          o.jsx("span",{style:{fontSize:"10.5px",color:"var(--text-muted)"},children:se})
        ]}),
        o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:"11.5px"},children:[
          o.jsxs("span",{style:{color:"var(--text-secondary)"},children:["Produced: ",o.jsx("strong",{style:{color:"#34d399"},children:S||0})]}),
          o.jsxs("span",{style:{color:"var(--text-secondary)"},children:["Sold: ",o.jsx("strong",{style:{color:"#f87171"},children:D||0})]}),
          o.jsxs("span",{style:{color:"var(--text-secondary)"},children:["Stock: ",o.jsx("strong",{style:{color:"#fff"},children:Z})]})
        ]}),
        o.jsxs("div",{style:{display:"flex",gap:"6px",marginTop:"2px"},children:[
          o.jsxs("button",{onClick:()=>s("production",N.id),className:"btn btn-secondary btn-sm",style:{flex:1,padding:"3px",fontSize:"11px",height:"26px"},children:[o.jsx(vr,{size:12,color:"var(--brand-400)"}),o.jsx("span",{children:"Produce"})]}),
          o.jsxs("button",{onClick:()=>s("sales",N.id),className:"btn btn-secondary btn-sm",style:{flex:1,padding:"3px",fontSize:"11px",height:"26px",color:"#f87171"},children:[o.jsx(pp,{size:12,color:"#f87171"}),o.jsx("span",{children:"Sell"})]})
        ]})
      ]},N.id);
    })})
  ]})
]})`;

bundle = bundle.slice(0, invStartIdx) + newInventoryJSX + bundle.slice(invEndIdx);
console.log('✓ Successfully spliced new Finished Goods inventory layout');

// Validate syntax
try {
  new vm.Script(bundle);
  console.log('✓ Syntax validation PASSED: bundle is 100% valid JavaScript');
} catch (err) {
  console.error('✗ Syntax Error:', err);
  process.exit(1);
}

// Write to assets/index-hgjhj-0G.js
fs.writeFileSync('assets/index-hgjhj-0G.js', bundle, 'utf8');
console.log('✓ Successfully wrote updated assets/index-hgjhj-0G.js');

// Bump cache
require('./bump_cache.js');
console.log('✓ Cache bumped successfully');
