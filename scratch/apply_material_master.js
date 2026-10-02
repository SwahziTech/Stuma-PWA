const fs = require('fs');
const { execSync } = require('child_process');

console.log('Reading bundle...');
const bundlePath = 'assets/index-hgjhj-0G.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');

// 1. Replace Fl with the 13 materials
const oldFlStart = bundle.indexOf('Fl=[');
const oldFlEnd = bundle.indexOf('],ag=', oldFlStart) + 1;

if (oldFlStart === -1 || oldFlEnd === 0) {
  throw new Error('Could not find Fl boundaries');
}

console.log('Old Fl found between', oldFlStart, 'and', oldFlEnd);

const newFlItems = `Fl=[
  {no:1,key:"cement",legacyKeys:["cement_50kg"],category:"Cement",name:"Cement",nameSwahili:"Saruji (Mifuko)",unit:"bags",displayUnit:"50 kg bags",purchaseUnit:"50 kg bags",unitRatio:1,currentBalance:450,purchasePrice:18500,reorderLevel:80,source:"Whole sallers",notes:"Cement is purchased as 50 kg bags."},
  {no:2,key:"mchanga_laini",legacyKeys:["sand_bucket"],category:"Mchanga (sand)",name:"Mchanga Laini",nameSwahili:"Mchanga Laini (Ndoo)",unit:"ndoo",displayUnit:"Trips (20 Cbm = 2,500 ndoo)",purchaseUnit:"Trip (20 Cbm)",unitRatio:2500,currentBalance:2500,purchasePrice:350000,reorderLevel:500,source:"Msanga (27km)",notes:"Purchase unit: Cbm, Inventory unit: Trip/Truck 20 Cbm = 2,500 ndoo"},
  {no:3,key:"mchanga_mweupe",legacyKeys:[],category:"Mchanga (sand)",name:"Mchanga Mweupe",nameSwahili:"Mchanga Mweupe (Ndoo)",unit:"ndoo",displayUnit:"Trips (20 Cbm = 2,500 ndoo)",purchaseUnit:"Trip (20 Cbm)",unitRatio:2500,currentBalance:2500,purchasePrice:380000,reorderLevel:500,source:"Msanga (27km)",notes:"Purchase unit: Cbm, Inventory unit: Trip/Truck 20 Cbm = 2,500 ndoo"},
  {no:4,key:"mchanga_mnene",legacyKeys:[],category:"Mchanga (sand)",name:"Mchanga Mnene",nameSwahili:"Mchanga Mnene (Ndoo)",unit:"ndoo",displayUnit:"Trips (20 Cbm = 2,500 ndoo)",purchaseUnit:"Trip (20 Cbm)",unitRatio:2500,currentBalance:2500,purchasePrice:320000,reorderLevel:500,source:"Kikombo (21km)",notes:"Purchase unit: Cbm, Inventory unit: Trip/Truck 20 Cbm = 2,500 ndoo"},
  {no:5,key:"dust",legacyKeys:[],category:"Dust",name:"Dust",nameSwahili:"Dust / Vumbi (Ndoo)",unit:"ndoo",displayUnit:"Trips (20 Cbm = 2,500 ndoo)",purchaseUnit:"Trip (20 Cbm)",unitRatio:2500,currentBalance:2500,purchasePrice:280000,reorderLevel:500,source:"Manchali (20km)",notes:"Purchase unit: Cbm, Inventory unit: Trip/Truck 20 Cbm = 2,500 ndoo"},
  {no:6,key:"chipping",legacyKeys:["chipping_bucket"],category:"Chipping",name:"Chipping",nameSwahili:"Chipping (Ndoo)",unit:"ndoo",displayUnit:"Trips (20 Cbm = 2,500 ndoo)",purchaseUnit:"Trip (20 Cbm)",unitRatio:2500,currentBalance:2800,purchasePrice:450000,reorderLevel:500,source:"Manchali (20km)",notes:"Purchase unit: Cbm, Inventory unit: Trip/Truck 20 Cbm = 2,500 ndoo"},
  {no:7,key:"kokoto",legacyKeys:["aggregate_bucket"],category:"Kokoto / Aggregate",name:"Kokoto / Aggregate",nameSwahili:"Kokoto (Ndoo)",unit:"ndoo",displayUnit:"Trips (20 Cbm = 2,500 ndoo)",purchaseUnit:"Trip (20 Cbm)",unitRatio:2500,currentBalance:2500,purchasePrice:420000,reorderLevel:500,source:"Manchali (20km)",notes:"Purchase unit: Cbm, Inventory unit: Trip/Truck 20 Cbm = 2,500 ndoo"},
  {no:8,key:"dawa",legacyKeys:["chemical_liter"],category:"Chemical additive / hardener",name:"Dawa",nameSwahili:"Dawa ya Kuimarisha",unit:"Liters",displayUnit:"Barrels (200L each)",purchaseUnit:"Barrel of 200L",unitRatio:200,currentBalance:200,purchasePrice:480000,reorderLevel:25,source:"Dar",notes:"Dawa is purchased as barrel of 200l each."},
  {no:9,key:"rangi_red",legacyKeys:["pigment_red_kg"],category:"Rangi",name:"Rangi Red",nameSwahili:"Rangi Nyekundu",unit:"kg",displayUnit:"Bags (25kg each)",purchaseUnit:"Bags of 25kg",unitRatio:25,currentBalance:75,purchasePrice:85000,reorderLevel:15,source:"Dar",notes:"Rangi is purchased as bags of 25kg."},
  {no:10,key:"rangi_black",legacyKeys:["pigment_black_kg"],category:"Rangi",name:"Rangi Black",nameSwahili:"Rangi Nyeusi",unit:"kg",displayUnit:"Bags (25kg each)",purchaseUnit:"Bags of 25kg",unitRatio:25,currentBalance:50,purchasePrice:95000,reorderLevel:10,source:"Dar",notes:"Rangi is purchased as bags of 25kg."},
  {no:11,key:"mafuta",legacyKeys:[],category:"Mafuta/oil",name:"Mafuta/oil",nameSwahili:"Mafuta / Oil",unit:"Liters",displayUnit:"Dumu (20L each)",purchaseUnit:"Dumu of 20L",unitRatio:20,currentBalance:40,purchasePrice:70000,reorderLevel:20,source:"Shop",notes:"Mafuta/oil purchased as dumu of 20l."},
  {no:12,key:"steel_r6",legacyKeys:[],category:"Steel",name:"R6",nameSwahili:"Nondo R6",unit:"bars",displayUnit:"Pcs / Bars (12m)",purchaseUnit:"Pcs / Bars (12m)",unitRatio:1,currentBalance:60,purchasePrice:12500,reorderLevel:20,source:"Shop / Wholesalers",notes:"Steel R6 reinforcement bars."},
  {no:13,key:"steel_10mm",legacyKeys:[],category:"Steel",name:"10mm",nameSwahili:"Nondo 10mm",unit:"bars",displayUnit:"Pcs / Bars (12m)",purchaseUnit:"Pcs / Bars (12m)",unitRatio:1,currentBalance:40,purchasePrice:24000,reorderLevel:20,source:"Shop / Wholesalers",notes:"Steel 10mm reinforcement bars."}
]`;

