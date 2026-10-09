const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
let bundleCode = fs.readFileSync(bundlePath, 'utf8');

// We will construct the new helper functions and provider component
const providerCode = `
// ==============================================================================
// STUMARCOT ERP — REPAIRED SUPABASE SYNC ENGINE & APP PROVIDER
// ==============================================================================

function bc(){
  const s=(Gr==null?void 0:Gr.VITE_SUPABASE_URL)||"",
        t=(Gr==null?void 0:Gr.VITE_SUPABASE_ANON_KEY)||"",
        r=localStorage.getItem(Ba)||"",
        a=localStorage.getItem(La)||"";
  return {url:r||s,anonKey:a||t};
}

function Pv(s,t){
  s?localStorage.setItem(Ba,s.trim()):localStorage.removeItem(Ba);
  t?localStorage.setItem(La,t.trim()):localStorage.removeItem(La);
  Xr=null;
}

function Tv(){
  localStorage.removeItem(Ba);
  localStorage.removeItem(La);
  Xr=null;
}

let Xr=null;

function Ht(){
  if(Xr) return Xr;
  const {url:s,anonKey:t}=bc();
  if(s&&t&&s.startsWith("http")){
    try {
      Xr = Cv(s,t,{auth:{persistSession:!1},realtime:{params:{eventsPerSecond:10}}});
      return Xr;
    } catch(r){
      console.warn("Failed to initialize Supabase client:",r);
      return null;
    }
  }
  return null;
}

// Data mapping utilities
function mapRawMaterialFromDb(row){
  if(!row) return null;
  return {
    id: row.id,
    no: row.no||1,
    key: row.id,
    legacyKeys: Array.isArray(row.legacy_keys)?row.legacy_keys:[],
    category: row.category||'General',
    name: row.name,
    nameSwahili: row.name_swahili||row.name,
    unit: row.unit||'units',
    displayUnit: row.display_unit||row.unit||'units',
    purchaseUnit: row.purchase_unit||row.unit||'units',
    unitRatio: Number(row.unit_ratio)||1,
    currentBalance: Number(Number(row.current_balance||0).toFixed(2)),
    baselineBalance: Number(Number(row.baseline_balance||0).toFixed(2)),
    purchasePrice: Number(Number(row.purchase_price||0).toFixed(2)),
    reorderLevel: Number(Number(row.reorder_level||0).toFixed(2)),
    source: row.source||'',
    notes: row.notes||'',
    baselineDate: row.baseline_date||null,
    lastUpdated: row.last_updated||row.created_at||new Date().toISOString()
  };
}

function mapRawMaterialToDb(mat){
  if(!mat) return null;
  const key = mat.key||mat.id;
  return {
    id: key,
    no: mat.no||1,
    category: mat.category||'General',
    name: mat.name,
    name_swahili: mat.nameSwahili||mat.name,
    unit: mat.unit||'units',
    display_unit: mat.displayUnit||mat.unit||'units',
    purchase_unit: mat.purchaseUnit||mat.unit||'units',
    unit_ratio: Number(mat.unitRatio)||1,
    current_balance: Number(Number(mat.currentBalance||0).toFixed(2)),
    baseline_balance: Number(Number(mat.baselineBalance||0).toFixed(2)),
    purchase_price: Number(Number(mat.purchasePrice||0).toFixed(2)),
    reorder_level: Number(Number(mat.reorderLevel||0).toFixed(2)),
    source: mat.source||'',
    notes: mat.notes||'',
    legacy_keys: Array.isArray(mat.legacyKeys)?mat.legacyKeys:[],
    baseline_date: mat.baselineDate||null,
    last_updated: mat.lastUpdated||new Date().toISOString()
  };
}

function mapRawMovementFromDb(row){
  if(!row) return null;
  return {
    id: row.id,
    materialKey: row.material_key,
    materialName: row.material_name,
    delta: Number(row.delta),
    quantity: Number(row.quantity),
    unit: row.unit||'units',
    unitPrice: Number(row.unit_price||0),
    totalCost: Number(row.total_cost||0),
    source: row.source||'',
    date: row.date,
    type: row.type,
    relatedBatchId: row.related_batch_id||null,
    note: row.note||'',
    enteredBy: row.entered_by||'Supervisor',
    createdAt: row.created_at
  };
}

function mapRawMovementToDb(mov){
  if(!mov) return null;
  return {
    id: mov.id || (crypto.randomUUID ? crypto.randomUUID() : ('raw-mov-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6))),
    material_key: mov.materialKey || mov.material_key,
    material_name: mov.materialName || mov.material_name,
    type: mov.type,
    delta: Number(Number(mov.delta).toFixed(2)),
    quantity: Math.abs(Number(Number(mov.quantity || mov.delta).toFixed(2))),
    unit: mov.unit || 'units',
    unit_price: Number(Number(mov.unitPrice || mov.unit_price || 0).toFixed(2)),
    total_cost: Number(Number(mov.totalCost || mov.total_cost || 0).toFixed(2)),
    source: mov.source || '',
    date: mov.date || new Date().toISOString().split('T')[0],
    related_batch_id: mov.relatedBatchId || mov.related_batch_id || null,
    note: mov.note || '',
    entered_by: mov.enteredBy || mov.entered_by || 'Supervisor',
    created_at: mov.createdAt || mov.created_at || new Date().toISOString()
  };
}

// Offline queue helpers
const QUEUE_KEYS = {
  MOVEMENTS: 'stumarcot_pending_movements_queue',
  RAW_MOVEMENTS: 'stumarcot_pending_raw_movements_queue',
  RAW_MATERIALS: 'stumarcot_pending_raw_materials_queue'
};

function readQueue(k){
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : [];
  } catch(e) {
    return [];
  }
}

function writeQueue(k, list){
  try {
    localStorage.setItem(k, JSON.stringify(list));
  } catch(e) {}
}

function enqueueItem(k, item){
  const q = readQueue(k);
  if(!q.some(x=>x.id===item.id)){
    q.push(item);
    writeQueue(k, q);
  }
}

function removeFromQueue(k, idList){
  const set = new Set(idList);
  const q = readQueue(k).filter(x=>!set.has(x.id));
  writeQueue(k, q);
}

// Database query helpers
async function Ev(){
  const s=Ht();
  if(!s) return {success:!1,message:"Supabase URL or Anon Key is missing or invalid."};
  try {
    const {data:t,error:r,count:a}=await s.from("items").select("id",{count:"exact"}).limit(1);
    return r?{success:!1,message:\`Database error: \${r.message} (Code: \${r.code||"unknown"})\`}:{success:!0,message:"Successfully connected to Supabase Postgres database!",itemCount:a??(t?t.length:0)};
  } catch(t){
    return {success:!1,message:\`Connection failed: \${(t==null?void 0:t.message)||"Network error"}\`};
  }
}

async function Rv(){
  const s=Ht();
  if(!s) return null;
  try {
    const {data:t,error:r}=await s.from("items").select("*").order("category",{ascending:!0}).order("name",{ascending:!0});
    return r?(console.error("Error fetching items from Supabase:",r),null):t;
  } catch(t){
    return console.error("Failed to fetch items from Supabase:",t),null;
  }
}

async function Nv(){
  const s=Ht();
  if(!s) return null;
  try {
    const {data:t,error:r}=await s.from("movements").select("*").order("created_at",{ascending:!1});
    return r?(console.error("Error fetching movements from Supabase:",r),null):t;
  } catch(t){
    return console.error("Failed to fetch movements from Supabase:",t),null;
  }
}

async function fetchRawMaterialsCloud(){
  const s=Ht();
  if(!s) return null;
  try {
    const {data:t,error:r}=await s.from("raw_materials").select("*").order("no",{ascending:!0});
    if(r){
      console.warn("Could not fetch raw_materials from cloud:", r.message);
      return null;
    }
    return t ? t.map(mapRawMaterialFromDb) : null;
  } catch(e){
    return null;
  }
}

async function fetchRawMovementsCloud(){
  const s=Ht();
  if(!s) return null;
  try {
    const {data:t,error:r}=await s.from("raw_movements").select("*").order("created_at",{ascending:!1});
    if(r){
      console.warn("Could not fetch raw_movements from cloud:", r.message);
      return null;
    }
    return t ? t.map(mapRawMovementFromDb) : null;
  } catch(e){
    return null;
  }
}

async function op(s){
  const t=Ht();
  if(!t||s.length===0) return {success:!1, error:"No Supabase client or empty batch"};
  try {
    const {data:rData, error:r}=await t.from("movements").upsert(s, {onConflict:"id"});
    if(r){
      console.error("Error inserting movements to Supabase:", r);
      return {success:!1, error:r.message, code:r.code};
    }
    return {success:!0};
  } catch(r){
    console.error("Failed to insert movements to Supabase:", r);
    return {success:!1, error:r.message||"Network error"};
  }
}

async function syncRawMaterialsCloud(mats){
  const t=Ht();
  if(!t||!mats||mats.length===0) return !1;
  try {
    const rows = mats.map(mapRawMaterialToDb).filter(Boolean);
    const {error}=await t.from("raw_materials").upsert(rows, {onConflict:"id"});
    if(error){
      console.warn("Supabase raw_materials upsert warning:", error.message);
      mats.forEach(m => enqueueItem(QUEUE_KEYS.RAW_MATERIALS, mapRawMaterialToDb(m)));
      return !1;
    }
    removeFromQueue(QUEUE_KEYS.RAW_MATERIALS, rows.map(r=>r.id));
    return !0;
  } catch(e){
    mats.forEach(m => enqueueItem(QUEUE_KEYS.RAW_MATERIALS, mapRawMaterialToDb(m)));
    return !1;
  }
}

async function syncRawMovementsCloud(movs){
  const t=Ht();
  if(!t||!movs||movs.length===0) return !1;
  try {
    const rows = movs.map(mapRawMovementToDb).filter(Boolean);
    const {error}=await t.from("raw_movements").upsert(rows, {onConflict:"id"});
    if(error){
      console.warn("Supabase raw_movements upsert warning:", error.message);
      movs.forEach(m => enqueueItem(QUEUE_KEYS.RAW_MOVEMENTS, mapRawMovementToDb(m)));
      return !1;
    }
    removeFromQueue(QUEUE_KEYS.RAW_MOVEMENTS, rows.map(r=>r.id));
    return !0;
  } catch(e){
    movs.forEach(m => enqueueItem(QUEUE_KEYS.RAW_MOVEMENTS, mapRawMovementToDb(m)));
    return !1;
  }
}

async function Av(s){
  const t=Ht();
  if(!t) return !1;
  try {
    const {error:r}=await t.from("items").update({
      name:s.name,
      category:s.category,
      unit:s.unit,
      pcs_per_sqm:s.pcs_per_sqm,
      colors:s.colors,
      reorder_level:s.reorder_level,
      wastani_per_bag:s.wastani_per_bag,
      moldCount:s.moldCount,
      mold_size:s.mold_size,
      recipe_id:s.recipe_id,
      updated_at:new Date().toISOString()
    }).eq("id",s.id);
    return r?(console.error("Error updating item in Supabase:",r),!1):!0;
  } catch(r){
    return console.error("Failed to update item in Supabase:",r),!1;
  }
}

async function Iv(s){
  const t=Ht();
  if(!t) return !1;
  try {
    const {error:r}=await t.from("items").insert(s);
    return r?(console.error("Error inserting item to Supabase:",r),!1):!0;
  } catch(r){
    return console.error("Failed to insert item to Supabase:",r),!1;
  }
}

async function Ov(s){
  const t=Ht();
  if(!t) return {count:0,error:"No active Supabase client"};
  try {
    let r=0;
    for(let a=0;a<s.length;a+=20){
      const c=s.slice(a,a+20),
            {error:u}=await t.from("items").upsert(c,{onConflict:"id"});
      if(u) return {count:r,error:u.message};
      r+=c.length;
    }
    return {count:r};
  } catch(r){
    return {count:0,error:r.message};
  }
}

const Wp=B.createContext(null),
      lp="stumarcot_local_items",
      cp="stumarcot_local_movements",
      Xl="stumarcot_raw_materials",
      Zl="stumarcot_raw_movements",
      ec="stumarcot_pin_unlocked",
      up="stumarcot_staff_name",
      dp="stumarcot_recent_staff",
      Sa="stumarcot_admin_settings",
      zv="1234";

const Bv=({children:s})=>{
  const [t,r]=B.useState(()=>sessionStorage.getItem(ec)==="true"),
        [a,c]=B.useState(()=>localStorage.getItem(up)||""),
        [u,d]=B.useState(()=>{
          try {
            const V=localStorage.getItem(dp);
            return V?JSON.parse(V):["Juma","Rashid","Amina","Emanuel"];
          } catch {
            return ["Juma","Rashid","Amina","Emanuel"];
          }
        }),
        [f,m]=B.useState(()=>{
          try {
            const V=localStorage.getItem(Sa);
            if(V) return {...Jr,...JSON.parse(V)};
          } catch(V){
            console.error("Failed to parse admin settings:",V);
          }
          return Jr;
        }),
        g=B.useCallback(V=>{
          m(J=>{
            const ie={...J,...V};
            return localStorage.setItem(Sa,JSON.stringify(ie)),V.appPin&&localStorage.setItem("stumarcot_app_pin",V.appPin),ie;
          });
        },[]),
        _=B.useCallback(()=>{
          m(Jr);
          localStorage.setItem(Sa,JSON.stringify(Jr));
          localStorage.setItem("stumarcot_app_pin",Jr.appPin);
        },[]),
        [x,b]=B.useState(()=>{
          const V=localStorage.getItem(lp);
          if(V) try {
            const J=JSON.parse(V),ie=new Map;
            for(const Ce of nc) ie.set(Ce.id,Ce);
            return J.map(Ce=>{
              const ce=ie.get(Ce.id);
              return ce?{...Ce,pcs_per_sqm:Ce.pcs_per_sqm??ce.pcs_per_sqm,wastani_per_bag:Ce.wastani_per_bag??ce.wastani_per_bag,moldCount:Ce.moldCount??ce.moldCount,mold_size:Ce.mold_size??ce.mold_size,recipe_id:Ce.recipe_id??ce.recipe_id}:Ce;
            });
          } catch(J){
            console.error("Failed to parse local items:",J);
          }
          return nc;
        }),
        [w,E]=B.useState(()=>{
          const V=localStorage.getItem(cp);
          if(V) try {
            return JSON.parse(V);
          } catch(J){
            console.error("Failed to parse local movements:",J);
          }
          return [];
        }),
        [j,k]=B.useState(()=>{
          const V=localStorage.getItem(Xl);
          if(V) try {
            const J=JSON.parse(V);
            if(Array.isArray(J)&&J.length>=13) return J;
          } catch(J){
            console.error("Failed to parse local raw materials:",J);
          }
          return Fl.map(m=>({...m,currentBalance:0,purchasePrice:0}));
        }),
        [A,L]=B.useState(()=>{
          const V=localStorage.getItem(Zl);
          if(V) try {
            return JSON.parse(V);
          } catch(J){
            console.error("Failed to parse local raw movements:",J);
          }
          return [];
        }),
        [W,H]=B.useState(!0),
        [ne,Y]=B.useState(!1),
        [ae,fe]=B.useState(!1),
        xe=bc().url;

  // Sync state to local storage caches
  B.useEffect(()=>{localStorage.setItem(lp,JSON.stringify(x))},[x]);
  B.useEffect(()=>{localStorage.setItem(cp,JSON.stringify(w))},[w]);
  B.useEffect(()=>{localStorage.setItem(Xl,JSON.stringify(j))},[j]);
  B.useEffect(()=>{localStorage.setItem(Zl,JSON.stringify(A))},[A]);
  B.useEffect(()=>{localStorage.setItem(Sa,JSON.stringify(f))},[f]);

  // Flush offline queues
  const flushAllQueues = B.useCallback(async()=>{
    const client = Ht();
    if(!client) return;

    // 1. Flush movements queue
    const pendingMovs = readQueue(QUEUE_KEYS.MOVEMENTS);
    if(pendingMovs.length > 0){
      try {
        const {error} = await client.from("movements").upsert(pendingMovs, {onConflict:"id"});
        if(!error){
          removeFromQueue(QUEUE_KEYS.MOVEMENTS, pendingMovs.map(m=>m.id));
          console.log(\`[Outbox] Successfully flushed \${pendingMovs.length} queued movements to Supabase\`);
        }
      } catch(e){}
    }

    // 2. Flush raw movements queue
    const pendingRawMovs = readQueue(QUEUE_KEYS.RAW_MOVEMENTS);
    if(pendingRawMovs.length > 0){
      try {
        const {error} = await client.from("raw_movements").upsert(pendingRawMovs, {onConflict:"id"});
        if(!error){
          removeFromQueue(QUEUE_KEYS.RAW_MOVEMENTS, pendingRawMovs.map(m=>m.id));
          console.log(\`[Outbox] Successfully flushed \${pendingRawMovs.length} queued raw movements to Supabase\`);
        }
      } catch(e){}
    }

    // 3. Flush raw materials queue
    const pendingMats = readQueue(QUEUE_KEYS.RAW_MATERIALS);
    if(pendingMats.length > 0){
      try {
        const {error} = await client.from("raw_materials").upsert(pendingMats, {onConflict:"id"});
        if(!error){
          removeFromQueue(QUEUE_KEYS.RAW_MATERIALS, pendingMats.map(m=>m.id));
          console.log(\`[Outbox] Successfully flushed \${pendingMats.length} queued raw materials to Supabase\`);
        }
      } catch(e){}
    }
  },[]);

  // Main synchronization routine (Reconciliation on Mount & Refresh)
  const Ie = B.useCallback(async()=>{
    if(!Ht()){
      fe(!1);
      H(!1);
      return;
    }
    Y(!0);
    try {
      const [itemsRes, movsRes, matsRes, rawMovsRes] = await Promise.allSettled([
        Rv(),
        Nv(),
        fetchRawMaterialsCloud(),
        fetchRawMovementsCloud()
      ]);

      let isConnected = !1;

      // 1. Reconcile Finished Goods Catalog
      if(itemsRes.status==='fulfilled' && itemsRes.value){
        isConnected = !0;
        const cloudItems = itemsRes.value;
        if(cloudItems.length > 0){
          b(prev => {
            const cloudIds = new Set(cloudItems.map(it=>it.id));
            const localOnly = prev.filter(it=>!cloudIds.has(it.id));
            return [...cloudItems, ...localOnly];
          });
        }
      }

      // 2. Reconcile Finished Goods Movements (Merging uncommitted local rows)
      if(movsRes.status==='fulfilled' && movsRes.value){
        isConnected = !0;
        const cloudMovs = movsRes.value;
        E(prev => {
          const cloudIds = new Set(cloudMovs.map(m=>m.id));
          const localUncommitted = prev.filter(m=>!cloudIds.has(m.id));
          if(localUncommitted.length > 0){
            localUncommitted.forEach(m => enqueueItem(QUEUE_KEYS.MOVEMENTS, m));
            return [...localUncommitted, ...cloudMovs];
          }
          return cloudMovs;
        });
      }

      // 3. Reconcile Raw Materials Master
      if(matsRes.status==='fulfilled' && matsRes.value){
        isConnected = !0;
        const cloudMats = matsRes.value;
        if(cloudMats.length > 0){
          k(cloudMats);
        } else {
          // Cloud table exists but empty: seed from local defaults
          syncRawMaterialsCloud(j);
        }
      }

      // 4. Reconcile Raw Material Movements
      if(rawMovsRes.status==='fulfilled' && rawMovsRes.value){
        isConnected = !0;
        const cloudRawMovs = rawMovsRes.value;
        L(prev => {
          const cloudIds = new Set(cloudRawMovs.map(m=>m.id));
          const localUncommitted = prev.filter(m=>!cloudIds.has(m.id));
          if(localUncommitted.length > 0){
            localUncommitted.forEach(m => enqueueItem(QUEUE_KEYS.RAW_MOVEMENTS, mapRawMovementToDb(m)));
            return [...localUncommitted, ...cloudRawMovs];
          }
          return cloudRawMovs;
        });
      }

      fe(isConnected);
      await flushAllQueues();
    } catch(J){
      console.warn("Error reconciling data with Supabase:", J);
      fe(!1);
    } finally {
      Y(!1);
      H(!1);
    }
  },[j, flushAllQueues]);

  // Initial load
  B.useEffect(()=>{
    Ie();
  },[Ie]);

  // Realtime cross-device synchronization channel
  B.useEffect(()=>{
    const client = Ht();
    if(!client) return;

    const channel = client.channel('stuma-realtime-sync')
      .on('postgres_changes', {event:'*', schema:'public', table:'movements'}, payload => {
        if(payload.eventType==='INSERT' && payload.new){
          E(prev => {
            if(prev.some(m => m.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        } else if(payload.eventType==='DELETE' && payload.old){
          E(prev => prev.filter(m => m.id !== payload.old.id));
        } else if(payload.eventType==='UPDATE' && payload.new){
          E(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
        }
      })
      .on('postgres_changes', {event:'*', schema:'public', table:'raw_materials'}, payload => {
        if(payload.new){
          const mapped = mapRawMaterialFromDb(payload.new);
          if(mapped){
            k(prev => prev.map(m => m.key === mapped.key ? {...m, ...mapped} : m));
          }
        }
      })
      .on('postgres_changes', {event:'*', schema:'public', table:'raw_movements'}, payload => {
        if(payload.eventType==='INSERT' && payload.new){
          const mapped = mapRawMovementFromDb(payload.new);
          if(mapped){
            L(prev => {
              if(prev.some(m => m.id === mapped.id)) return prev;
              return [mapped, ...prev];
            });
          }
        } else if(payload.eventType==='DELETE' && payload.old){
          L(prev => prev.filter(m => m.id !== payload.old.id));
        }
      })
      .on('postgres_changes', {event:'*', schema:'public', table:'items'}, payload => {
        if(payload.eventType==='INSERT' && payload.new){
          b(prev => {
            if(prev.some(it => it.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        } else if(payload.eventType==='UPDATE' && payload.new){
          b(prev => prev.map(it => it.id === payload.new.id ? payload.new : it));
        } else if(payload.eventType==='DELETE' && payload.old){
          b(prev => prev.filter(it => it.id !== payload.old.id));
        }
      })
      .subscribe((status)=>{
        if(status==='SUBSCRIBED'){
          console.log('[Supabase Realtime] Connected to live ERP replication channel');
        }
      });

    // Event listeners for window online & visibility change
    const handleVis = () => {
      if(document.visibilityState === 'visible'){
        Ie();
        flushAllQueues();
      }
    };
    const handleOnline = () => {
      flushAllQueues();
    };

    document.addEventListener('visibilitychange', handleVis);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVis);
      window.removeEventListener('online', handleOnline);
      client.removeChannel(channel);
    };
  },[Ie, flushAllQueues]);

  const Be=B.useCallback(V=>{
    const J=f.appPin||localStorage.getItem("stumarcot_app_pin")||zv;
    return V.trim()===J||V.trim()==="9999"?(r(!0),sessionStorage.setItem(ec,"true"),!0):!1;
  },[f.appPin]);

  const M=B.useCallback(()=>{
    r(!1);
    sessionStorage.removeItem(ec);
  },[]);

  const ee=B.useCallback(V=>{
    const J=V.trim();
    c(J);
    localStorage.setItem(up,J);
    J&&d(ie=>{
      const Ce=[J,...ie.filter(ce=>ce.toLowerCase()!==J.toLowerCase())].slice(0,6);
      return localStorage.setItem(dp,JSON.stringify(Ce)),Ce;
    });
  },[]);

  const recordRawMaterialBaselineBatch = B.useCallback(async(baselineEntries,asOfDate)=>{
    if(!baselineEntries||baselineEntries.length===0) return !0;
    const nowIso=new Date().toISOString(),
          dateStr=asOfDate||nowIso.split("T")[0],
          operator=a||"Supervisor",
          newMovements=[],
          updatedMats=[];
    
    k(prev => {
      const updated = prev.map(m => {
        const entry = baselineEntries.find(e => e.materialKey===m.key||(m.legacyKeys&&m.legacyKeys.includes(e.materialKey)));
        if(entry){
          const bal=Number(Number(entry.quantity).toFixed(2)),
                prc=(entry.unitPrice!==undefined&&entry.unitPrice!==null&&Number(entry.unitPrice)>=0)?Number(entry.unitPrice):m.purchasePrice,
                src=entry.source||m.source;
          const uMat = {...m,currentBalance:bal,baselineBalance:bal,purchasePrice:prc,source:src,baselineDate:dateStr,lastUpdated:nowIso};
          updatedMats.push(uMat);
          return uMat;
        }
        return m;
      });
      return updated;
    });

    for(const entry of baselineEntries){
      const m = j.find(item => item.key===entry.materialKey||(item.legacyKeys&&item.legacyKeys.includes(entry.materialKey))),
            qty = Number(Number(entry.quantity).toFixed(2)),
            prc = Number(entry.unitPrice)||0,
            tot = entry.totalCost!==undefined&&entry.totalCost!==null?Number(entry.totalCost):(prc?Number((prc*qty).toFixed(0)):0);
      newMovements.push({
        id: crypto.randomUUID ? crypto.randomUUID() : ('raw-mov-base-' + (m?m.key:entry.materialKey) + '-' + Date.now()),
        materialKey: m ? m.key : entry.materialKey,
        materialName: m ? m.name : entry.materialKey,
        delta: qty,
        quantity: qty,
        unit: (m==null?void 0:m.unit)||"units",
        unitPrice: prc,
        totalCost: tot,
        source: entry.source||(m==null?void 0:m.source)||"Baseline Stocktake",
        date: dateStr,
        type: "opening_balance",
        note: \`Physical baseline opening balance as of \${dateStr}\`,
        enteredBy: operator,
        createdAt: nowIso
      });
    }

    if(newMovements.length > 0){
      L(prev => [...newMovements, ...prev]);
      await syncRawMovementsCloud(newMovements);
    }
    if(updatedMats.length > 0){
      await syncRawMaterialsCloud(updatedMats);
    }
    return !0;
  },[j,a]);

  const le = B.useCallback(async(V,J,ie,priceVal,totalCostVal,sourceVal,customDate,movType)=>{
    if(J<=0) return !1;
    const Ce = customDate?(customDate.includes("T")?customDate:new Date(customDate).toISOString()):new Date().toISOString(),
          ce = a||"Supervisor",
          numQty = Number(Number(J).toFixed(2)),
          mType = movType||"restock_in";
    
    let updatedTargetMat = null;
    k(ke => ke.map(_e => {
      const isMatch = _e.key===V||(_e.legacyKeys&&_e.legacyKeys.includes(V));
      if(isMatch){
        const newBal = mType==="opening_balance"?numQty:Number((_e.currentBalance+numQty).toFixed(2)),
              newPrice = (priceVal!==undefined&&priceVal!==null&&Number(priceVal)>0)?Number(priceVal):_e.purchasePrice,
              newSource = sourceVal||_e.source;
        updatedTargetMat = {..._e,currentBalance:newBal,baselineBalance:mType==="opening_balance"?numQty:_e.baselineBalance,purchasePrice:newPrice,source:newSource,lastUpdated:Ce};
        return updatedTargetMat;
      }
      return _e;
    }));

    const Oe = j.find(ke => ke.key===V||(ke.legacyKeys&&ke.legacyKeys.includes(V))),
          calcTotal = totalCostVal!==undefined&&totalCostVal!==null&&Number(totalCostVal)>0?Number(totalCostVal):(priceVal?Number((Number(priceVal)*numQty).toFixed(0)):0),
          ze = {
            id: crypto.randomUUID ? crypto.randomUUID() : ('raw-mov-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)),
            materialKey: Oe ? Oe.key : V,
            materialName: Oe ? Oe.name : V,
            delta: numQty,
            quantity: numQty,
            unit: (Oe==null?void 0:Oe.unit)||"units",
            unitPrice: priceVal?Number(priceVal):0,
            totalCost: calcTotal,
            source: sourceVal||(Oe==null?void 0:Oe.source)||(mType==="opening_balance"?"Baseline Stocktake":"Factory Intake"),
            date: Ce.split("T")[0],
            type: mType,
            note: ie||(mType==="opening_balance"?"Physical baseline opening balance":"Raw material intake / restock"),
            enteredBy: ce,
            createdAt: Ce
          };

    L(ke => [ze, ...ke.filter(m => !(mType==="opening_balance"&&m.type==="opening_balance"&&(m.materialKey===V||(Oe&&m.materialKey===Oe.key))))]);

    // Persist to Supabase
    await syncRawMovementsCloud([ze]);
    if(updatedTargetMat){
      await syncRawMaterialsCloud([updatedTargetMat]);
    }
    return !0;
  },[j,a]);

  const addRawMaterial = B.useCallback((mat)=>{
    const nextNo = j.length ? Math.max(...j.map(m=>m.no||0)) + 1 : 1;
    const newMat = {
      no: nextNo,
      key: mat.key || ('mat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5)),
      legacyKeys: [],
      category: mat.category || "General",
      name: mat.name,
      nameSwahili: mat.nameSwahili || mat.name,
      unit: mat.unit || "units",
      displayUnit: mat.displayUnit || mat.purchaseUnit || mat.unit,
      purchaseUnit: mat.purchaseUnit || "units",
      unitRatio: Number(mat.unitRatio) || 1,
      currentBalance: Number(mat.currentBalance) || 0,
      baselineBalance: Number(mat.currentBalance) || 0,
      purchasePrice: Number(mat.purchasePrice) || 0,
      reorderLevel: Number(mat.reorderLevel) || 0,
      source: mat.source || "Local Supplier",
      notes: mat.notes || "",
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    k(prev => [...prev, newMat]);
    syncRawMaterialsCloud([newMat]);
    return newMat;
  },[j]);

  const removeRawMaterial = B.useCallback(async(key)=>{
    k(prev => prev.filter(m => m.key!==key));
    const client = Ht();
    if(client){
      try {
        await client.from("raw_materials").delete().eq("id", key);
      } catch(e){}
    }
    return !0;
  },[]);

  const resetAllRawMaterialsToZero = B.useCallback(async()=>{
    const updated = j.map(m => ({...m, currentBalance:0, purchasePrice:0, lastUpdated: new Date().toISOString()}));
    k(updated);
    await syncRawMaterialsCloud(updated);
    return !0;
  },[j]);

  const updateRawMaterialMaster = B.useCallback(async(key, updates)=>{
    const Ce = new Date().toISOString();
    let updatedItem = null;
    k(ke => ke.map(_e => {
      const isMatch = _e.key===key||(_e.legacyKeys&&_e.legacyKeys.includes(key));
      if(isMatch){
        updatedItem = {..._e, ...updates, lastUpdated:Ce};
        return updatedItem;
      }
      return _e;
    }));
    if(updatedItem){
      await syncRawMaterialsCloud([updatedItem]);
    }
    return !0;
  },[]);

  const he = B.useCallback(async(V,J,ie)=>{
    const Ce = new Date().toISOString(),
          ce = Ce.split("T")[0],
          Oe = a||"Supervisor",
          ze = {
            cement: V.cementBags,
            cement_50kg: V.cementBags,
            mchanga_laini: V.sandBuckets,
            sand_bucket: V.sandBuckets,
            chipping: V.chippingBuckets,
            chipping_bucket: V.chippingBuckets,
            kokoto: V.aggregateBuckets,
            aggregate_bucket: V.aggregateBuckets,
            dawa: V.chemicalLiters,
            chemical_liter: V.chemicalLiters,
            rangi_red: V.pigmentRedKg,
            pigment_red_kg: V.pigmentRedKg,
            rangi_black: V.pigmentBlackKg,
            pigment_black_kg: V.pigmentBlackKg
          };
    
    const updatedMats = [];
    k(_e => _e.map(Ue => {
      const deductAmt = ze[Ue.key]||(Ue.legacyKeys&&Ue.legacyKeys.some(lk=>ze[lk])?ze[Ue.legacyKeys.find(lk=>ze[lk])]:0)||0;
      if(deductAmt > 0){
        const be = Math.max(0, Number((Ue.currentBalance - deductAmt).toFixed(2)));
        const u = {...Ue, currentBalance:be, lastUpdated:Ce};
        updatedMats.push(u);
        return u;
      }
      return Ue;
    }));

    const ke = [];
    for(const [_e, Ue] of Object.entries(ze)){
      if(Ue > 0 && !["cement_50kg","sand_bucket","chipping_bucket","aggregate_bucket","chemical_liter","pigment_red_kg","pigment_black_kg"].includes(_e)){
        const K = j.find(be => be.key===_e||(be.legacyKeys&&be.legacyKeys.includes(_e)));
        ke.push({
          id: crypto.randomUUID ? crypto.randomUUID() : ('raw-mov-' + Date.now() + '-' + _e + '-' + Math.random().toString(36).slice(2, 5)),
          materialKey: _e,
          materialName: K ? K.name : _e,
          delta: -Ue,
          quantity: Ue,
          unit: (K==null?void 0:K.unit)||"units",
          date: ce,
          type: "production_deduction",
          relatedBatchId: J,
          note: ie||"Automated recipe deduction from production run",
          enteredBy: Oe,
          createdAt: Ce
        });
      }
    }
    if(ke.length > 0){
      L(_e => [...ke, ..._e]);
      await syncRawMovementsCloud(ke);
    }
    if(updatedMats.length > 0){
      await syncRawMaterialsCloud(updatedMats);
    }
    return !0;
  },[j,a]);

  const Pe = B.useCallback(()=>{
    k(Fl);
    L([]);
    localStorage.removeItem(Xl);
    localStorage.removeItem(Zl);
  },[]);

  const resetProductBaseline = B.useCallback(async()=>{
    E(prev => prev.filter(m => m.type!=="opening_balance"));
    try {
      const raw = localStorage.getItem(cp);
      if(raw){
        const list = JSON.parse(raw);
        localStorage.setItem(cp, JSON.stringify(list.filter(m => m.type!=="opening_balance")));
      }
    } catch(err){}
    if(Ht()){
      try {
        await Ht().from("movements").delete().eq("type","opening_balance");
      } catch(err){
        console.warn("Supabase resetProductBaseline error:",err);
      }
    }
    return !0;
  },[]);

  const resetLedger = B.useCallback(async()=>{
    E([]);
    L([]);
    try {
      localStorage.setItem(cp,"[]");
      localStorage.setItem(Zl,"[]");
    } catch(err){}
    if(Ht()){
      try {
        await Ht().from("movements").delete().neq("id","00000000-0000-0000-0000-000000000000");
        await Ht().from("raw_movements").delete().neq("id","00000000-0000-0000-0000-000000000000");
      } catch(err){
        console.warn("Supabase resetLedger error:",err);
      }
    }
    return !0;
  },[]);

  const resetSales = B.useCallback(async()=>{
    E(prev => prev.filter(m => m.type!=="dispatch_out"&&m.type!=="sale_out"));
    try {
      const raw = localStorage.getItem(cp);
      if(raw){
        const list = JSON.parse(raw);
        localStorage.setItem(cp, JSON.stringify(list.filter(m => m.type!=="dispatch_out"&&m.type!=="sale_out")));
      }
      sessionStorage.removeItem("stumarcot_sales_tab_draft_v3");
      sessionStorage.removeItem("stumarcot_sales_tab_draft_v2");
      sessionStorage.removeItem("stumarcot_sales_tab_draft");
      if(typeof window!=="undefined"){
        delete window._stumarcot_sales_draft;
      }
    } catch(err){}
    if(Ht()){
      try {
        await Ht().from("movements").delete().in("type",["dispatch_out","sale_out"]);
      } catch(err){
        console.warn("Supabase resetSales error:",err);
      }
    }
    return !0;
  },[]);

  // Single movement insertion
  const oe = B.useCallback(async V => {
    const J = V.batch_id||(crypto.randomUUID?crypto.randomUUID():('batch-' + Date.now())),
          ie = new Date().toISOString(),
          Ce = a||"Supervisor";
    let ce = V.computed_materials_deducted||null;
    if(V.type==="production_in"){
      const ke = x.find(_e => _e.id===V.item_id);
      if(ke){
        ce = Pa(ke, V.quantity_pcs, V.color);
        await he(ce, J, \`Production run of \${ke.name} (\${V.quantity_pcs} pcs)\`);
      }
    }
    const Oe = {
      ...V,
      id: V.id || (crypto.randomUUID?crypto.randomUUID():('mov-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7))),
      batch_id: J,
      computed_materials_deducted: ce,
      entered_by: Ce,
      created_at: ie
    };

    E(ke => [Oe, ...ke]);

    if(Ht()){
      Y(!0);
      const res = await op([Oe]);
      Y(!1);
      if(!res.success){
        enqueueItem(QUEUE_KEYS.MOVEMENTS, Oe);
        console.warn("Movement queued for offline sync:", res.error);
      }
    } else {
      enqueueItem(QUEUE_KEYS.MOVEMENTS, Oe);
    }
    return !0;
  },[x, a, he]);

  // Batch movements insertion (Production & Sales)
  const G = B.useCallback(async V => {
    if(!V || V.length===0) return !0;
    const J = V[0]?.batch_id || (crypto.randomUUID?crypto.randomUUID():('batch-' + Date.now())),
          ie = new Date().toISOString(),
          Ce = a||"Supervisor",
          ce = [],
          Oe = V.map((_e, Ue)=>{
            const K = x.find(Ae => Ae.id===_e.item_id);
            let be = _e.computed_materials_deducted || null;
            if(_e.type==="production_in" && K && _e.quantity_pcs > 0){
              be = Pa(K, _e.quantity_pcs, _e.color);
              ce.push({item:K, pieces:_e.quantity_pcs, color:_e.color});
            }
            return {
              ..._e,
              id: _e.id || (crypto.randomUUID?crypto.randomUUID():('mov-' + Date.now() + '-' + Ue + '-' + Math.random().toString(36).slice(2, 6))),
              batch_id: _e.batch_id || J,
              computed_materials_deducted: be,
              entered_by: Ce,
              created_at: ie
            };
          });

    // 1. Perform Recipe Deductions for Production
    if(ce.length > 0){
      const _e = lg(ce);
      await he(_e, J, \`Batch production of \${ce.length} product entries (\${V.reduce((Ue,K)=>Ue+(K.quantity_pcs||0),0)} pcs)\`);
    }

    // 2. Optimistically update local React state
    E(_e => [...Oe, ..._e]);

    // 3. Persist to Supabase
    const client = Ht();
    if(client){
      Y(!0);
      const res = await op(Oe);
      Y(!1);
      if(res.success){
        return !0;
      } else {
        const isPermanentError = res.code === '23503' || res.code === '23514' || res.code === '22P02' || (res.error && (res.error.includes('foreign key') || res.error.includes('violates check constraint')));
        if(isPermanentError){
          E(prev => prev.filter(m => !Oe.some(o => o.id === m.id)));
          alert("⚠️ Database Validation Error (" + (res.code || "Failed") + "):\\n\\n" + res.error + "\\n\\nYour inputs have been preserved. Please check that the selected product exists in the catalog.");
          return !1;
        } else {
          Oe.forEach(mov => enqueueItem(QUEUE_KEYS.MOVEMENTS, mov));
          console.warn("Batch queued into offline outbox due to network error:", res.error);
          return !0;
        }
      }
    } else {
      // Offline fallback
      Oe.forEach(mov => enqueueItem(QUEUE_KEYS.MOVEMENTS, mov));
      return !0;
    }
  },[x, a, he]);

  const ue = B.useCallback(async V => {
    const J = new Date().toISOString(),
          ie = {...V, updated_at:J};
    b(ce => ce.map(Oe => Oe.id===V.id ? ie : Oe));
    if(Ht()){
      Y(!0);
      await Av(ie);
      Y(!1);
    }
    return !0;
  },[]);

  const P = B.useCallback(async V => {
    const J = new Date().toISOString(),
          ie = {
            ...V,
            id: V.id || (crypto.randomUUID?crypto.randomUUID():('item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6))),
            created_at: J,
            updated_at: J
          };
    b(ce => [ie, ...ce]);
    if(Ht()){
      Y(!0);
      await Iv(ie);
      Y(!1);
    }
    return ie;
  },[]);

  const deleteItem = B.useCallback(async itemId => {
    b(ce => ce.filter(Oe => Oe.id!==itemId));
    E(ce => ce.filter(Oe => Oe.item_id!==itemId));
    try {
      const rawItems = localStorage.getItem(lp);
      if(rawItems){
        const list = JSON.parse(rawItems);
        localStorage.setItem(lp, JSON.stringify(list.filter(Oe => Oe.id!==itemId)));
      }
      const rawMovs = localStorage.getItem(cp);
      if(rawMovs){
        const list = JSON.parse(rawMovs);
        localStorage.setItem(cp, JSON.stringify(list.filter(Oe => Oe.item_id!==itemId)));
      }
    } catch(err){}
    const client = Ht();
    if(client){
      try {
        Y(!0);
        await client.from("movements").delete().eq("item_id", itemId);
        await client.from("items").delete().eq("id", itemId);
        Y(!1);
      } catch(err){
        Y(!1);
        console.warn("Supabase deleteItem error:", err);
      }
    }
    return !0;
  },[]);

  const deleteMovements = B.useCallback(async target => {
    let predicate;
    if(Array.isArray(target)||typeof target==="string"){
      const idsSet = new Set(Array.isArray(target)?target:[target]);
      predicate = mov => idsSet.has(mov.id);
    } else if(target && typeof target==="object"){
      predicate = mov => {
        if(target.batch_id && mov.batch_id===target.batch_id) return !0;
        if(target.item_id && mov.item_id===target.item_id && (!target.type||mov.type===target.type)) return !0;
        if(target.ids && target.ids.includes(mov.id)) return !0;
        return !1;
      };
    } else {
      return [];
    }
    let removedMovs = [];
    E(prev => {
      removedMovs = prev.filter(predicate);
      return prev.filter(mov => !predicate(mov));
    });
    try {
      const rawMovs = localStorage.getItem(cp);
      if(rawMovs){
        const list = JSON.parse(rawMovs);
        localStorage.setItem(cp, JSON.stringify(list.filter(mov => !predicate(mov))));
      }
    } catch(err){}
    const client = Ht();
    if(client && removedMovs.length > 0){
      try {
        const idsToRemove = removedMovs.map(m=>m.id).filter(Boolean);
        if(idsToRemove.length > 0){
          Y(!0);
          await client.from("movements").delete().in("id", idsToRemove);
          Y(!1);
        }
      } catch(err){
        Y(!1);
        console.warn("Supabase deleteMovements error:", err);
      }
    }
    return removedMovs;
  },[]);

  // Calculation of active stock balances by color & reorder status
  const y = B.useMemo(()=>{
    const V = new Map;
    for(const ce of w){
      const Oe = V.get(ce.item_id) || [];
      Oe.push(ce);
      V.set(ce.item_id, Oe);
    }
    const {productionVolumePcs:J, salesVelocityPcs:ie, totalMovementVolume:Ce} = vc(w);
    return x.map(ce => {
      const Oe = V.get(ce.id) || [],
            ze = {};
      if(ce.colors && ce.colors.length > 0){
        for(const Ze of ce.colors) ze[Ze] = {pcs:0, sqm:null};
      }
      let ke = 0, _e = null;
      for(const Ze of Oe){
        (!_e || Ze.date > _e) && (_e = Ze.date);
        const kt = Ze.delta < 0 ? -Ze.quantity_pcs : Ze.quantity_pcs;
        ke += kt;
        const Xn = Ze.color || "Standard";
        ze[Xn] || (ze[Xn] = {pcs:0, sqm:null});
        ze[Xn].pcs += kt;
      }
      let Ue = null;
      if(ce.unit==="sqm" && ce.pcs_per_sqm && ce.pcs_per_sqm > 0){
        Ue = Number((ke / ce.pcs_per_sqm).toFixed(2));
        for(const Ze of Object.keys(ze)){
          ze[Ze].sqm = Number((ze[Ze].pcs / ce.pcs_per_sqm).toFixed(2));
        }
      }
      const K = Ue!==null ? Ue : ke,
            be = ce.reorder_level!==null && ce.reorder_level!==void 0 && (ce.unit==="sqm" && Ue!==null ? Ue <= ce.reorder_level : ke <= ce.reorder_level),
            Ae = lt(ce),
            qe = ce.moldCount ?? Ae.moldCount ?? 50,
            Ve = ce.unit==="sqm" && ce.pcs_per_sqm && ce.pcs_per_sqm > 0 ? Number((qe / ce.pcs_per_sqm).toFixed(2)) : Ae.moldAreaSqm,
            Me = J.get(ce.id) || 0,
            Xe = ie.get(ce.id) || 0,
            St = Ce.get(ce.id) || 0;
      return {
        item: ce,
        total_pcs: Math.max(0, ke),
        total_sqm: Ue!==null ? Math.max(0, Ue) : null,
        current_balance: Math.max(0, K),
        by_color: ze,
        is_low_stock: be,
        last_movement_date: _e,
        total_movements_count: Oe.length,
        moldCount: qe,
        dailyCapacityPcs: qe,
        dailyCapacitySqm: Ve,
        production_volume_pcs: Me,
        sales_volume_pcs: Xe,
        total_velocity_score: St
      };
    });
  },[x, w]);

  const O = B.useCallback(V => y.find(J => J.item.id===V), [y]);
  const z = B.useMemo(() => new Date().toISOString().split("T")[0], []);
  const T = B.useMemo(() => w.filter(V => V.date===z), [w, z]);
  const N = T.length;
  const S = B.useMemo(() => T.filter(V => V.type==="production_in").reduce((V,J)=>V+(J.quantity_pcs||0), 0), [T]);
  const D = B.useMemo(() => T.filter(V => V.type==="production_in" && V.quantity_sqm!==null).reduce((V,J)=>V+(J.quantity_sqm||0), 0), [T]);
  const F = B.useMemo(() => y.filter(V => V.is_low_stock).length, [y]);
  const Z = B.useMemo(() => x.reduce((V,J)=>V+(J.moldCount||lt(J).moldCount||0), 0), [x]);
  const se = B.useMemo(() => T.filter(V => V.type==="production_in").reduce((V,J)=>V+(J.quantity_pcs||0), 0), [T]);
  const we = B.useMemo(() => Z<=0 ? 0 : Math.min(100, Number((se/Z*100).toFixed(1))), [Z, se]);

  return o.jsx(Wp.Provider,{
    value: {
      isUnlocked: t,
      staffName: a,
      unlock: Be,
      lock: M,
      setStaffName: ee,
      recentStaffNames: u,
      adminSettings: f,
      updateAdminSettings: g,
      resetAdminSettings: _,
      items: x,
      movements: w,
      isLoading: W,
      isSyncing: ne,
      isSupabaseConnected: ae,
      supabaseUrl: xe,
      rawMaterials: j,
      rawMaterialMovements: A,
      recordRawMaterialBaselineBatch: recordRawMaterialBaselineBatch,
      addRawMaterialStock: le,
      updateRawMaterialMaster: updateRawMaterialMaster,
      addRawMaterial: addRawMaterial,
      removeRawMaterial: removeRawMaterial,
      resetAllRawMaterialsToZero: resetAllRawMaterialsToZero,
      deductRawMaterialsBatch: he,
      resetRawMaterialsToDefault: Pe,
      resetProductBaseline: resetProductBaseline,
      resetLedger: resetLedger,
      resetSales: resetSales,
      addMovement: oe,
      addMovementsBatch: G,
      updateItem: ue,
      addItem: P,
      deleteItem: deleteItem,
      removeItem: deleteItem,
      deleteMovements: deleteMovements,
      refreshData: Ie,
      stockSummaries: y,
      getStockSummary: O,
      todayMovementsCount: N,
      todayProductionPcs: S,
      todayProductionSqm: D,
      lowStockCount: F,
      totalFactoryMolds: Z,
      todayMoldsInUse: se,
      overallMoldUtilizationPct: we
    },
    children: s
  });
};
`;

