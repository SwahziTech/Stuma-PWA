const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

console.log('Original bundle size:', bundle.length);

// =========================================================================
// PART 1: UPDATE C1 FOR TAB SWITCH PERSISTENCE (ALL TABS)
// =========================================================================
const oldMainTabs = `o.jsxs("main",{className:"main-content",children:[t==="dashboard"&&o.jsx(x1,{onNavigate:f}),t==="production"&&o.jsx(_1,{prefillItemId:a,onClearPrefill:()=>c(void 0),onSuccess:()=>r("dashboard")}),t==="sales"&&o.jsx(b1,{prefillItemId:a,onClearPrefill:()=>c(void 0),onSuccess:()=>r("dashboard")}),t==="opening_balance"&&o.jsx(w1,{}),t==="items"&&o.jsx(S1,{}),t==="history"&&o.jsx(k1,{})]})`;

const newMainTabs = `o.jsxs("main",{className:"main-content",children:[o.jsx("div",{style:{display:t==="dashboard"?"block":"none",width:"100%"},children:o.jsx(x1,{onNavigate:f})}),o.jsx("div",{style:{display:t==="production"?"block":"none",width:"100%"},children:o.jsx(_1,{prefillItemId:a,onClearPrefill:()=>c(void 0),onSuccess:()=>r("dashboard")})}),o.jsx("div",{style:{display:t==="sales"?"block":"none",width:"100%"},children:o.jsx(b1,{prefillItemId:a,onClearPrefill:()=>c(void 0),onSuccess:()=>r("dashboard")})}),o.jsx("div",{style:{display:t==="opening_balance"?"block":"none",width:"100%"},children:o.jsx(w1,{})}),o.jsx("div",{style:{display:t==="items"?"block":"none",width:"100%"},children:o.jsx(S1,{})}),o.jsx("div",{style:{display:t==="history"?"block":"none",width:"100%"},children:o.jsx(k1,{})})]})`;

if (!bundle.includes(oldMainTabs)) {
  console.error('ERROR: oldMainTabs not found in bundle!');
  process.exit(1);
}
bundle = bundle.replace(oldMainTabs, newMainTabs);
console.log('Successfully updated C1 tab rendering for all tabs persistence!');

// =========================================================================
// PART 2: UPDATE addMovementsBatch FOR EXACT MATERIAL DEDUCTION (NO APPROXIMATIONS)
// =========================================================================
const oldGRecipeDeduction = `          ce = [],
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
    }`;

const newGRecipeDeduction = `          ce = [],
          Oe = V.map((_e, Ue)=>{
            const K = x.find(Ae => Ae.id===_e.item_id);
            let be = _e.materials_used || _e.computed_materials_deducted || null;
            if(_e.type==="production_in" && K && _e.quantity_pcs > 0){
              if (!be) be = Pa(K, _e.quantity_pcs, _e.color);
              ce.push({item:K, pieces:_e.quantity_pcs, color:_e.color, materialsUsed:_e.materials_used || _e.computed_materials_deducted});
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

    // 1. Perform Recipe Deductions for Production (Exact user feed, no approximations)
    if(ce.length > 0){
      let _e;
      const exactEntries = ce.filter(c => c.materialsUsed);
      if(exactEntries.length > 0){
        _e = {cementBags:0, sandBuckets:0, chippingBuckets:0, aggregateBuckets:0, chemicalLiters:0, pigmentRedKg:0, pigmentGreyKg:0, pigmentBlackKg:0};
        for(const entry of exactEntries){
          const m = entry.materialsUsed;
          _e.cementBags += Number(m.cement_bags || m.cementBags || 0);
          _e.sandBuckets += Number(m.sand_buckets || m.sandBuckets || 0);
          _e.chippingBuckets += Number(m.chipping_buckets || m.chippingBuckets || 0);
          _e.aggregateBuckets += Number(m.aggregate_buckets || m.aggregateBuckets || 0);
          _e.chemicalLiters += Number(m.chemical_liters || m.chemicalLiters || 0);
          if(m.pigment_red_kg) _e.pigmentRedKg += Number(m.pigment_red_kg);
          else if(entry.color && entry.color.toLowerCase() === "red") _e.pigmentRedKg += Number(m.pigment_kg || 0);
          if(m.pigment_black_kg) _e.pigmentBlackKg += Number(m.pigment_black_kg);
          else if(entry.color && entry.color.toLowerCase() === "black") _e.pigmentBlackKg += Number(m.pigment_kg || 0);
        }
        for(const k in _e){ _e[k] = Number(_e[k].toFixed(2)); }
      } else {
        _e = lg(ce);
      }
      await he(_e, J, \`Batch production of \${ce.length} product entries (\${V.reduce((Ue,K)=>Ue+(K.quantity_pcs||0),0)} pcs)\`);
    }`;

if (!bundle.includes(oldGRecipeDeduction)) {
  console.error('ERROR: oldGRecipeDeduction not found in bundle!');
  process.exit(1);
}
bundle = bundle.replace(oldGRecipeDeduction, newGRecipeDeduction);
console.log('Successfully updated addMovementsBatch for exact deduction without approximations!');

// Save intermediate bundle to verify
fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log('Saved bundle step 1 & 2');