bundle = bundle.substring(0, oldFlStart) + newFlItems + bundle.substring(oldFlEnd);
console.log('✓ Fl replaced successfully.');

// 2. Update [j,k] = B.useState(...) to migrate and load 13 materials
const oldJkStart = bundle.indexOf('[j,k]=B.useState(()=>{const V=localStorage.getItem(Xl);');
const oldJkEnd = bundle.indexOf('[A,L]=B.useState(()=>{const V=localStorage.getItem(Zl);');

if (oldJkStart === -1 || oldJkEnd === -1) {
  throw new Error('Could not find [j,k] initialization');
}

console.log('Found [j,k] from', oldJkStart, 'to', oldJkEnd);

const newJk = `[j,k]=B.useState(()=>{
  const V=localStorage.getItem(Xl);
  if(V)try{
    const J=JSON.parse(V);
    if(Array.isArray(J)&&J.length>=13&&J.some(m=>m.key==="steel_r6")&&J[0].purchaseUnit){
      return J;
    }
    const existingMap=new Map(J.map(ce=>[ce.key,ce]));
    return Fl.map(ce=>{
      const lk=ce.legacyKeys&&ce.legacyKeys[0];
      const match=existingMap.get(ce.key)||(lk?existingMap.get(lk):null);
      if(match){
        return {
          ...ce,
          currentBalance:match.currentBalance!==undefined?match.currentBalance:ce.currentBalance,
          purchasePrice:match.purchasePrice!==undefined?match.purchasePrice:ce.purchasePrice,
          source:match.source||ce.source,
          reorderLevel:match.reorderLevel!==undefined?match.reorderLevel:ce.reorderLevel
        };
      }
      return ce;
    });
  }catch(J){
    console.error("Failed to parse local raw materials:",J);
  }
  return Fl;
}),`;