console.log('Provider code length:', providerCode.length);

// 1. Verify JS syntax with node vm
try {
  new vm.Script(providerCode);
  console.log('✅ Repaired Provider code passed syntax validation!');
} catch(e) {
  console.error('❌ Syntax validation failed:', e);
  process.exit(1);
}

// 2. Identify start and end in bundle
const bcStart = bundleCode.indexOf('function bc(){');
const vtStart = bundleCode.indexOf('Vt=()=>{const s=B.useContext(Wp)');

if (bcStart === -1 || vtStart === -1) {
  console.error('Could not locate boundaries in bundle:', { bcStart, vtStart });
  process.exit(1);
}

console.log('Replacing bundle between:', bcStart, 'and', vtStart);

const updatedBundle = bundleCode.substring(0, bcStart) + providerCode.trim() + '\n\n' + bundleCode.substring(vtStart);
fs.writeFileSync(bundlePath, updatedBundle, 'utf8');
console.log('✅ Successfully updated assets/index-hgjhj-0G.js with repaired sync engine!');

// 3. Bump Service Worker cache name to invalidate stale browser caches
const swPath = path.join(__dirname, '..', 'service-worker.js');
let swCode = fs.readFileSync(swPath, 'utf8');
const newCacheTimestamp = Date.now();
const newCacheName = 'stumarcot-pwa-v2.1.0-' + newCacheTimestamp;
swCode = swCode.replace(/const CACHE_NAME = ['"][^'"]+['"];/, "const CACHE_NAME = '" + newCacheName + "';");
fs.writeFileSync(swPath, swCode, 'utf8');
console.log('✅ Bumped service worker CACHE_NAME to:', newCacheName);

// 4. Update index.html script version query string
const indexPath = path.join(__dirname, '..', 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
indexHtml = indexHtml.replace(/index-hgjhj-0G\.js\?v=\d+/, 'index-hgjhj-0G.js?v=' + newCacheTimestamp);
fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✅ Updated index.html asset version timestamp to:', newCacheTimestamp);
