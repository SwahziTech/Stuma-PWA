const fs = require('fs');

console.log('--- Applying fix for material baseline input & intake in ledger ---');

let bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// 1. UPDATE AppProvider
// Find 'le=B.useCallback(async(V,J,ie,priceVal,totalCostVal,sourceVal,customDate)=>{'
const leTarget = 'le=B.useCallback(async(V,J,ie,priceVal,totalCostVal,sourceVal,customDate)=>{';
const leIdx = bundle.indexOf(leTarget);
if (leIdx === -1) {
  throw new Error('Could not find le (addRawMaterialStock) target in bundle');
}

// Find end of le function
const leEndTarget = 'L(ke=>[ze,...ke]);\n  return!0;\n},[j,a]),';
const leEndIdx = bundle.indexOf(leEndTarget, leIdx);
if (leEndIdx === -1) {
  throw new Error('Could not find le end target in bundle');
}

const newLeAndBaselineBatch = `recordRawMaterialBaselineBatch=B.useCallback(async(baselineEntries,asOfDate)=>{
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
      id:crypto.randomUUID?crypto.randomUUID():\`raw-mov-\${Date.now()}-\${entry.materialKey}-\${Math.random().toString(36).slice(2,6)}\`,
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
      note:entry.note||\`Physical baseline opening balance as of \${dateStr}\`,
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
          id:crypto.randomUUID?crypto.randomUUID():\`raw-mov-\${Date.now()}-\${Math.random().toString(36).slice(2,6)}\`,
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
},[j,a]),`;

bundle = bundle.slice(0, leIdx) + newLeAndBaselineBatch + bundle.slice(leEndIdx + leEndTarget.length);
console.log('✓ Injected recordRawMaterialBaselineBatch and updated le with opening_balance support');

// 2. Add self-healing useEffect in AppProvider to generate baseline opening records for materials that have baseline/current balance
const effectAnchor = 'B.useEffect(()=>{localStorage.setItem(Zl,JSON.stringify(A))},[A]),';
const effectIdx = bundle.indexOf(effectAnchor);
if (effectIdx === -1) {
  throw new Error('Could not find effectAnchor in bundle');
}

const selfHealingEffect = `B.useEffect(()=>{
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
        id:crypto.randomUUID?crypto.randomUUID():\`raw-mov-base-\${mat.key}-\${Date.now()}\`,
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
        note:\`Physical baseline opening balance as of \${bDate}\`,
        enteredBy:a||"Supervisor",
        createdAt:mat.lastUpdated||nowIso
      });
    }
  }
  if(missingMovements.length>0){
    L(prev=>[...missingMovements,...prev]);
  }
},[j]),`;

bundle = bundle.slice(0, effectIdx) + effectAnchor + selfHealingEffect + bundle.slice(effectIdx + effectAnchor.length);
console.log('✓ Injected self-healing useEffect for existing raw material baselines');

// 3. Export recordRawMaterialBaselineBatch in AppProvider context value
const provAnchor = 'addRawMaterialStock:le,';
const provIdx = bundle.indexOf(provAnchor);
if (provIdx === -1) {
  throw new Error('Could not find addRawMaterialStock:le in Provider value');
}
bundle = bundle.slice(0, provIdx) + 'recordRawMaterialBaselineBatch:recordRawMaterialBaselineBatch,' + bundle.slice(provIdx);
console.log('✓ Exported recordRawMaterialBaselineBatch in AppProvider value');

// 4. Update x1 to pass recordRawMaterialBaselineBatch to RawMaterialMasterView
const x1Anchor = 'L==="raw_materials"&&o.jsx(RawMaterialMasterView,{rawMaterials:f,addRawMaterialStock:m,';
const x1Idx = bundle.indexOf(x1Anchor);
if (x1Idx === -1) {
  throw new Error('Could not find RawMaterialMasterView invocation in x1');
}
const x1Replacement = 'L==="raw_materials"&&o.jsx(RawMaterialMasterView,{rawMaterials:f,addRawMaterialStock:m,recordRawMaterialBaselineBatch:Vt().recordRawMaterialBaselineBatch,';
bundle = bundle.slice(0, x1Idx) + x1Replacement + bundle.slice(x1Idx + x1Anchor.length);
console.log('✓ Passed recordRawMaterialBaselineBatch to RawMaterialMasterView in x1');

