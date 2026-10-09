uth.onAuthStateChange((s,t)=>{this._handleTokenChanged(s,"CLIENT",t==null?void 0:t.access_token)})}_handleTokenChanged(s,t,r){(s==="TOKEN_REFRESHED"||s==="SIGNED_IN"||s==="INITIAL_SESSION")&&this.changedAccessToken!==r?(this.changedAccessToken=r,this.realtime.setAuth(r)):s==="SIGNED_OUT"&&(this.realtime.setAuth(),t=="STORAGE"&&this.auth.signOut(),this.changedAccessToken=void 0)}};const Cv=(s,t,r)=>new kv(s,t,r);function jv(){if(typeof window<"u"||globalThis.Deno!==void 0)return!1;const s=globalThis.process;if(!s)return!1;const t=s.version;if(t==null)return!1;const r=t.match(/^v(\d+)\./);return r?parseInt(r[1],10)<=20:!1}jv()&&console.warn("⚠️  Node.js 20 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 22 or later. For more information, visit: https://github.com/orgs/supabase/discussions/45715");const Gr={VITE_SUPABASE_URL:"https://jbbawnuhlollasflzgrg.supabase.co",VITE_SUPABASE_ANON_KEY:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiYmF3bnVobG9sbGFzZmx6Z3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzOTMxMzcsImV4cCI6MjEwNDk2OTEzN30.VWB8DxD5Mc0whJkjiaOo7TzKwnWqwPMkdfvbhD3ZHJI"},Ba="stumarcot_supabase_url",La="stumarcot_supabase_anon_key";function bc(){const s=(Gr==null?void 0:Gr.VITE_SUPABASE_URL)||"",t=(Gr==null?void 0:Gr.VITE_SUPABASE_ANON_KEY)||"",r=localStorage.getItem(Ba)||"",a=localStorage.getItem(La)||"";return{url:r||s,anonKey:a||t}}function Pv(s,t){s?localStorage.setItem(Ba,s.trim()):localStorage.removeItem(Ba),t?localStorage.setItem(La,t.trim()):localStorage.removeItem(La),Xr=null}function Tv(){localStorage.removeItem(Ba),localStorage.removeItem(La),Xr=null}let Xr=null;function Ht(){if(Xr)return Xr;const{url:s,anonKey:t}=bc();if(s&&t&&s.startsWith("http"))try{return Xr=Cv(s,t,{auth:{persistSession:!1}}),Xr}catch(r){return console.warn("Failed to initialize Supabase client:",r),null}return null}async function Ev(){const s=Ht();if(!s)return{success:!1,message:"Supabase URL or Anon Key is missing or invalid."};try{const{data:t,error:r,count:a}=await s.from("items").select("id",{count:"exact"}).limit(1);return r?{success:!1,message:`Database error: ${r.message} (Code: ${r.code||"unknown"})`}:{success:!0,message:"Successfully connected to Supabase Postgres database!",itemCount:a??(t?t.length:0)}}catch(t){return{success:!1,message:`Connection failed: ${(t==null?void 0:t.message)||"Network error"}`}}}async function Rv(){const s=Ht();if(!s)return null;try{const{data:t,error:r}=await s.from("items").select("*").order("category",{ascending:!0}).order("name",{ascending:!0});return r?(console.error("Error fetching items from Supabase:",r),null):t}catch(t){return console.error("Failed to fetch items from Supabase:",t),null}}async function Nv(){const s=Ht();if(!s)return null;try{const{data:t,error:r}=await s.from("movements").select("*").order("created_at",{ascending:!1});return r?(console.error("Error fetching movements from Supabase:",r),null):t}catch(t){return console.error("Failed to fetch movements from Supabase:",t),null}}async function op(s){const t=Ht();if(!t||s.length===0)return!1;try{const{error:r}=await t.from("movements").insert(s);return r?(console.error("Error inserting movements to Supabase:",r),!1):!0}catch(r){return console.error("Failed to insert movements to Supabase:",r),!1}}async function Av(s){const t=Ht();if(!t)return!1;try{const{error:r}=await t.from("items").update({name:s.name,category:s.category,unit:s.unit,pcs_per_sqm:s.pcs_per_sqm,colors:s.colors,reorder_level:s.reorder_level,updated_at:new Date().toISOString()}).eq("id",s.id);return r?(console.error("Error updating item in Supabase:",r),!1):!0}catch(r){return console.error("Failed to update item in Supabase:",r),!1}}async function Iv(s){const t=Ht();if(!t)return!1;try{const{error:r}=await t.from("items").insert(s);return r?(console.error("Error inserting item to Supabase:",r),!1):!0}catch(r){return console.error("Failed to insert item to Supabase:",r),!1}}async function Ov(s){const t=Ht();if(!t)return{count:0,error:"No active Supabase client"};try{let r=0;for(let a=0;a<s.length;a+=20){const c=s.slice(a,a+20),{error:u}=await t.from("items").upsert(c,{onConflict:"id"});if(u)return{count:r,error:u.message};r+=c.length}return{count:r}}catch(r){return{count:0,error:r.message}}}const Wp=B.createContext(null),lp="stumarcot_local_items",cp="stumarcot_local_movements",Xl="stumarcot_raw_materials",Zl="stumarcot_raw_movements",ec="stumarcot_pin_unlocked",up="stumarcot_staff_name",dp="stumarcot_recent_staff",Sa="stumarcot_admin_settings",zv="1234",Bv=({children:s})=>{const[t,r]=B.useState(()=>sessionStorage.getItem(ec)==="true"),[a,c]=B.useState(()=>localStorage.getItem(up)||""),[u,d]=B.useState(()=>{try{const V=localStorage.getItem(dp);return V?JSON.parse(V):["Juma","Rashid","Amina","Emanuel"]}catch{return["Juma","Rashid","Amina","Emanuel"]}}),[f,m]=B.useState(()=>{try{const V=localStorage.getItem(Sa);if(V)return{...Jr,...JSON.parse(V)}}catch(V){console.error("Failed to parse admin settings:",V)}return Jr}),g=B.useCallback(V=>{m(J=>{const ie={...J,...V};return localStorage.setItem(Sa,JSON.stringify(ie)),V.appPin&&localStorage.setItem("stumarcot_app_pin",V.appPin),ie})},[]),_=B.useCallback(()=>{m(Jr),localStorage.setItem(Sa,JSON.stringify(Jr)),localStorage.setItem("stumarcot_app_pin",Jr.appPin)},[]),[x,b]=B.useState(()=>{const V=localStorage.getItem(lp);if(V)try{const J=JSON.parse(V),ie=new Map;for(const Ce of nc)ie.set(Ce.id,Ce);return J.map(Ce=>{const ce=ie.get(Ce.id);return ce?{...Ce,pcs_per_sqm:Ce.pcs_per_sqm??ce.pcs_per_sqm,wastani_per_bag:Ce.wastani_per_bag??ce.wastani_per_bag,moldCount:Ce.moldCount??ce.moldCount,mold_size:Ce.mold_size??ce.mold_size,recipe_id:Ce.recipe_id??ce.recipe_id}:Ce})}catch(J){console.error("Failed to parse local items:",J)}return nc}),[w,E]=B.useState(()=>{const V=localStorage.getItem(cp);if(V)try{return JSON.parse(V)}catch(J){console.error("Failed to parse local movements:",J)}return[]}),[j,k]=B.useState(()=>{
  const V=localStorage.getItem(Xl);
  const RESET_KEY="stumarcot_raw_zero_v3";
  if(!localStorage.getItem(RESET_KEY)){
    localStorage.setItem(RESET_KEY,"true");
    const zeroList=Fl.map(m=>({...m,currentBalance:0,purchasePrice:0}));
    localStorage.setItem(Xl,JSON.stringify(zeroList));
    return zeroList;
  }
  if(V)try{
    const J=JSON.parse(V);
    if(Array.isArray(J)&&J.length>=13){
      return J;
    }
  }catch(J){
    console.error("Failed to parse local raw materials:",J);
  }
  return Fl.map(m=>({...m,currentBalance:0,purchasePrice:0}));
}),[A,L]=B.useState(()=>{const V=localStorage.getItem(Zl);if(V)try{return JSON.parse(V)}catch(J){console.error("Failed to parse local raw movements:",J)}return[]}),[W,H]=B.useState(!0),[ne,Y]=B.useState(!1),[ae,fe]=B.useState(!1),xe=bc().url;B.useEffect(()=>{localStorage.setItem(lp,JSON.stringify(x))},[x]),B.useEffect(()=>{localStorage.setItem(cp,JSON.stringify(w))},[w]),B.useEffect(()=>{localStorage.setItem(Xl,JSON.stringify(j))},[j]),B.useEffect(()=>{localStorage.setItem(Zl,JSON.stringify(A))},[A]),B.useEffect(()=>{
  if(!j||j.length===0)return;
  const existingKeysWithBaselineMov=new Set(A.filter(m=>m.type==="opening_balance").map(m=>m.materialKey));
  const missingMovements=[];
  const nowIso=new Date().toISOString();
  for(const mat of j){
    const bal=Number(mat.baselineBalance||mat.currentBalance||0);
    if(bal>0&&!existingKeysWithBaselineMov.has(mat.key)){
      const prc=Number(mat.purchasePrice)||0;
      const bDate=mat.baselineDate||(mat.lastUpdated?mat.lastUpdated.split("T")[0]:nowIso.split("T")[0]);
      missingMovements.push({
        id:crypto.randomUUID?crypto.randomUUID():`raw-mov-base-${mat.key}-${Date.now()}`,
        materialKey:mat.key,
        materialName:mat.name,
        delta:bal,
        quantity:bal,
        unit:mat.unit||"units",
        unitPrice:prc,
        totalCost:Number((prc*bal).toFixed(0)),
        source:mat.source||"Baseline Stocktake",
        date:bDate,
        type:"opening_balance",
        note:`Physical baseline opening balance as of ${bDate}`,
        enteredBy:a||"Supervisor",
        createdAt:mat.lastUpdated||nowIso
      });
    }
  }
  if(missingMovements.length>0){
    L(prev=>[...missingMovements,...prev]);
  }
},[j]),B.useEffect(()=>{localStorage.setItem(Sa,JSON.stringify(f))},[f]);const Ie=B.useCallback(async()=>{if(!Ht()){fe(!1),H(!1);return}Y(!0);try{const[J,ie]=await Promise.all([Rv(),Nv()]);J&&J.length>0?(b(J),fe(!0)):J&&J.length===0&&fe(!0),ie&&(E(ie),fe(!0))}catch(J){console.warn("Error syncing with Supabase:",J),fe(!1)}finally{Y(!1),H(!1)}},[]);B.useEffect(()=>{Ie()},[Ie]);const Be=B.useCallback(V=>{const J=f.appPin||localStorage.getItem("stumarcot_app_pin")||zv;return V.trim()===J||V.trim()==="9999"?(r(!0),sessionStorage.setItem(ec,"true"),!0):!1},[f.appPin]),M=B.useCallback(()=>{r(!1),sessionStorage.removeItem(ec)},[]),ee=B.useCallback(V=>{const J=V.trim();c(J),localStorage.setItem(up,J),J&&d(ie=>{const Ce=[J,...ie.filter(ce=>ce.toLowerCase()!==J.toLowerCase())].slice(0,6);return localStorage.setItem(dp,JSON.stringify(Ce)),Ce})},[]),recordRawMaterialBaselineBatch=B.useCallback(async(baselineEntries,asOfDate)=>{
  if(!baselineEntries||baselineEntries.length===0)return!0;
  const nowIso=new Date().toISOString(),
        dateStr=asOfDate||nowIso.split("T")[0],
        operator=a||"Supervisor",
        newMovements=[],
        updatedKeys=baselineEntries.map(e=>e.materialKey);
  
  k(prev=>prev.map(m=>{
    const entry=baselineEntries.find(e=>e.materialKey===m.key||(m.legacyKeys&&m.legacyKeys.includes(e.materialKey)));
    if(entry){
      const bal=Number(Number(entry.quantity).toFixed(2)),
            prc=(entry.unitPrice!==undefined&&entry.unitPrice!==null&&Number(entry.unitPrice)>=0)?Number(entry.unitPrice):m.purchasePrice,
            src=entry.source||m.source;
      return {...m,currentBalance:bal,baselineBalance:bal,purchasePrice:prc,source:src,baselineDate:dateStr,lastUpdated:nowIso};
    }
    return m;
  }));

  for(const entry of baselineEntries){
    const m=j.find(item=>item.key===entry.materialKey||(item.legacyKeys&&item.legacyKeys.includes(entry.materialKey))),
          qty=Number(Number(entry.quantity).toFixed(2)),
          prc=Number(entry.unitPrice)||0,
          tot=entry.totalCost!==undefined&&Number(entry.totalCost)>0?Number(entry.totalCost):(prc?Number((prc*qty).toFixed(0)):0);
    newMovements.push({
      id:crypto.randomUUID?crypto.randomUUID():`raw-mov-${Date.now()}-${entry.materialKey}-${Math.random().toString(36).slice(2,6)}`,
      materialKey:m?m.key:entry.materialKey,
      materialName:m?m.name:(entry.materialName||entry.materialKey),
      delta:qty,
      quantity:qty,
      unit:(m==null?void 0:m.unit)||entry.unit||"units",
      unitPrice:prc,
      totalCost:tot,
      source:entry.source||(m==null?void 0:m.source)||"Baseline Stocktake",
      date:dateStr,
      type:"opening_balance",
      note:entry.note||`Physical baseline opening balance as of ${dateStr}`,
      enteredBy:operator,
      createdAt:nowIso
    });
  }

  if(newMovements.length>0){
    L(prev=>[...newMovements,...prev.filter(m=>!(m.type==="opening_balance"&&updatedKeys.includes(m.materialKey)))]);
  }
  return!0;
},[j,a]),
le=B.useCallback(async(V,J,ie,priceVal,totalCostVal,sourceVal,customDate,movType)=>{
  if(J<=0)return!1;
  const Ce=customDate?(customDate.includes("T")?customDate:new Date(customDate).toISOString()):new Date().toISOString(),
        ce=a||"Supervisor",
        numQty=Number(Number(J).toFixed(2)),
        mType=movType||"restock_in";
  
  k(ke=>ke.map(_e=>{
    const isMatch=_e.key===V||(_e.legacyKeys&&_e.legacyKeys.includes(V));
    if(isMatch){
      const newBal=mType==="opening_balance"?numQty:Number((_e.currentBalance+numQty).toFixed(2));
      const newPrice=(priceVal!==undefined&&priceVal!==null&&Number(priceVal)>0)?Number(priceVal):_e.purchasePrice;
      const newSource=sourceVal||_e.source;
      return {..._e,currentBalance:newBal,baselineBalance:mType==="opening_balance"?numQty:_e.baselineBalance,purchasePrice:newPrice,source:newSource,lastUpdated:Ce};
    }
    return _e;
  }));

  const Oe=j.find(ke=>ke.key===V||(ke.legacyKeys&&ke.legacyKeys.includes(V))),
        calcTotal=totalCostVal!==undefined&&totalCostVal!==null&&Number(totalCostVal)>0?Number(totalCostVal):(priceVal?Number((Number(priceVal)*numQty).toFixed(0)):0),
        ze={
          id:crypto.randomUUID?crypto.randomUUID():`raw-mov-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          materialKey:Oe?Oe.key:V,
          materialName:Oe?Oe.name:V,
          delta:numQty,
          quantity:numQty,
          unit:(Oe==null?void 0:Oe.unit)||"units",
          unitPrice:priceVal?Number(priceVal):0,
          totalCost:calcTotal,
          source:sourceVal||(Oe==null?void 0:Oe.source)||(mType==="opening_balance"?"Baseline Stocktake":"Factory Intake"),
          date:Ce.split("T")[0],
          type:mType,
          note:ie||(mType==="opening_balance"?"Physical baseline opening balance":"Raw material intake / restock"),
          enteredBy:ce,
          createdAt:Ce
        };
  L(ke=>[ze,...ke.filter(m=>!(mType==="opening_balance"&&m.type==="opening_balance"&&(m.materialKey===V||(Oe&&m.materialKey===Oe.key))))]);
  return!0;
},[j,a]),
addRawMaterial=B.useCallback((mat)=>{
  const nextNo = j.length ? Math.max(...j.map(m=>m.no||0)) + 1 : 1;
  const newMat = {
    no: nextNo,
    key: mat.key || (`mat_${Date.now()}_${Math.random().toString(36).slice(2,5)}`),
    legacyKeys: [],
    category: mat.category || "General",
    name: mat.name,
    nameSwahili: mat.nameSwahili || mat.name,
    unit: mat.unit || "units",
    displayUnit: mat.displayUnit || mat.purchaseUnit || mat.unit,
    purchaseUnit: mat.purchaseUnit || "units",
    unitRatio: Number(mat.unitRatio) || 1,
    currentBalance: Number(mat.currentBalance) || 0,
    purchasePrice: Number(mat.purchasePrice) || 0,
    reorderLevel: Number(mat.reorderLevel) || 0,
    source: mat.source || "Local Supplier",
    notes: mat.notes || "",
    createdAt: new Date().toISOString()
  };
  k(prev=>[...prev, newMat]);
  return newMat;
},[j]),
removeRawMaterial=B.useCallback((key)=>{
  k(prev=>prev.filter(m=>m.key!==key));
  return!0;
},[]),
resetAllRawMaterialsToZero=B.useCallback(()=>{
  k(prev=>prev.map(m=>({...m,currentBalance:0,purchasePrice:0})));
  return!0;
},[]),
updateRawMaterialMaster=B.useCallback(async(key,updates)=>{
  const Ce=new Date().toISOString();
  k(ke=>ke.map(_e=>{
    const isMatch=_e.key===key||(_e.legacyKeys&&_e.legacyKeys.includes(key));
    if(isMatch){
      return {..._e,...updates,lastUpdated:Ce};
    }
    return _e;
  }));
  return!0;
},[]),
he=B.useCallback(async(V,J,ie)=>{
  const Ce=new Date().toISOString(),
        ce=Ce.split("T")[0],
        Oe=a||"Supervisor",
        ze={
          cement:V.cementBags,
          cement_50kg:V.cementBags,
          mchanga_laini:V.sandBuckets,
          sand_bucket:V.sandBuckets,
          chipping:V.chippingBuckets,
          chipping_bucket:V.chippingBuckets,
          kokoto:V.aggregateBuckets,
          aggregate_bucket:V.aggregateBuckets,
          dawa:V.chemicalLiters,
          chemical_liter:V.chemicalLiters,
          rangi_red:V.pigmentRedKg,
          pigment_red_kg:V.pigmentRedKg,
          rangi_black:V.pigmentBlackKg,
          pigment_black_kg:V.pigmentBlackKg
        };
  
  k(_e=>_e.map(Ue=>{
    const deductAmt=ze[Ue.key]||(Ue.legacyKeys&&Ue.legacyKeys.some(lk=>ze[lk])?ze[Ue.legacyKeys.find(lk=>ze[lk])]:0)||0;
    if(deductAmt>0){
      const be=Math.max(0,Number((Ue.currentBalance-deductAmt).toFixed(2)));
      return {...Ue,currentBalance:be,lastUpdated:Ce};
    }
    return Ue;
  }));

  const ke=[];
  for(const[_e,Ue]of Object.entries(ze)){
    if(Ue>0&&!["cement_50kg","sand_bucket","chipping_bucket","aggregate_bucket","chemical_liter","pigment_red_kg","pigment_black_kg"].includes(_e)){
      const K=j.find(be=>be.key===_e||(be.legacyKeys&&be.legacyKeys.includes(_e)));
      ke.push({
        id:crypto.randomUUID?crypto.randomUUID():`raw-mov-${Date.now()}-${_e}-${Math.random().toString(36).slice(2,5)}`,
        materialKey:_e,
        materialName:K?K.name:_e,
        delta:-Ue,
        quantity:Ue,
        unit:(K==null?void 0:K.unit)||"units",
        date:ce,
        type:"production_deduction",
        relatedBatchId:J,
        note:ie||"Automated recipe deduction from production run",
        enteredBy:Oe,
        createdAt:Ce
      });
    }
  }
  return ke.length>0&&L(_e=>[...ke,..._e]),!0;
},[j,a]),Pe=B.useCallback(()=>{k(Fl),L([]),localStorage.removeItem(Xl),localStorage.removeItem(Zl)},[]),resetProductBaseline=B.useCallback(async()=>{E(prev=>prev.filter(m=>m.type!=="opening_balance"));try{const raw=localStorage.getItem(cp);if(raw){const list=JSON.parse(raw);localStorage.setItem(cp,JSON.stringify(list.filter(m=>m.type!=="opening_balance")));}}catch(err){}if(Ht()){try{await Ht().from("movements").delete().eq("type","opening_balance");}catch(err){console.warn("Supabase resetProductBaseline error:",err);}}return!0;},[]),resetLedger=B.useCallback(async()=>{E([]);L([]);try{localStorage.setItem(cp,"[]");localStorage.setItem(Zl,"[]");}catch(err){}if(Ht()){try{await Ht().from("movements").delete().neq("id","00000000-0000-0000-0000-000000000000");}catch(err){console.warn("Supabase resetLedger error:",err);}}return!0;},[]),resetSales=B.useCallback(async()=>{E(prev=>prev.filter(m=>m.type!=="dispatch_out"&&m.type!=="sale_out"));try{const raw=localStorage.getItem(cp);if(raw){const list=JSON.parse(raw);localStorage.setItem(cp,JSON.stringify(list.filter(m=>m.type!=="dispatch_out"&&m.type!=="sale_out")));}sessionStorage.removeItem("stumarcot_sales_tab_draft_v3");sessionStorage.removeItem("stumarcot_sales_tab_draft_v2");sessionStorage.removeItem("stumarcot_sales_tab_draft");if(typeof window!=="undefined"){delete window._stumarcot_sales_draft;}}catch(err){}if(Ht()){try{await Ht().from("movements").delete().in("type",["dispatch_out","sale_out"]);}catch(err){console.warn("Supabase resetSales error:",err);}}return!0;},[]),oe=B.useCallback(async V=>{const J=V.batch_id||(crypto.randomUUID?crypto.randomUUID():`batch-${Date.now()}`),ie=new Date().toISOString(),Ce=a||"Supervisor";let ce=V.computed_materials_deducted||null;if(V.type==="production_in"){const ke=x.find(_e=>_e.id===V.item_id);ke&&(ce=Pa(ke,V.quantity_pcs,V.color),await he(ce,J,`Production run of ${ke.name} (${V.quantity_pcs} pcs)`))}const Oe={...V,id:crypto.randomUUID?crypto.randomUUID():`mov-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,batch_id:J,computed_materials_deducted:ce,entered_by:Ce,created_at:ie};if(E(ke=>[Oe,...ke]),Ht()){Y(!0);const ke=await op([Oe]);Y(!1),ke||console.warn("Failed to insert movement to Supabase, stored locally.")}return!0},[x,a,he]),G=B.useCallback(async V=>{var ke;if(V.length===0)return!0;const J=((ke=V[0])==null?void 0:ke.batch_id)||(crypto.randomUUID?crypto.randomUUID():`batch-${Date.now()}`),ie=new Date().toISOString(),Ce=a||"Supervisor",ce=[],Oe=V.map((_e,Ue)=>{const K=x.find(Ae=>Ae.id===_e.item_id);let be=_e.computed_materials_deducted||null;return _e.type==="production_in"&&K&&_e.quantity_pcs>0&&(be=Pa(K,_e.quantity_pcs,_e.color),ce.push({item:K,pieces:_e.quantity_pcs,color:_e.color})),{..._e,id:crypto.randomUUID?crypto.randomUUID():`mov-${Date.now()}-${Ue}-${Math.random().toString(36).slice(2,6)}`,batch_id:_e.batch_id||J,computed_materials_deducted:be,entered_by:Ce,created_at:ie}});if(ce.length>0){const _e=lg(ce);await he(_e,J,`Batch production of ${ce.length} product entries (${V.reduce((Ue,K)=>Ue+(K.quantity_pcs||0),0)} pcs)`)}if(E(_e=>[...Oe,..._e]),Ht()){Y(!0);const _e=await op(Oe);Y(!1),_e||console.warn("Failed to insert movements batch to Supabase, stored locally.")}return!0},[x,a,he]),ue=B.useCallback(async V=>{const J=new Date().toISOString(),ie={...V,updated_at:J};return b(ce=>ce.map(Oe=>Oe.id===V.id?ie:Oe)),Ht()&&(Y(!0),await Av(ie),Y(!1)),!0},[]),P=B.useCallback(async V=>{const J=new Date().toISOString(),ie={...V,id:crypto.randomUUID?crypto.randomUUID():`item-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,created_at:J,updated_at:J};return b(ce=>[ie,...ce]),Ht()&&(Y(!0),await Iv(ie),Y(!1)),ie},[]),deleteItem=B.useCallback(async itemId=>{b(ce=>ce.filter(Oe=>Oe.id!==itemId));E(ce=>ce.filter(Oe=>Oe.item_id!==itemId));try{const rawItems=localStorage.getItem(lp);if(rawItems){const list=JSON.parse(rawItems);localStorage.setItem(lp,JSON.stringify(list.filter(Oe=>Oe.id!==itemId)));}const rawMovs=localStorage.getItem(cp);if(rawMovs){const list=JSON.parse(rawMovs);localStorage.setItem(cp,JSON.stringify(list.filter(Oe=>Oe.item_id!==itemId)));}}catch(err){}const client=Ht();if(client){try{Y(!0);await client.from("movements").delete().eq("item_id",itemId);await client.from("items").delete().eq("id",itemId);Y(!1);}catch(err){Y(!1);console.warn("Supabase deleteItem error:",err);}}return!0;},[]),deleteMovements=B.useCallback(async target=>{let predicate;if(Array.isArray(target)||typeof target==="string"){const idsSet=new Set(Array.isArray(target)?target:[target]);predicate=mov=>idsSet.has(mov.id);}else if(target&&typeof target==="object"){predicate=mov=>{if(target.batch_id&&mov.batch_id===target.batch_id)return!0;if(target.item_id&&mov.item_id===target.item_id&&(!target.type||mov.type===target.type))return!0;if(target.ids&&target.ids.includes(mov.id))return!0;return!1;};}else{return[];}let removedMovs=[];E(prev=>{removedMovs=prev.filter(predicate);return prev.filter(mov=>!predicate(mov));});try{const rawMovs=localStorage.getItem(cp);if(rawMovs){const list=JSON.parse(rawMovs);localStorage.setItem(cp,JSON.stringify(list.filter(mov=>!predicate(mov))));}}catch(err){}const client=Ht();if(client&&removedMovs.length>0){try{const idsToRemove=removedMovs.map(m=>m.id).filter(Boolean);if(idsToRemove.length>0){Y(!0);await client.from("movements").delete().in("id",idsToRemove);Y(!1);}}catch(err){Y(!1);console.warn("Supabase deleteMovements error:",err);}}return removedMovs;},[]),y=B.useMemo(()=>{const V=new Map;for(const ce of w){const Oe=V.get(ce.item_id)||[];Oe.push(ce),V.set(ce.item_id,Oe)}const{productionVolumePcs:J,salesVelocityPcs:ie,totalMovementVolume:Ce}=vc(w);return x.map(ce=>{const Oe=V.get(ce.id)||[],ze={};if(ce.colors&&ce.colors.length>0)for(const Ze of ce.colors)ze[Ze]={pcs:0,sqm:null};let ke=0,_e=null;for(const Ze of Oe){(!_e||Ze.date>_e)&&(_e=Ze.date);const kt=Ze.delta<0?-Ze.quantity_pcs:Ze.quantity_pcs;ke+=kt;const Xn=Ze.color||"Standard";ze[Xn]||(ze[Xn]={pcs:0,sqm:null}),ze[Xn].pcs+=kt}let Ue=null;if(ce.unit==="sqm"&&ce.pcs_per_sqm&&ce.pcs_per_sqm>0){Ue=Number((ke/ce.pcs_per_sqm).toFixed(2));for(const Ze of Object.keys(ze))ze[Ze].sqm=Number((ze[Ze].pcs/ce.pcs_per_sqm).toFixed(2))}const K=Ue!==null?Ue:ke,be=ce.reorder_level!==null&&ce.reorder_level!==void 0&&(ce.unit==="sqm"&&Ue!==null?Ue<=ce.reorder_level:ke<=ce.reorder_level),Ae=lt(ce),qe=ce.moldCount??Ae.moldCount??50,Ve=ce.unit==="sqm"&&ce.pcs_per_sqm&&ce.pcs_per_sqm>0?Number((qe/ce.pcs_per_sqm).toFixed(2)):Ae.moldAreaSqm,Me=J.get(ce.id)||0,Xe=ie.get(ce.id)||0,St=Ce.get(ce.id)||0;return{item:ce,total_pcs:Math.max(0,ke),total_sqm:Ue!==null?Math.max(0,Ue):null,current_balance:Math.max(0,K),by_color:ze,is_low_stock:be,last_movement_date:_e,total_movements_count:Oe.length,moldCount:qe,dailyCapacityPcs:qe,dailyCapacitySqm:Ve,production_volume_pcs:Me,sales_volume_pcs:Xe,total_velocity_score:St}})},[x,w]),O=B.useCallback(V=>y.find(J=>J.item.id===V),[y]),z=B.useMemo(()=>new Date().toISOString().split("T")[0],[]),T=B.useMemo(()=>w.filter(V=>V.date===z),[w,z]),N=T.length,S=B.useMemo(()=>T.filter(V=>V.type==="production_in").reduce((V,J)=>V+(J.quantity_pcs||0),0),[T]),D=B.useMemo(()=>T.filter(V=>V.type==="production_in"&&V.quantity_sqm!==null).reduce((V,J)=>V+(J.quantity_sqm||0),0),[T]),F=B.useMemo(()=>y.filter(V=>V.is_low_stock).length,[y]),Z=B.useMemo(()=>x.reduce((V,J)=>V+(J.moldCount||lt(J).moldCount||0),0),[x]),se=B.useMemo(()=>T.filter(V=>V.type==="production_in").reduce((V,J)=>V+(J.quantity_pcs||0),0),[T]),we=B.useMemo(()=>Z<=0?0:Math.min(100,Number((se/Z*100).toFixed(1))),[Z,se]);return o.jsx(Wp.Provider,{value:{isUnlocked:t,staffName:a,unlock:Be,lock:M,setStaffName:ee,recentStaffNames:u,adminSettings:f,updateAdminSettings:g,resetAdminSettings:_,items:x,movements:w,isLoading:W,isSyncing:ne,isSupabaseConnected:ae,supabaseUrl:xe,rawMaterials:j,rawMaterialMovements:A,recordRawMaterialBaselineBatch:recordRawMaterialBaselineBatch,addRawMaterialStock:le,updateRawMaterialMaster:updateRawMaterialMaster,addRawMaterial:addRawMaterial,removeRawMaterial:removeRawMaterial,resetAllRawMaterialsToZero:resetAllRawMaterialsToZero,deductRawMaterialsBatch:he,resetRawMaterialsToDefault:Pe,resetProductBaseline:resetProductBaseline,resetLedger:resetLedger,resetSales:resetSales,addMovement:oe,addMovementsBatch:G,updateItem:ue,addItem:P,deleteItem:deleteItem,removeItem:deleteItem,deleteMovements:deleteMovements,refreshData:Ie,stockSummaries:y,getStockSummary:O,todayMovementsCount:N,todayProductionPcs:S,todayProductionSqm:D,lowStockCount:F,totalFactoryMolds:Z,todayMoldsInUse:se,overallMoldUtilizationPct:we},children:s})},Vt=()=>{const s=B.useContext(Wp);if(!s)throw new Error("useApp must be used within an AppProvider");return s};/**
 * @license lucide-react v1.41.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hp=(...s)=>s.filter((t,r,a)=>!!t&&t.trim()!==""&&a.indexOf(t)===r).join(" ").trim();/**
 * @license lucide-react v1.41.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lv=s=>s.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.41.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qv=s=>s.repla