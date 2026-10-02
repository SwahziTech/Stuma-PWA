const fs = require('fs');
const { execSync } = require('child_process');

console.log('Reading bundle for Add/Remove, Zero Qty & Price, and Narrow Cards update...');
const bundlePath = 'assets/index-hgjhj-0G.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');

// 1. Update Fl to zero out all currentBalance and purchasePrice
const flStart = bundle.indexOf('Fl=[');
const flEnd = bundle.indexOf('],ag=', flStart) + 1;

if (flStart === -1 || flEnd === 0) {
  throw new Error('Could not find Fl bounds');
}

const zeroedFlItems = `Fl=[
  {no:1,key:"cement",legacyKeys:["cement_50kg"],category:"Cement",name:"Cement",nameSwahili:"Saruji (Mifuko)",unit:"bags",displayUnit:"50 kg bags",purchaseUnit:"50 kg bags",unitRatio:1,currentBalance:0,purchasePrice:0,reorderLevel:80,source:"Whole sallers",notes:"Cement is purchased as 50 kg bags."},
  {no:2,key:"mchanga_laini",legacyKeys:["sand_bucket"],category:"Mchanga (sand)",name:"Mchanga Laini",nameSwahili:"Mchanga Laini (Ndoo)",unit:"ndoo",displayUnit:"Trips (20 Cbm = 2,500 ndoo)",purchaseUnit:"Trip (20 Cbm)",unitRatio:2500,currentBalance:0,purchasePrice:0,reorderLevel:500,source:"Msanga (27km)",notes:"Purchase unit: Cbm, Inventory unit: Trip/Truck 20 Cbm = 2,500 ndoo"},
  {no:3,key:"mchanga_mweupe",legacyKeys:[],category:"Mchanga (sand)",name:"Mchanga Mweupe",nameSwahili:"Mchanga Mweupe (Ndoo)",unit:"ndoo",displayUnit:"Trips (20 Cbm = 2,500 ndoo)",purchaseUnit:"Trip (20 Cbm)",unitRatio:2500,currentBalance:0,purchasePrice:0,reorderLevel:500,source:"Msanga (27km)",notes:"Purchase unit: Cbm, Inventory unit: Trip/Truck 20 Cbm = 2,500 ndoo"},
  {no:4,key:"mchanga_mnene",legacyKeys:[],category:"Mchanga (sand)",name:"Mchanga Mnene",nameSwahili:"Mchanga Mnene (Ndoo)",unit:"ndoo",displayUnit:"Trips (20 Cbm = 2,500 ndoo)",purchaseUnit:"Trip (20 Cbm)",unitRatio:2500,currentBalance:0,purchasePrice:0,reorderLevel:500,source:"Kikombo (21km)",notes:"Purchase unit: Cbm, Inventory unit: Trip/Truck 20 Cbm = 2,500 ndoo"},
  {no:5,key:"dust",legacyKeys:[],category:"Dust",name:"Dust",nameSwahili:"Dust / Vumbi (Ndoo)",unit:"ndoo",displayUnit:"Trips (20 Cbm = 2,500 ndoo)",purchaseUnit:"Trip (20 Cbm)",unitRatio:2500,currentBalance:0,purchasePrice:0,reorderLevel:500,source:"Manchali (20km)",notes:"Purchase unit: Cbm, Inventory unit: Trip/Truck 20 Cbm = 2,500 ndoo"},
  {no:6,key:"chipping",legacyKeys:["chipping_bucket"],category:"Chipping",name:"Chipping",nameSwahili:"Chipping (Ndoo)",unit:"ndoo",displayUnit:"Trips (20 Cbm = 2,500 ndoo)",purchaseUnit:"Trip (20 Cbm)",unitRatio:2500,currentBalance:0,purchasePrice:0,reorderLevel:500,source:"Manchali (20km)",notes:"Purchase unit: Cbm, Inventory unit: Trip/Truck 20 Cbm = 2,500 ndoo"},
  {no:7,key:"kokoto",legacyKeys:["aggregate_bucket"],category:"Kokoto / Aggregate",name:"Kokoto / Aggregate",nameSwahili:"Kokoto (Ndoo)",unit:"ndoo",displayUnit:"Trips (20 Cbm = 2,500 ndoo)",purchaseUnit:"Trip (20 Cbm)",unitRatio:2500,currentBalance:0,purchasePrice:0,reorderLevel:500,source:"Manchali (20km)",notes:"Purchase unit: Cbm, Inventory unit: Trip/Truck 20 Cbm = 2,500 ndoo"},
  {no:8,key:"dawa",legacyKeys:["chemical_liter"],category:"Chemical additive / hardener",name:"Dawa",nameSwahili:"Dawa ya Kuimarisha",unit:"Liters",displayUnit:"Barrels (200L each)",purchaseUnit:"Barrel of 200L",unitRatio:200,currentBalance:0,purchasePrice:0,reorderLevel:25,source:"Dar",notes:"Dawa is purchased as barrel of 200l each."},
  {no:9,key:"rangi_red",legacyKeys:["pigment_red_kg"],category:"Rangi",name:"Rangi Red",nameSwahili:"Rangi Nyekundu",unit:"kg",displayUnit:"Bags (25kg each)",purchaseUnit:"Bags of 25kg",unitRatio:25,currentBalance:0,purchasePrice:0,reorderLevel:15,source:"Dar",notes:"Rangi is purchased as bags of 25kg."},
  {no:10,key:"rangi_black",legacyKeys:["pigment_black_kg"],category:"Rangi",name:"Rangi Black",nameSwahili:"Rangi Nyeusi",unit:"kg",displayUnit:"Bags (25kg each)",purchaseUnit:"Bags of 25kg",unitRatio:25,currentBalance:0,purchasePrice:0,reorderLevel:10,source:"Dar",notes:"Rangi is purchased as bags of 25kg."},
  {no:11,key:"mafuta",legacyKeys:[],category:"Mafuta/oil",name:"Mafuta/oil",nameSwahili:"Mafuta / Oil",unit:"Liters",displayUnit:"Dumu (20L each)",purchaseUnit:"Dumu of 20L",unitRatio:20,currentBalance:0,purchasePrice:0,reorderLevel:20,source:"Shop",notes:"Mafuta/oil purchased as dumu of 20l."},
  {no:12,key:"steel_r6",legacyKeys:[],category:"Steel",name:"R6",nameSwahili:"Nondo R6",unit:"bars",displayUnit:"Pcs / Bars (12m)",purchaseUnit:"Pcs / Bars (12m)",unitRatio:1,currentBalance:0,purchasePrice:0,reorderLevel:20,source:"Shop / Wholesalers",notes:"Steel R6 reinforcement bars."},
  {no:13,key:"steel_10mm",legacyKeys:[],category:"Steel",name:"10mm",nameSwahili:"Nondo 10mm",unit:"bars",displayUnit:"Pcs / Bars (12m)",purchaseUnit:"Pcs / Bars (12m)",unitRatio:1,currentBalance:0,purchasePrice:0,reorderLevel:20,source:"Shop / Wholesalers",notes:"Steel 10mm reinforcement bars."}
]`;