// 5. Update RawMaterialMasterView component definition to accept recordRawMaterialBaselineBatch
const rmmvAnchor = 'RawMaterialMasterView = ({ rawMaterials: materials, addRawMaterialStock, updateRawMaterialMaster, addRawMaterial, removeRawMaterial, resetAllRawMaterialsToZero, onNavigate, staffName }) => {';
const rmmvIdx = bundle.indexOf(rmmvAnchor);
if (rmmvIdx === -1) {
  throw new Error('Could not find RawMaterialMasterView declaration');
}
const rmmvReplacement = 'RawMaterialMasterView = ({ rawMaterials: materials, addRawMaterialStock, updateRawMaterialMaster, addRawMaterial, removeRawMaterial, resetAllRawMaterialsToZero, recordRawMaterialBaselineBatch, onNavigate, staffName }) => {';
bundle = bundle.slice(0, rmmvIdx) + rmmvReplacement + bundle.slice(rmmvIdx + rmmvAnchor.length);
console.log('✓ Updated RawMaterialMasterView signature to accept recordRawMaterialBaselineBatch');

// 6. Update handleSaveFullBaseline in RawMaterialMasterView
const baselineSaveAnchor = '  // Save Full Baseline (User inputs Pipa / Bags / Trips, system saves exact Liters / kg / ndoo)\n  const handleSaveFullBaseline = async (e) => {';
const baselineSaveIdx = bundle.indexOf(baselineSaveAnchor);
if (baselineSaveIdx === -1) {
  throw new Error('Could not find handleSaveFullBaseline in bundle');
}
const baselineSaveEndAnchor = '      setBaselineModalOpen(false);\n      setToast({\n        message: `✓ Opening stock baseline saved for ${updatedCount} materials as of ${baselineDate}`,\n        type: "success"\n      });\n    } catch (err) {\n      console.error(err);\n      alert("Error saving baseline: " + err.message);\n    } finally {\n      setIsBaselineSaving(false);\n    }\n  };';
const baselineSaveEndIdx = bundle.indexOf(baselineSaveEndAnchor, baselineSaveIdx);
if (baselineSaveEndIdx === -1) {
  throw new Error('Could not find handleSaveFullBaseline end anchor in bundle');
}

const newHandleSaveFullBaseline = `  // Save Full Baseline (User inputs Pipa / Bags / Trips, system saves exact Liters / kg / ndoo)
  const handleSaveFullBaseline = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!updateRawMaterialMaster) {
      alert("Baseline update handler is not available");
      return;
    }

    setIsBaselineSaving(true);
    let updatedCount = 0;
    const baselineBatch = [];

    try {
      for (const m of materials) {
        const entry = baselineData[m.key];
        if (entry) {
          const rawQty = parseFloat(entry.qty);
          const rawPrice = parseFloat(entry.price);
          const sourceVal = entry.source !== undefined ? entry.source.trim() : m.source;
          const { ratio, hasConversion } = getUnitInfo(m);

          if (!isNaN(rawQty) && rawQty >= 0) {
            // Converts count unit (e.g. 2 Pipa) to inventory usage unit (400 Liters)
            const finalInventoryBal = hasConversion ? (rawQty * ratio) : rawQty;
            const finalPrice = !isNaN(rawPrice) && rawPrice >= 0 ? rawPrice : (m.purchasePrice || 0);

            await updateRawMaterialMaster(m.key, {
              currentBalance: finalInventoryBal,
              baselineBalance: finalInventoryBal,
              purchasePrice: finalPrice,
              source: sourceVal,
              baselineDate: baselineDate,
              lastUpdated: new Date().toISOString()
            });

            if (finalInventoryBal > 0) {
              baselineBatch.push({
                materialKey: m.key,
                materialName: m.name,
                quantity: finalInventoryBal,
                unit: m.unit,
                unitPrice: finalPrice,
                totalCost: Number((finalPrice * finalInventoryBal).toFixed(0)),
                source: sourceVal || m.source || "Baseline Stocktake",
                note: \`Physical baseline opening balance as of \${baselineDate}\${hasConversion ? \` (\${rawQty} \${m.purchaseUnit || m.displayUnit})\` : ""}\`
              });
            }
            updatedCount++;
          }
        }
      }

      if (baselineBatch.length > 0) {
        if (recordRawMaterialBaselineBatch) {
          await recordRawMaterialBaselineBatch(baselineBatch, baselineDate);
        } else if (addRawMaterialStock) {
          for (const item of baselineBatch) {
            await addRawMaterialStock(
              item.materialKey,
              item.quantity,
              item.note,
              item.unitPrice,
              item.totalCost,
              item.source,
              baselineDate,
              "opening_balance"
            );
          }
        }
      }

      setBaselineModalOpen(false);
      setToast({
        message: \`✓ Opening stock baseline saved for \${updatedCount} materials as of \${baselineDate} & recorded in ledger\`,
        type: "success"
      });
    } catch (err) {
      console.error(err);
      alert("Error saving baseline: " + err.message);
    } finally {
      setIsBaselineSaving(false);
    }
  };`;

