const fs = require('fs');
const vm = require('vm');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/index-hgjhj-0G.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

console.log('--- Removing Decimals & Adding Thousand Separators to Quantities in DASHBOARD TAB ---');

// 1. Load Child 1 (critical) and Child 2 (velocity)
let child1 = fs.readFileSync(path.resolve(__dirname, 'child1_critical.js'), 'utf8');
let child2 = fs.readFileSync(path.resolve(__dirname, 'child2_velocity.js'), 'utf8');

child1 = child1.replace(/oe\.length/g, 'filteredOe.length').replace(/oe\.map/g, 'filteredOe.map');
if (child2.startsWith('G.length>0&&')) {
  child2 = child2.slice('G.length>0&&'.length);
}
child2 = child2.replace(/G\.length/g, 'filteredG.length').replace(/G\.map/g, 'filteredG.map');

// 2. Child 3 (Search + Filter Button + Category Tabs)
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
          border:filterMenuOpen?"1px solid rgba(255,255,255,0.3)":"1px solid var(--border-subtle)",
          boxShadow:"none"
        },
        title:"Filter Catalog View",
        children:[
          o.jsx(Kp,{size:16}),
          o.jsx("span",{style:{fontWeight:600,fontSize:"12px",display:"inline-block",maxWidth:"90px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:k==="critical"?"Critical":k==="high_velocity"?"High-Velocity":"Filter"}),
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
          border:"1px solid rgba(255, 255, 255, 0.15)",
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
            {id:"critical",label:"Critical Replenishment Alert",icon:"⚠️",count:filteredOe.length,desc:"Pinned items below safety reorder threshold"},
            {id:"high_velocity",label:"High-Velocity Operational Drivers",icon:"⚡",count:filteredG.length,desc:"Ranked by turnover & factory throughput"}
          ].map(opt=>o.jsxs("button",{
            key:opt.id,
            type:"button",
            onClick:()=>{A(opt.id);setFilterMenuOpen(!1);},
            style:{
              textAlign:"left",
              padding:"8px 10px",
              borderRadius:"8px",
              border:k===opt.id?"1px solid rgba(255,255,255,0.25)":"1px solid transparent",
              background:k===opt.id?"rgba(255, 255, 255, 0.08)":"transparent",
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
                  o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",fontSize:"12.5px",fontWeight:600,color:"#f8fafc"},children:[o.jsx("span",{children:opt.icon}),opt.label]}),
                  o.jsx("span",{style:{fontSize:"10.5px",color:"var(--text-muted)"},children:opt.desc})
                ]
              }),
              o.jsxs("div",{
                style:{display:"flex",alignItems:"center",gap:"4px"},
                children:[
                  o.jsx("span",{className:"badge badge-neutral",style:{fontSize:"10px",padding:"1px 5px"},children:opt.count}),
                  k===opt.id&&o.jsx("span",{style:{color:"#f8fafc",fontWeight:900,fontSize:"13px"},children:"✓"})
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
    background:"rgba(255, 255, 255, 0.04)",
    border:"1px solid rgba(255, 255, 255, 0.1)"
  },
  children:[
    o.jsxs("span",{
      style:{fontSize:"12px",fontWeight:600,color:"#f8fafc"},
      children:[k==="critical"?"Filtered by: Critical Replenishment Alert":"Filtered by: High-Velocity Operational Drivers"]
    }),
    o.jsxs("button",{
      type:"button",
      onClick:()=>A("general"),
      className:"btn btn-ghost btn-sm",
      style:{fontSize:"11px",padding:"2px 8px",height:"22px",minHeight:"22px",color:"var(--text-muted)"},
      children:["General Inventory ✕"]
    })
  ]
})`;

// 3. New Child 4: Single Row Uniform Product Cards with whole numbers (no decimals) & thousand separators
const newChild4 = `o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"6px"},children:[
  o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 4px"},children:[
    o.jsxs("span",{style:{fontSize:"13px",fontWeight:600,color:"var(--text-secondary)"},children:["General Inventory Catalog (",ue.length,")"]}),
    o.jsx("span",{style:{fontSize:"11px",color:"var(--text-muted)",fontWeight:500},children:"Structural Size (Smallest → Largest)"})
  ]}),
  ue.length===0?o.jsxs("div",{className:"card",style:{textAlign:"center",padding:"36px 16px",color:"var(--text-muted)"},children:[
    o.jsx($a,{size:32,style:{margin:"0 auto 8px auto",opacity:0.5}}),
    o.jsx("div",{style:{fontSize:"14.5px",fontWeight:600,color:"var(--text-secondary)"},children:"No products found"}),
    o.jsx("div",{style:{fontSize:"12px",marginTop:"4px"},children:"Try adjusting your category filter or search query"})
  ]}):o.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"6px"},children:ue.map(z=>{
    const{item:T,total_pcs:N,total_sqm:S,is_low_stock:D,by_color:F}=z;
    const Z=T.unit==="sqm";
    const se=T.pcs_per_sqm!==null&&T.pcs_per_sqm>0;
    const we=T.colors&&T.colors.length>0;
    const hasSqm=Z&&se&&S!==null;

    // Helper for whole integer with standard thousand separator
    const fmt=V=>V!=null?Math.round(Number(V)||0).toLocaleString('en-US'):"0";
    const totalSqmStr=hasSqm?fmt(S):null;

    const numColors=we?T.colors.length:0;
    const isCrowded=numColors>=4;
    const isVeryCrowded=numColors>=5;

    return o.jsxs("div",{
      className:"card",
      style:{
        padding:"6px 12px",
        height:"58px",
        minHeight:"58px",
        maxHeight:"58px",
        boxSizing:"border-box",
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        gap:"8px",
        borderColor:D?"rgba(255, 255, 255, 0.18)":"var(--border-subtle)",
        background:"var(--bg-surface-card)"
      },
      children:[
        // 1. Left (0% -> ~20% width): Category on top, Product name below
        o.jsxs("div",{
          style:{width:"20%",minWidth:"110px",maxWidth:"20%",flexShrink:0,overflow:"hidden"},
          children:[
            o.jsxs("div",{
              style:{display:"flex",alignItems:"center",gap:"4px",marginBottom:"1px"},
              children:[
                o.jsx("span",{className:"badge badge-neutral",style:{fontSize:"9px",padding:"0 4px",lineHeight:"1.3",background:"rgba(255,255,255,0.06)",color:"var(--text-muted)"},children:T.category}),
                D&&o.jsx("span",{className:"badge badge-neutral",style:{fontSize:"8.5px",padding:"0 3px",lineHeight:"1.3",color:"#f87171",border:"1px solid rgba(248,113,113,0.3)"},children:"LOW"})
              ]
            }),
            o.jsx("div",{
              style:{fontSize:"14px",fontWeight:700,color:"#ffffff",lineHeight:"1.2",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},
              title:T.name,
              children:T.name
            })
          ]
        }),

        // 2. Total Stock (~20% -> ~40% width): Rounded whole number with thousand separator
        o.jsxs("div",{
          style:{width:"20%",minWidth:"80px",maxWidth:"20%",flexShrink:0},
          children:[
            hasSqm?o.jsxs("div",{
              children:[
                o.jsxs("div",{
                  style:{fontSize:"15px",fontWeight:700,color:"#f8fafc",lineHeight:"1.1"},
                  children:[totalSqmStr," ",o.jsx("span",{style:{fontSize:"10.5px",fontWeight:500,color:"var(--text-muted)"},children:"sqm"})]
                }),
                o.jsxs("div",{
                  style:{fontSize:"9.5px",color:"var(--text-muted)",opacity:0.65,fontFamily:"var(--font-mono)",lineHeight:"1",marginTop:"1px"},
                  children:["(",fmt(N)," pcs)"]
                })
              ]
            }):o.jsxs("div",{
              children:[
                o.jsxs("div",{
                  style:{fontSize:"15px",fontWeight:700,color:"#f8fafc",lineHeight:"1.1"},
                  children:[fmt(N)," ",o.jsx("span",{style:{fontSize:"10.5px",fontWeight:500,color:"var(--text-muted)"},children:T.unit||"pcs"})]
                }),
                Z&&!se&&o.jsx("div",{style:{fontSize:"8.5px",color:"var(--text-muted)"},children:"sqm not set"})
              ]
            })
          ]
        }),

        // 3. Color qtys positioned at 40% of cards width, left aligned, whole numbers & thousand separators
        o.jsx("div",{
          style:{
            flex:1,
            display:"flex",
            alignItems:"center",
            gap:isVeryCrowded?"3px":isCrowded?"4px":"6px",
            flexWrap:"nowrap",
            justifyContent:"flex-start",
            minWidth:0,
            overflow:"hidden"
          },
          children:we?T.colors.map(ie=>{
            const Ce=F[ie]||{pcs:0,sqm:null};
            const colorSqm=(se&&Ce.sqm!==null)?Ce.sqm:(se&&T.pcs_per_sqm?Ce.pcs/T.pcs_per_sqm:null);
            const u=ie==="White",d=ie==="Red",f=ie==="Grey",m=ie==="Black",g=ie==="Maroon";
            const dotClass=u?"color-dot-White":d?"color-dot-Red":f?"color-dot-Grey":m?"color-dot-Black":g?"color-dot-Maroon":"";

            return o.jsxs("div",{
              style:{
                display:"flex",
                flexDirection:"column",
                alignItems:"center",
                justifyContent:"center",
                padding:isVeryCrowded?"2px 4px":isCrowded?"3px 6px":"4px 8px",
                borderRadius:"6px",
                background:"rgba(255, 255, 255, 0.03)",
                border:"1px solid rgba(255, 255, 255, 0.07)",
                minWidth:isVeryCrowded?"38px":isCrowded?"46px":"58px",
                flexShrink:1
              },
              children:[
                o.jsxs("div",{
                  style:{display:"flex",alignItems:"center",gap:isVeryCrowded?"2px":"4px",marginBottom:"1px"},
                  children:[
                    o.jsx("span",{className:"color-dot "+dotClass,style:{width:isVeryCrowded?"5px":isCrowded?"6px":"7px",height:isVeryCrowded?"5px":isCrowded?"6px":"7px",flexShrink:0}}),
                    o.jsx("span",{style:{fontSize:isVeryCrowded?"9px":isCrowded?"10px":"11px",fontWeight:600,color:"var(--text-secondary)",whiteSpace:"nowrap"},children:isVeryCrowded?ie.slice(0,1):ie})
                  ]
                }),
                o.jsxs("div",{
                  style:{fontSize:isVeryCrowded?"10.5px":isCrowded?"12px":"12.5px",fontWeight:700,color:Ce.pcs>0?"#f8fafc":"var(--text-muted)",lineHeight:"1"},
                  children:[
                    colorSqm!==null?fmt(colorSqm):fmt(Ce.pcs),
                    " ",
                    o.jsx("span",{style:{fontSize:isVeryCrowded?"7.5px":isCrowded?"8.5px":"9px",fontWeight:500,color:"var(--text-muted)"},children:colorSqm!==null?"sqm":"pcs"})
                  ]
                }),
                colorSqm!==null&&o.jsxs("div",{
                  style:{fontSize:isVeryCrowded?"8.5px":isCrowded?"9.5px":"10px",color:"var(--text-muted)",opacity:0.65,fontFamily:"var(--font-mono)",fontWeight:500,marginTop:"1px"},
                  children:["(",fmt(Ce.pcs),")"]
                })
              ]
            },ie);
          }):o.jsxs("div",{
            style:{fontSize:"11px",color:"var(--text-muted)",opacity:0.65},
            children:["Single: ",o.jsxs("strong",{style:{color:"#cbd5e1"},children:[fmt(N)," pcs"]})]
          })
        }),

        // 4. Top right corner: minimal neutral +produce (green +) and -sell (red -) buttons
        o.jsxs("div",{
          style:{
            display:"flex",
            flexDirection:"column",
            gap:"2px",
            alignItems:"flex-end",
            flexShrink:0,
            marginLeft:"auto"
          },
          children:[
            o.jsxs("button",{
              type:"button",
              onClick:()=>s("production",T.id),
              style:{
                padding:"2px 7px",
                fontSize:"10px",
                height:"20px",
                minHeight:"20px",
                borderRadius:"4px",
                display:"inline-flex",
                alignItems:"center",
                fontWeight:600,
                lineHeight:"1",
                background:"rgba(255, 255, 255, 0.06)",
                border:"1px solid rgba(255, 255, 255, 0.12)",
                color:"#f8fafc",
                cursor:"pointer"
              },
              title:"Log production for "+T.name,
              children:[
                o.jsx("span",{style:{color:"#22c55e",fontWeight:800,marginRight:"2px",fontSize:"11px"},children:"+"}),
                "Produce"
              ]
            }),
            o.jsxs("button",{
              type:"button",
              onClick:()=>s("sales",T.id),
              style:{
                padding:"2px 7px",
                fontSize:"10px",
                height:"20px",
                minHeight:"20px",
                borderRadius:"4px",
                display:"inline-flex",
                alignItems:"center",
                fontWeight:600,
                lineHeight:"1",
                background:"rgba(255, 255, 255, 0.02)",
                border:"1px solid rgba(255, 255, 255, 0.08)",
                color:"#cbd5e1",
                cursor:"pointer"
              },
              title:"Record sale for "+T.name,
              children:[
                o.jsx("span",{style:{color:"#ef4444",fontWeight:800,marginRight:"2px",fontSize:"11px"},children:"-"}),
                "Sell"
              ]
            })
          ]
        })
      ]
    },T.id);
  })})
]})`;

// 4. Assemble complete new inventory block
const assembled = `L==="inventory"&&o.jsxs(o.Fragment,{children:[
  ${child3WithFilter},
  ${filterBanner},
  k==="general"&&${newChild4},
  k==="critical"&&${child1},
  k==="high_velocity"&&${child2}
]})`;

try {
  new vm.Script('function test() { return (' + assembled + '); }');
  console.log('✓ Assembled block is 100% valid JavaScript!');
} catch (e) {
  console.error('✗ Assembly error:', e);
  process.exit(1);
}

// 5. Find boundaries of L==="inventory" in bundle
const x1Idx = bundle.indexOf('x1=(');
if (x1Idx === -1) throw new Error('x1=( not found');

const invPattern = 'L==="inventory"&&o.jsxs(o.Fragment,{children:[';
const invStartIdx = bundle.indexOf(invPattern, x1Idx);
if (invStartIdx === -1) throw new Error('L==="inventory" pattern not found');

// Find closing for L==="inventory"
let depthParen = 0, depthBrace = 0, depthBracket = 0;
let invEndIdx = -1;
const childStart = invStartIdx + invPattern.length;

for (let i = childStart; i < bundle.length; i++) {
  const c = bundle[i];
  if (c === '(') depthParen++;
  else if (c === ')') depthParen--;
  else if (c === '{') depthBrace++;
  else if (c === '}') depthBrace--;
  else if (c === '[') depthBracket++;
  else if (c === ']') depthBracket--;

  if (depthBracket === -1) {
    if (bundle.substr(i, 3) === ']})') {
      invEndIdx = i + 3;
      break;
    }
  }
}

if (invEndIdx === -1) throw new Error('Could not find closing of L==="inventory" block');
console.log('Found L==="inventory" from index', invStartIdx, 'to', invEndIdx);

// 6. Splice into bundle
bundle = bundle.slice(0, invStartIdx) + assembled + bundle.slice(invEndIdx);
console.log('✓ Spliced assembled inventory block into bundle');

// 7. Validate complete bundle syntax
try {
  new vm.Script(bundle);
  console.log('✓ Syntax validation PASSED: bundle is 100% valid JavaScript!');
} catch (err) {
  console.error('✗ Syntax validation FAILED:', err);
  process.exit(1);
}

// 8. Write to disk
fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log('✓ Written refactored bundle to assets/index-hgjhj-0G.js');

// 9. Run bump_cache.js
const { execSync } = require('child_process');
execSync('node scratch/bump_cache.js', { stdio: 'inherit' });
console.log('✓ Cache bumped and service worker updated successfully!');