bundle = bundle.substring(0, flStart) + zeroedFlItems + bundle.substring(flEnd);
console.log('✓ Zeroed Fl in bundle.');

// 2. Update [j,k] = B.useState to enforce zero qty & price reset
const jkStart = bundle.indexOf('[j,k]=B.useState(()=>{');
const jkEnd = bundle.indexOf('[A,L]=B.useState(()=>{const V=localStorage.getItem(Zl);');

if (jkStart === -1 || jkEnd === -1) {
  throw new Error('Could not find [j,k] bounds');
}

const newJk = `[j,k]=B.useState(()=>{
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
}),`;

bundle = bundle.substring(0, jkStart) + newJk + bundle.substring(jkEnd);
console.log('✓ [j,k] state zero reset updated.');

// 3. Add addRawMaterial, removeRawMaterial, resetAllRawMaterialsToZero in AppContext
const updateStart = bundle.indexOf('updateRawMaterialMaster=B.useCallback(async(key,updates)=>{');
if (updateStart === -1) {
  throw new Error('Could not find updateRawMaterialMaster');
}

const newMethods = `addRawMaterial=B.useCallback((mat)=>{
  const nextNo = j.length ? Math.max(...j.map(m=>m.no||0)) + 1 : 1;
  const newMat = {
    no: nextNo,
    key: mat.key || (\`mat_\${Date.now()}_\${Math.random().toString(36).slice(2,5)}\`),
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
`;

bundle = bundle.substring(0, updateStart) + newMethods + bundle.substring(updateStart);
console.log('✓ Added addRawMaterial, removeRawMaterial, resetAllRawMaterialsToZero.');

// Update Wp.Provider value to expose these
const oldProv = 'updateRawMaterialMaster:updateRawMaterialMaster,';
const newProv = 'updateRawMaterialMaster:updateRawMaterialMaster,addRawMaterial:addRawMaterial,removeRawMaterial:removeRawMaterial,resetAllRawMaterialsToZero:resetAllRawMaterialsToZero,';

if (!bundle.includes(oldProv)) {
  throw new Error('Could not find oldProv in bundle');
}
bundle = bundle.replace(oldProv, newProv);
console.log('✓ Exposed in Wp.Provider.');

// 4. In x1, update the RawMaterialMasterView call to pass the new functions
const oldRawCall = 'L==="raw_materials"&&o.jsx(RawMaterialMasterView,{rawMaterials:f,addRawMaterialStock:m,updateRawMaterialMaster:Vt().updateRawMaterialMaster,onNavigate:s,staffName:Vt().staffName})';
const newRawCall = 'L==="raw_materials"&&o.jsx(RawMaterialMasterView,{rawMaterials:f,addRawMaterialStock:m,updateRawMaterialMaster:Vt().updateRawMaterialMaster,addRawMaterial:Vt().addRawMaterial,removeRawMaterial:Vt().removeRawMaterial,resetAllRawMaterialsToZero:Vt().resetAllRawMaterialsToZero,onNavigate:s,staffName:Vt().staffName})';

if (!bundle.includes(oldRawCall)) {
  throw new Error('Could not find oldRawCall in x1');
}
bundle = bundle.replace(oldRawCall, newRawCall);
console.log('✓ Updated RawMaterialMasterView props in x1.');

fs.writeFileSync(bundlePath, bundle, 'utf8');
execSync('node --check ' + bundlePath);
console.log('✓ Syntax is 100% VALID after AppContext updates!');