bundle = bundle.slice(0, baselineSaveIdx) + newHandleSaveFullBaseline + bundle.slice(baselineSaveEndIdx + baselineSaveEndAnchor.length);
console.log('✓ Updated handleSaveFullBaseline to record opening_balance ledger movements');

// 7. Ensure openIntakeModalFor resets intakeDate to fresh today
const intakeOpenAnchor = '  const openIntakeModalFor = (materialKey) => {\n    const mat = materials.find(m => m.key === materialKey) || materials[0];\n    setIntakeKey(mat.key);\n    setIntakeQty("");';
const intakeOpenIdx = bundle.indexOf(intakeOpenAnchor);
if (intakeOpenIdx !== -1) {
  const replacement = '  const openIntakeModalFor = (materialKey) => {\n    const mat = materials.find(m => m.key === materialKey) || materials[0];\n    setIntakeKey(mat.key);\n    setIntakeDate(new Date().toISOString().split("T")[0]);\n    setIntakeQty("");';
  bundle = bundle.slice(0, intakeOpenIdx) + replacement + bundle.slice(intakeOpenIdx + intakeOpenAnchor.length);
  console.log('✓ openIntakeModalFor now initializes intakeDate to fresh current date');
}

// 8. Update Ledger k1 Component:
// 8a. Tab toggles: reset movement filter _ to "all" when switching between Finished Goods and Raw Materials
const tabToggleAnchor = 'onClick: () => f("finished_goods"),';
const tabToggleIdx = bundle.indexOf(tabToggleAnchor);
if (tabToggleIdx !== -1) {
  bundle = bundle.replace('onClick: () => f("finished_goods"),', 'onClick: () => { f("finished_goods"); x("all"); },');
  bundle = bundle.replace('onClick: () => f("raw_materials"),', 'onClick: () => { f("raw_materials"); x("all"); },');
  console.log('✓ Ledger tab switches now reset movement filter to "all"');
}

// 8b. Add filter tabs for Raw Materials in Row 2 of Ledger
const rawFilterAnchor = 'd === "finished_goods" ? o.jsx("div", {\n                className: "filter-tabs",\n                style: { gap: "4px", margin: 0 },\n                children: [\n                  { id: "all", label: "All" },\n                  { id: "production_in", label: "Production (+)" },\n                  { id: "opening_balance", label: "Opening" },\n                  { id: "dispatch_out", label: "Dispatch (-)" },\n                  { id: "adjustment", label: "Adjustment" }\n                ].map(S => o.jsx("button", {\n                  onClick: () => x(S.id),\n                  className: `filter-tab ${_ === S.id ? "active" : ""}`,\n                  style: { fontSize: "11px", padding: "4px 8px" },\n                  children: S.label\n                }, S.id))\n              }) : o.jsx("span", { style: { fontSize: "11.5px", fontWeight: 600, color: "var(--text-secondary)" }, children: "Filter Raw Materials:" }),';

const rawFilterIdx = bundle.indexOf(rawFilterAnchor);
if (rawFilterIdx !== -1) {
  const newFilterTabs = `d === "finished_goods" ? o.jsx("div", {
                className: "filter-tabs",
                style: { gap: "4px", margin: 0 },
                children: [
                  { id: "all", label: "All" },
                  { id: "production_in", label: "Production (+)" },
                  { id: "opening_balance", label: "Opening" },
                  { id: "dispatch_out", label: "Dispatch (-)" },
                  { id: "adjustment", label: "Adjustment" }
                ].map(S => o.jsx("button", {
                  onClick: () => x(S.id),
                  className: \`filter-tab \${_ === S.id ? "active" : ""}\`,
                  style: { fontSize: "11px", padding: "4px 8px" },
                  children: S.label
                }, S.id))
              }) : o.jsx("div", {
                className: "filter-tabs",
                style: { gap: "4px", margin: 0 },
                children: [
                  { id: "all", label: "All Logs" },
                  { id: "opening_balance", label: "Baseline" },
                  { id: "restock_in", label: "Intake (+)" },
                  { id: "production_deduction", label: "Deduction (-)" }
                ].map(S => o.jsx("button", {
                  onClick: () => x(S.id),
                  className: \`filter-tab \${_ === S.id ? "active" : ""}\`,
                  style: { fontSize: "11px", padding: "4px 8px" },
                  children: S.label
                }, S.id))
              }),`;
  bundle = bundle.slice(0, rawFilterIdx) + newFilterTabs + bundle.slice(rawFilterIdx + rawFilterAnchor.length);
  console.log('✓ Added Raw Materials movement filter tabs in Ledger (All, Baseline, Intake, Deduction)');
}