bundle = bundle.substring(0, oldJkStart) + newJk + bundle.substring(oldJkEnd);
console.log('✓ [j,k] migration updated successfully.');

// 3. Update le and he in AppContext
const oldLeStart = bundle.indexOf('le=B.useCallback(async(V,J,ie)=>{if(J<=0)return!1;');
const oldHeEnd = bundle.indexOf('Pe=B.useCallback(()=>{k(Fl),L([]),localStorage.removeItem(Xl),localStorage.removeItem(Zl)},[])');

if (oldLeStart === -1 || oldHeEnd === -1) {
  throw new Error('Could not find le / he boundaries in AppContext');
}

console.log('Found le/he from', oldLeStart, 'to', oldHeEnd);

const newLeHe = `le=B.useCallback(async(V,J,ie,priceVal,totalCostVal,sourceVal,customDate)=>{
  if(J<=0)return!1;
  const Ce=customDate?new Date(customDate).toISOString():new Date().toISOString(),
        ce=a||"Supervisor",
        numQty=Number(Number(J).toFixed(2));
  
  k(ke=>ke.map(_e=>{
    const isMatch=_e.key===V||(_e.legacyKeys&&_e.legacyKeys.includes(V));
    if(isMatch){
      const newBal=Number((_e.currentBalance+numQty).toFixed(2));
      const newPrice=(priceVal!==undefined&&priceVal!==null&&Number(priceVal)>0)?Number(priceVal):_e.purchasePrice;
      const newSource=sourceVal||_e.source;
      return {..._e,currentBalance:newBal,purchasePrice:newPrice,source:newSource,lastUpdated:Ce};
    }
    return _e;
  }));

  const Oe=j.find(ke=>ke.key===V||(ke.legacyKeys&&ke.legacyKeys.includes(V))),
        calcTotal=totalCostVal!==undefined&&totalCostVal!==null&&Number(totalCostVal)>0?Number(totalCostVal):(priceVal?Number((Number(priceVal)*numQty).toFixed(0)):0),
        ze={
          id:crypto.randomUUID?crypto.randomUUID():\`raw-mov-\${Date.now()}-\${Math.random().toString(36).slice(2,6)}\`,
          materialKey:Oe?Oe.key:V,
          materialName:Oe?Oe.name:V,
          delta:numQty,
          quantity:numQty,
          unit:(Oe==null?void 0:Oe.unit)||"units",
          unitPrice:priceVal?Number(priceVal):0,
          totalCost:calcTotal,
          source:sourceVal||(Oe==null?void 0:Oe.source)||"Factory Intake",
          date:Ce.split("T")[0],
          type:"restock_in",
          note:ie||"Raw material intake / restock",
          enteredBy:ce,
          createdAt:Ce
        };
  L(ke=>[ze,...ke]);
  return!0;
},[j,a]),
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
        id:crypto.randomUUID?crypto.randomUUID():\`raw-mov-\${Date.now()}-\${_e}-\${Math.random().toString(36).slice(2,5)}\`,
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
},[j,a]),`;

bundle = bundle.substring(0, oldLeStart) + newLeHe + bundle.substring(oldHeEnd);
console.log('✓ le, updateRawMaterialMaster, and he updated successfully.');

// 4. Expose updateRawMaterialMaster in Wp.Provider value
const oldProviderValue = 'addRawMaterialStock:le,deductRawMaterialsBatch:he,resetRawMaterialsToDefault:Pe,';
const newProviderValue = 'addRawMaterialStock:le,updateRawMaterialMaster:updateRawMaterialMaster,deductRawMaterialsBatch:he,resetRawMaterialsToDefault:Pe,';

if (!bundle.includes(oldProviderValue)) {
  throw new Error('Could not find oldProviderValue in bundle');
}
bundle = bundle.replace(oldProviderValue, newProviderValue);
console.log('✓ updateRawMaterialMaster exposed in Wp.Provider.');

fs.writeFileSync(bundlePath, bundle, 'utf8');
execSync('node --check ' + bundlePath);
console.log('✓ Bundle syntax check after core update: 100% VALID!');
