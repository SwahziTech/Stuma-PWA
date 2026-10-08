x1=({onNavigate:s})=>{var O;const{stockSummaries:t,todayMovementsCount:r,todayProductionPcs:a,todayProductionSqm:c,lowStockCount:u,items:d,rawMaterials:f,addRawMaterialStock:m,totalFactoryMolds:g,todayMoldsInUse:_,overallMoldUtilizationPct:x}=Vt(),[b,w]=B.useState(""),[E,j]=B.useState("All"),[k,A]=B.useState("general"),[filterMenuOpen,setFilterMenuOpen]=B.useState(!1),[L,W]=B.useState("inventory"),[H,ne]=B.useState(!1),[Y,ae]=B.useState("cement_50kg"),[fe,xe]=B.useState(""),[Ie,Be]=B.useState(""),[M,ee]=B.useState(((O=d[0])==null?void 0:O.id)||""),[le,he]=B.useState("200"),Pe=B.useMemo(()=>{const z=new Set(d.map(T=>T.category));return["All",...Array.from(z)]},[d]),oe=B.useMemo(()=>t.filter(z=>z.is_low_stock),[t]),G=B.useMemo(()=>[...t].filter(z=>(z.total_velocity_score||0)>0||(z.total_movements_count||0)>0).sort((z,T)=>{const N=z.total_velocity_score||0,S=T.total_velocity_score||0;return N!==S?S-N:(T.total_movements_count||0)-(z.total_movements_count||0)}).slice(0,4),[t]),ue=B.useMemo(()=>t.filter(T=>{const N=E==="All"||T.item.category===E,S=T.item.name.toLowerCase().includes(b.toLowerCase())||T.item.category.toLowerCase().includes(b.toLowerCase());return N&&S}).sort((T,N)=>{if(k==="critical"){if(T.is_low_stock&&!N.is_low_stock)return-1;if(!T.is_low_stock&&N.is_low_stock)return 1}const S=hn(T.item),D=hn(N.item);return S!==D?S-D:T.item.name.localeCompare(N.item.name)}),[t,E,b,k]),filteredOe=B.useMemo(()=>oe.filter(T=>{const N=E==="All"||T.item.category===E,S=T.item.name.toLowerCase().includes(b.toLowerCase())||T.item.category.toLowerCase().includes(b.toLowerCase());return N&&S}),[oe,E,b]),filteredG=B.useMemo(()=>G.filter(T=>{const N=E==="All"||T.item.category===E,S=T.item.name.toLowerCase().includes(b.toLowerCase())||T.item.category.toLowerCase().includes(b.toLowerCase());return N&&S}),[G,E,b]),P=B.useMemo(()=>{const z=d.find(J=>J.id===M)||d[0];if(!z)return null;const T=parseInt(le,10)||0,N=lt(z),S=z.moldCount||N.moldCount||50,D=z.wastani_per_bag||N.wastaniPcsPerBag||50,F=S>0?Math.ceil(T/S):1,Z=T>S,se=S>0?Math.min(100,Number((T/S*100).toFixed(1))):100,we=Pa(z,T,"White");let V=null;return z.unit==="sqm"&&z.pcs_per_sqm&&z.pcs_per_sqm>0&&(V=Number((T/z.pcs_per_sqm).toFixed(2))),{item:z,spec:N,pcs:T,totalSqm:V,moldCount:S,wastani:D,cyclesNeeded:F,isOverOneCycle:Z,utilizationSingleCyclePct:se,materials:we}},[d,M,le]),y=async z=>{z.preventDefault();const T=parseFloat(fe);isNaN(T)||T<=0||(await m(Y,T,Ie),ne(!1),xe(""),Be(""))};return o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"14px"},children:[o.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"6px",background:"var(--bg-surface-elevated)",padding:"4px",borderRadius:"var(--radius-md)",border:"1px solid var(--border-subtle)"},children:[o.jsxs("button",{type:"button",onClick:()=>W("inventory"),style:{padding:"8px 10px",borderRadius:"6px",border:"none",fontSize:"12.5px",fontWeight:700,background:L==="inventory"?"var(--brand-500)":"transparent",color:L==="inventory"?"#fff":"var(--text-secondary)",cursor:"pointer",transition:"all 0.15s ease",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"},children:[o.jsx(si,{size:14}),o.jsx("span",{children:"Finished Goods"})]}),o.jsxs("button",{type:"button",onClick:()=>W("capacity_planner"),style:{padding:"8px 10px",borderRadius:"6px",border:"none",fontSize:"12.5px",fontWeight:700,background:L==="capacity_planner"?"var(--brand-500)":"transparent",color:L==="capacity_planner"?"#fff":"var(--text-secondary)",cursor:"pointer",transition:"all 0.15s ease",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"},children:[o.jsx(qa,{size:14}),o.jsx("span",{children:"Capacity Planner"})]}),o.jsxs("button",{type:"button",onClick:()=>W("raw_materials"),style:{padding:"8px 10px",borderRadius:"6px",border:"none",fontSize:"12.5px",fontWeight:700,background:L==="raw_materials"?"var(--brand-500)":"transparent",color:L==="raw_materials"?"#fff":"var(--text-secondary)",cursor:"pointer",transition:"all 0.15s ease",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"},children:[o.jsx(pc,{size:14}),o.jsx("span",{children:"Raw Materials"})]})]}),L==="capacity_planner"&&o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"14px"},children:[o.jsxs("div",{className:"card-elevated",style:{padding:"16px",background:"linear-gradient(135deg, rgba(56, 189, 248, 0.1), var(--bg-surface))",border:"1px solid rgba(56, 189, 248, 0.3)"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"},children:[o.jsxs("div",{children:[o.jsx("span",{style:{fontSize:"11px",color:"#38bdf8",fontWeight:700,textTransform:"uppercase"},children:"Daily Mold Turnaround Utilization"}),o.jsxs("div",{style:{fontSize:"18px",fontWeight:800,color:"#f8fafc"},children:[_.toLocaleString()," / ",g.toLocaleString()," molds cast today"]})]}),o.jsx("div",{style:{textAlign:"right"},children:o.jsxs("span",{style:{fontSize:"24px",fontWeight:800,color:"#38bdf8"},children:[x,"%"]})})]}),o.jsx("div",{style:{width:"100%",height:"8px",background:"rgba(255, 255, 255, 0.1)",borderRadius:"4px",overflow:"hidden"},children:o.jsx("div",{style:{width:`${x}%`,height:"100%",background:"linear-gradient(90deg, #38bdf8, #f97316)",borderRadius:"4px",transition:"width 0.3s ease"}})}),o.jsx("div",{style:{fontSize:"11.5px",color:"var(--text-muted)",marginTop:"8px"},children:"Calculated across all physical molds available at Stumarcot Dodoma site."})]}),o.jsxs("div",{className:"card-elevated",style:{padding:"16px",border:"1px solid var(--border-subtle)"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"},children:[o.jsx(kc,{size:18,color:"var(--brand-400)"}),o.jsxs("div",{children:[o.jsx("h3",{style:{fontSize:"15px",fontWeight:800},children:"Production Capacity & Mix Simulator"}),o.jsx("p",{style:{fontSize:"11.5px",color:"var(--text-muted)"},children:"Simulate a production order to check mold limits, turnaround cycles, and required raw materials"})]})]}),o.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1.2fr 0.8fr",gap:"10px",marginBottom:"12px"},children:[o.jsxs("div",{children:[o.jsx("label",{style:{fontSize:"11px",color:"var(--text-muted)",display:"block",marginBottom:"4px"},children:"Select Product"}),o.jsx("select",{value:M,onChange:z=>ee(z.target.value),className:"input-field",style:{fontSize:"13px",fontWeight:600,padding:"8px 10px"},children:d.map(z=>o.jsxs("option",{value:z.id,children:[z.name," (",z.category," · ",z.moldCount||lt(z).moldCount," molds)"]},z.id))})]}),o.jsxs("div",{children:[o.jsx("label",{style:{fontSize:"11px",color:"var(--text-muted)",display:"block",marginBottom:"4px"},children:"Target Quantity (pcs)"}),o.jsx("input",{type:"number",min:"1",step:"10",value:le,onChange:z=>he(z.target.value),className:"input-field mono",style:{fontSize:"15px",fontWeight:700},placeholder:"200"})]})]}),P&&o.jsxs("div",{style:{background:"var(--bg-surface)",padding:"12px",borderRadius:"var(--radius-md)",border:"1px solid var(--border-subtle)"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"},children:[o.jsxs("div",{children:[o.jsx("span",{style:{fontSize:"12px",color:"var(--text-muted)"},children:"Physical Fleet:"}),o.jsxs("strong",{style:{fontSize:"14px",color:"#fff",marginLeft:"6px"},children:[P.moldCount," molds (",P.spec.size||"Standard",")"]})]}),o.jsx("div",{style:{textAlign:"right"},children:o.jsxs("span",{className:`badge ${P.isOverOneCycle?"badge-warning":"badge-success"}`,style:{fontSize:"11px",padding:"3px 8px"},children:[P.cyclesNeeded," Casting ",P.cyclesNeeded===1?"Cycle":"Cycles"," Required"]})})]}),P.isOverOneCycle&&o.jsxs("div",{style:{padding:"8px 10px",borderRadius:"6px",background:"rgba(245, 158, 11, 0.1)",border:"1px solid rgba(245, 158, 11, 0.3)",color:"#fbbf24",fontSize:"11.5px",marginBottom:"10px"},children:["⚠️ Target exceeds 1-day mold capacity (",P.moldCount," molds). Will require ",P.cyclesNeeded," curing days / cycles."]}),o.jsxs("div",{style:{fontSize:"11.5px",fontWeight:700,color:"var(--text-secondary)",marginBottom:"6px"},children:["🏗️ Raw Materials Needed for ",P.pcs," pcs ",P.totalSqm?`(${P.totalSqm} sqm)`:"",":"]}),o.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"6px",marginBottom:"12px"},children:[o.jsxs("div",{style:{background:"var(--bg-input)",padding:"8px",borderRadius:"6px"},children:[o.jsx("span",{style:{fontSize:"10.5px",color:"var(--text-muted)",display:"block"},children:"Cement"}),o.jsxs("strong",{style:{fontSize:"13px",color:"var(--brand-400)"},children:[P.materials.cementBags," bags"]})]}),o.jsxs("div",{style:{background:"var(--bg-input)",padding:"8px",borderRadius:"6px"},children:[o.jsx("span",{style:{fontSize:"10.5px",color:"var(--text-muted)",display:"block"},children:"Sand"}),o.jsxs("strong",{style:{fontSize:"13px",color:"#f8fafc"},children:[P.materials.sandBuckets," buckets"]})]}),o.jsxs("div",{style:{background:"var(--bg-input)",padding:"8px",borderRadius:"6px"},children:[o.jsx("span",{style:{fontSize:"10.5px",color:"var(--text-muted)",display:"block"},children:"Chipping"}),o.jsxs("strong",{style:{fontSize:"13px",color:"#f8fafc"},children:[P.materials.chippingBuckets," buckets"]})]})]}),o.jsxs("button",{type:"button",onClick:()=>s("production",P.item.id),className:"btn btn-primary btn-sm",style:{width:"100%"},children:[o.jsx(fc,{size:15}),o.jsxs("span",{children:["Open Production Form with ",P.item.name]})]})]})]}),o.jsxs("div",{className:"card",style:{padding:"14px"},children:[o.jsxs("h3",{style:{fontSize:"14px",fontWeight:800,marginBottom:"10px"},children:["Factory Mold Fleet Reference (",d.length," Products)"]}),o.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"6px",maxHeight:"400px",overflowY:"auto"},children:d.map(z=>{const T=lt(z),N=z.moldCount||T.moldCount||0,S=z.wastani_per_bag||T.wastaniPcsPerBag||50;return o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",background:"var(--bg-input)",borderRadius:"var(--radius-md)",fontSize:"12.5px"},children:[o.jsxs("div",{children:[o.jsx("span",{style:{fontWeight:700,color:"#f8fafc"},children:z.name}),o.jsxs("span",{style:{fontSize:"11px",color:"var(--text-muted)",marginLeft:"6px"},children:[z.category," ",T.size?`(${T.size})`:""]})]}),o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[o.jsxs("span",{className:"badge badge-neutral",style:{fontSize:"11px",padding:"1px 6px"},children:[N," molds"]}),o.jsxs("span",{style:{fontSize:"11px",color:"var(--brand-400)",fontFamily:"var(--font-mono)"},children:["Wastani: ",S," pcs/bag"]})]})]},z.id)})})]})]}),L==="raw_materials"&&o.jsx(RawMaterialMasterView,{rawMaterials:f,addRawMaterialStock:m,recordRawMaterialBaselineBatch:Vt().recordRawMaterialBaselineBatch,updateRawMaterialMaster:Vt().updateRawMaterialMaster,addRawMaterial:Vt().addRawMaterial,removeRawMaterial:Vt().removeRawMaterial,resetAllRawMaterialsToZero:Vt().resetAllRawMaterialsToZero,onNavigate:s,staffName:Vt().staffName}),L==="inventory"&&o.jsxs(o.Fragment,{children:[
  o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[
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
]}),
  k!=="general"&&o.jsxs("div",{
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
}),
  k==="general"&&o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"6px"},children:[
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
]}),
  k==="critical"&&o.jsxs("div",{className:"card-elevated",style:{padding:"16px",border:filteredOe.length>0?"1px solid rgba(239, 68, 68, 0.4)":"1px solid rgba(16, 185, 129, 0.3)",background:filteredOe.length>0?"linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(15, 23, 42, 0.8))":"linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.6))",borderRadius:"var(--radius-lg)"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[o.jsx("div",{style:{width:"28px",height:"28px",borderRadius:"8px",background:filteredOe.length>0?"rgba(239, 68, 68, 0.2)":"rgba(16, 185, 129, 0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:filteredOe.length>0?"#ef4444":"#10b981"},children:o.jsx(Cc,{size:16})}),o.jsxs("div",{children:[o.jsx("h3",{style:{fontSize:"14px",fontWeight:800,color:"#f8fafc",margin:0},children:"Critical Replenishment Alert"}),o.jsx("span",{style:{fontSize:"11px",color:"var(--text-muted)"},children:"Pinned items below factory safety reorder threshold"})]})]}),o.jsxs("span",{className:"badge",style:{background:filteredOe.length>0?"rgba(239, 68, 68, 0.2)":"rgba(16, 185, 129, 0.2)",color:filteredOe.length>0?"#f87171":"#34d399",border:`1px solid ${filteredOe.length>0?"rgba(239, 68, 68, 0.4)":"rgba(16, 185, 129, 0.4)"}`,fontSize:"11px",fontWeight:700,padding:"3px 8px"},children:[filteredOe.length," ",filteredOe.length===1?"Deficit":"Deficits"]})]}),filteredOe.length===0?o.jsxs("div",{style:{padding:"12px",borderRadius:"8px",background:"rgba(16, 185, 129, 0.08)",display:"flex",alignItems:"center",gap:"8px",color:"#34d399",fontSize:"12.5px",fontWeight:600},children:[o.jsx(pn,{size:16}),o.jsx("span",{children:"All product inventories are currently sitting safely above reorder levels."})]}):o.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:filteredOe.map(z=>{const{item:T,total_pcs:N,total_sqm:S}=z,D=T.unit==="sqm",F=T.reorder_level||100,Z=D&&S!==null?S:N,se=Math.max(0,F-Z);return o.jsxs("div",{style:{padding:"10px 12px",borderRadius:"8px",background:"rgba(0, 0, 0, 0.4)",border:"1px solid rgba(239, 68, 68, 0.3)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px",flexWrap:"wrap"},children:[o.jsxs("div",{children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[o.jsx("span",{style:{fontWeight:800,fontSize:"14px",color:"#f8fafc"},children:T.name}),o.jsx("span",{className:"badge badge-neutral",style:{fontSize:"10px",padding:"1px 5px"},children:T.category})]}),o.jsxs("div",{style:{fontSize:"11.5px",color:"#f87171",marginTop:"2px",fontWeight:600},children:["Current: ",Z," ",T.unit," · Min Threshold: ",F," ",T.unit," (Deficit: -",D?se.toFixed(1):se," ",T.unit,")"]})]}),o.jsxs("button",{onClick:()=>s("production",T.id),className:"btn btn-primary btn-sm",style:{padding:"4px 10px",fontSize:"12px",height:"30px"},children:[o.jsx(vr,{size:13}),o.jsx("span",{children:"Produce Batch"})]})]},T.id)})})]}),
  k==="high_velocity"&&o.jsxs("div",{className:"card-elevated",style:{padding:"16px",border:"1px solid rgba(249, 115, 22, 0.35)",background:"linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(15, 23, 42, 0.8))",borderRadius:"var(--radius-lg)"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[o.jsx("div",{style:{width:"28px",height:"28px",borderRadius:"8px",background:"rgba(249, 115, 22, 0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--brand-400)"},children:o.jsx(bx,{size:16})}),o.jsxs("div",{children:[o.jsx("h3",{style:{fontSize:"14px",fontWeight:800,color:"#f8fafc",margin:0},children:"High-Velocity Operational Drivers"}),o.jsx("span",{style:{fontSize:"11px",color:"var(--text-muted)"},children:"Products dynamically ranked by volume turnover & factory throughput"})]})]}),o.jsxs("span",{className:"badge",style:{background:"rgba(249, 115, 22, 0.15)",color:"var(--brand-400)",border:"1px solid rgba(249, 115, 22, 0.3)",fontSize:"11px",fontWeight:700,padding:"3px 8px"},children:["Top ",filteredG.length," Movers"]})]}),o.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:"8px"},children:filteredG.map((z,T)=>{const{item:N,production_volume_pcs:S,sales_volume_pcs:D,total_velocity_score:F,total_pcs:Z}=z,se=Ua(N);return o.jsxs("div",{style:{padding:"10px 12px",borderRadius:"8px",background:"rgba(0, 0, 0, 0.35)",border:"1px solid var(--border-subtle)",display:"flex",flexDirection:"column",justifyContent:"space-between",gap:"6px"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[o.jsxs("span",{style:{fontSize:"11px",fontWeight:800,color:T===0?"#fbbf24":"var(--brand-400)",background:"rgba(255, 255, 255, 0.08)",padding:"1px 5px",borderRadius:"4px"},children:["#",T+1]}),o.jsx("span",{style:{fontSize:"13.5px",fontWeight:800,color:"#f8fafc"},children:N.name})]}),o.jsx("span",{style:{fontSize:"10.5px",color:"var(--text-muted)"},children:se})]}),o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:"11.5px"},children:[o.jsxs("span",{style:{color:"var(--text-secondary)"},children:["Produced: ",o.jsx("strong",{style:{color:"#34d399"},children:S||0})]}),o.jsxs("span",{style:{color:"var(--text-secondary)"},children:["Sold: ",o.jsx("strong",{style:{color:"#f87171"},children:D||0})]}),o.jsxs("span",{style:{color:"var(--text-secondary)"},children:["Stock: ",o.jsx("strong",{style:{color:"#fff"},children:Z})]})]}),o.jsxs("div",{style:{display:"flex",gap:"6px",marginTop:"2px"},children:[o.jsxs("button",{onClick:()=>s("production",N.id),className:"btn btn-secondary btn-sm",style:{flex:1,padding:"3px",fontSize:"11px",height:"26px"},children:[o.jsx(vr,{size:12,color:"var(--brand-400)"}),o.jsx("span",{children:"Produce"})]}),o.jsxs("button",{onClick:()=>s("sales",N.id),className:"btn btn-secondary btn-sm",style:{flex:1,padding:"3px",fontSize:"11px",height:"26px",color:"#f87171"},children:[o.jsx(pp,{size:12,color:"#f87171"}),o.jsx("span",{children:"Sell"})]})]})]},N.id)})})]})
]}),H&&o.jsx("div",{className:"modal-overlay",onClick:()=>ne(!1),children:o.jsxs("div",{className:"modal-content",onClick:z=>z.stopPropagation(),style:{padding:"20px",maxWidth:"440px"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"},children:[o.jsxs("div",{children:[o.jsx("h3",{style:{fontSize:"17px",fontWeight:800},children:"Restock Raw Materials"}),o.jsx("p",{style:{fontSize:"12px",color:"var(--text-muted)"},children:"Record delivery of cement, sand, aggregates, chemical or pigment"})]}),o.jsx("button",{type:"button",onClick:()=>ne(!1),className:"btn btn-ghost btn-sm",children:"✕"})]}),o.jsxs("form",{onSubmit:y,style:{display:"flex",flexDirection:"column",gap:"12px"},children:[o.jsxs("div",{children:[o.jsx("label",{style:{fontSize:"11.5px",color:"var(--text-muted)",display:"block",marginBottom:"4px"},children:"Select Material"}),o.jsx("select",{value:Y,onChange:z=>ae(z.target.value),className:"input-field",children:f.map(z=>o.jsxs("option",{value:z.key,children:[z.name," (Current: ",z.currentBalance," ",z.unit,")"]},z.key))})]}),o.jsxs("div",{children:[o.jsx("label",{style:{fontSize:"11.5px",color:"var(--text-muted)",display:"block",marginBottom:"4px"},children:"Quantity Delivered / Added"}),o.jsx("input",{type:"number",min:"0.1",step:"any",required:!0,value:fe,onChange:z=>xe(z.target.value),className:"input-field mono",placeholder:"e.g. 100",autoFocus:!0})]}),o.jsxs("div",{children:[o.jsx("label",{style:{fontSize:"11.5px",color:"var(--text-muted)",display:"block",marginBottom:"4px"},children:"Delivery Note / Supplier"}),o.jsx("input",{type:"text",value:Ie,onChange:z=>Be(z.target.value),className:"input-field",placeholder:"e.g. Twiga Cement 100 bags truck delivery..."})]}),o.jsxs("button",{type:"submit",className:"btn btn-primary btn-lg",style:{marginTop:"8px"},children:[o.jsx(pn,{size:18}),o.jsx("span",{children:"Save Restock Entry"})]})]})]})})]})},