// 8c. Update P (raw materials movements filtering in k1) to support _ filter
const pFilterAnchor = '  // Filtered raw materials movements\n  const P = B.useMemo(() => c.filter(S => {\n    if (E && S.date < E || k && S.date > k) return !1;';
const pFilterIdx = bundle.indexOf(pFilterAnchor);
if (pFilterIdx !== -1) {
  const newPFilter = `  // Filtered raw materials movements
  const P = B.useMemo(() => c.filter(S => {
    if (_ !== "all" && S.type !== _) return !1;
    if (E && S.date < E || k && S.date > k) return !1;`;
  bundle = bundle.slice(0, pFilterIdx) + newPFilter + bundle.slice(pFilterIdx + pFilterAnchor.length);
  
  // Also update dependencies of P
  bundle = bundle.replace('}), [c, E, k, m, oe]);', '}), [c, _, E, k, m, oe]);');
  console.log('✓ Updated raw material movement filtering to respect _ movement filter');
}

// 8d. Update raw materials card rendering in k1 to recognize opening_balance with distinctive badge & styling
const rawCardAnchor = `            const D = oe.get(S.materialKey),
                  F = S.delta >= 0;
            return o.jsxs("div", {
              className: "card",
              style: { padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" },
                      children: [
                        o.jsx("span", { className: \`badge \${F ? "badge-success" : "badge-neutral"}\`, style: { fontSize: "10.5px" }, children: F ? "+ Restock Intake" : "- Auto Recipe Deduction" }),
                        o.jsx("strong", { style: { fontSize: "14px", color: "#f8fafc" }, children: D ? D.name : S.materialKey })
                      ]
                    }),`;

const rawCardIdx = bundle.indexOf(rawCardAnchor);
if (rawCardIdx !== -1) {
  const newRawCard = `            const D = oe.get(S.materialKey),
                  isBase = S.type === "opening_balance",
                  isRestock = S.type === "restock_in" || (!isBase && S.delta > 0),
                  F = S.delta >= 0;
            return o.jsxs("div", {
              className: "card",
              style: { padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", borderLeft: isBase ? "3px solid #38bdf8" : isRestock ? "3px solid #34d399" : "3px solid #f87171" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsxs("div", {
                      style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" },
                      children: [
                        isBase ? o.jsxs("span", { className: "badge badge-info", style: { fontSize: "10.5px" }, children: [o.jsx(mc, { size: 11 }), " Baseline Stock"] }) :
                        isRestock ? o.jsx("span", { className: "badge badge-success", style: { fontSize: "10.5px" }, children: "+ Restock Intake" }) :
                        o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "10.5px" }, children: "- Auto Recipe Deduction" }),
                        o.jsx("strong", { style: { fontSize: "14px", color: "#f8fafc" }, children: D ? D.name : S.materialKey })
                      ]
                    }),`;
  bundle = bundle.slice(0, rawCardIdx) + newRawCard + bundle.slice(rawCardIdx + rawCardAnchor.length);
  
  // Also color delta on right side: isBase -> #38bdf8
  const deltaColorAnchor = 'color: F ? "#34d399" : "#f87171" }, children: [F ? "+" : "", S.delta, " ", S.unit]';
  bundle = bundle.replace(deltaColorAnchor, 'color: isBase ? "#38bdf8" : (F ? "#34d399" : "#f87171") }, children: [F ? "+" : "", S.delta, " ", S.unit]');
  console.log('✓ Updated raw materials ledger card rendering for Baseline Stock badge & styling');
}

// 9. Save bundle and bump cache
fs.writeFileSync('assets/index-hgjhj-0G.js', bundle, 'utf8');
console.log('✓ Successfully wrote updated assets/index-hgjhj-0G.js');

// Bump cache
require('./bump_cache.js');
console.log('✓ Cache bumped successfully');
