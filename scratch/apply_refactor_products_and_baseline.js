const fs = require('fs');
const vm = require('vm');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/index-hgjhj-0G.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

console.log('--- Applying Refactor for Products (Delete) & Baseline (Undo) ---');

// =========================================================================
// 1. UPDATE AppProvider (Add deleteItem and deleteMovements)
// =========================================================================
const pFuncTarget = 'return b(ce=>[ie,...ce]),Ht()&&(Y(!0),await Iv(ie),Y(!1)),ie},[]),';
if (!bundle.includes(pFuncTarget)) {
  throw new Error('Could not find P function target in AppProvider!');
}

const newProviderMethods = `deleteItem=B.useCallback(async itemId=>{b(ce=>ce.filter(Oe=>Oe.id!==itemId));E(ce=>ce.filter(Oe=>Oe.item_id!==itemId));try{const rawItems=localStorage.getItem(lp);if(rawItems){const list=JSON.parse(rawItems);localStorage.setItem(lp,JSON.stringify(list.filter(Oe=>Oe.id!==itemId)));}const rawMovs=localStorage.getItem(cp);if(rawMovs){const list=JSON.parse(rawMovs);localStorage.setItem(cp,JSON.stringify(list.filter(Oe=>Oe.item_id!==itemId)));}}catch(err){}const client=Ht();if(client){try{Y(!0);await client.from("movements").delete().eq("item_id",itemId);await client.from("items").delete().eq("id",itemId);Y(!1);}catch(err){Y(!1);console.warn("Supabase deleteItem error:",err);}}return!0;},[]),deleteMovements=B.useCallback(async target=>{let predicate;if(Array.isArray(target)||typeof target==="string"){const idsSet=new Set(Array.isArray(target)?target:[target]);predicate=mov=>idsSet.has(mov.id);}else if(target&&typeof target==="object"){predicate=mov=>{if(target.batch_id&&mov.batch_id===target.batch_id)return!0;if(target.item_id&&mov.item_id===target.item_id&&(!target.type||mov.type===target.type))return!0;if(target.ids&&target.ids.includes(mov.id))return!0;return!1;};}else{return[];}let removedMovs=[];E(prev=>{removedMovs=prev.filter(predicate);return prev.filter(mov=>!predicate(mov));});try{const rawMovs=localStorage.getItem(cp);if(rawMovs){const list=JSON.parse(rawMovs);localStorage.setItem(cp,JSON.stringify(list.filter(mov=>!predicate(mov))));}}catch(err){}const client=Ht();if(client&&removedMovs.length>0){try{const idsToRemove=removedMovs.map(m=>m.id).filter(Boolean);if(idsToRemove.length>0){Y(!0);await client.from("movements").delete().in("id",idsToRemove);Y(!1);}}catch(err){Y(!1);console.warn("Supabase deleteMovements error:",err);}}return removedMovs;},[]),`;

bundle = bundle.replace(pFuncTarget, pFuncTarget + newProviderMethods);
console.log('✓ Added deleteItem and deleteMovements callbacks to AppProvider');

const contextValueTarget = 'updateItem:ue,addItem:P,';
if (!bundle.includes(contextValueTarget)) {
  throw new Error('Could not find contextValueTarget in AppProvider!');
}
bundle = bundle.replace(contextValueTarget, 'updateItem:ue,addItem:P,deleteItem:deleteItem,removeItem:deleteItem,deleteMovements:deleteMovements,');
console.log('✓ Added deleteItem, removeItem, deleteMovements to AppProvider context value');

// =========================================================================
// 2. REFACTOR PRODUCTS (S1) - Enable Delete Products
// =========================================================================
const s1Target = 'S1=()=>{const{items:s,updateItem:t,addItem:r}=Vt(),';
if (!bundle.includes(s1Target)) {
  throw new Error('Could not find S1 component declaration!');
}

const s1NewDecl = `S1=()=>{const{items:s,updateItem:t,addItem:r,deleteItem}=Vt(),handleDeleteProduct=async M=>{if(!M)return;const ee=window.confirm(\`Are you sure you want to delete "\${M.name}"?\\n\\nThis will permanently remove it from the product catalog.\`);if(!ee)return;deleteItem&&await deleteItem(M.id),x&&x.id===M.id&&(b(null),E(!1)),ne(\`Product "\${M.name}" deleted successfully.\`)},`;
bundle = bundle.replace(s1Target, s1NewDecl);
console.log('✓ Injected deleteItem and handleDeleteProduct into S1');

// Replace Edit button on card with Edit & Delete buttons
const cardEditBtnTarget = 'o.jsxs("button",{onClick:()=>Y(M),className:"btn btn-secondary btn-sm",style:{padding:"6px 12px",fontSize:"12px",flexShrink:0},children:[o.jsx(Ox,{size:13,color:"var(--brand-400)"}),o.jsx("span",{children:"Edit"})]})';
if (!bundle.includes(cardEditBtnTarget)) {
  throw new Error('Could not find cardEditBtnTarget in S1!');
}

const cardButtonsReplacement = `o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",flexShrink:0},children:[o.jsxs("button",{onClick:()=>Y(M),className:"btn btn-secondary btn-sm",style:{padding:"6px 12px",fontSize:"12px"},children:[o.jsx(Ox,{size:13,color:"var(--brand-400)"}),o.jsx("span",{children:"Edit"})]}),o.jsxs("button",{type:"button",onClick:()=>handleDeleteProduct(M),className:"btn btn-ghost btn-sm",style:{padding:"6px 10px",fontSize:"12px",color:"var(--status-danger)",border:"1px solid rgba(239, 68, 68, 0.3)",borderRadius:"var(--radius-md)",display:"flex",alignItems:"center",gap:"4px"},title:\`Delete \${M.name}\`,children:[o.jsx(Yp,{size:13}),o.jsx("span",{children:"Delete"})]})]})`;
bundle = bundle.replace(cardEditBtnTarget, cardButtonsReplacement);
console.log('✓ Added Delete button to product registry cards in S1');

// Replace Modal footer to include Delete Product button when editing
const modalFooterTarget = 'o.jsxs("div",{style:{display:"flex",gap:"10px",justifyContent:"flex-end",marginTop:"16px"},children:[o.jsx("button",{type:"button",onClick:()=>{b(null),E(!1)},className:"btn btn-secondary",children:"Cancel"}),o.jsx("button",{type:"submit",className:"btn btn-primary",children:x?"Save Changes":"Create Product"})]})';
if (!bundle.includes(modalFooterTarget)) {
  throw new Error('Could not find modalFooterTarget in S1!');
}

const modalFooterReplacement = `o.jsxs("div",{style:{display:"flex",gap:"10px",alignItems:"center",justifyContent:"space-between",marginTop:"16px",flexWrap:"wrap"},children:[x?o.jsxs("button",{type:"button",onClick:()=>handleDeleteProduct(x),className:"btn btn-ghost",style:{color:"var(--status-danger)",border:"1px solid rgba(239, 68, 68, 0.4)",display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",padding:"8px 12px"},children:[o.jsx(Yp,{size:14}),o.jsx("span",{children:"Delete Product"})]}):o.jsx("div",{}),o.jsxs("div",{style:{display:"flex",gap:"10px"},children:[o.jsx("button",{type:"button",onClick:()=>{b(null),E(!1)},className:"btn btn-secondary",children:"Cancel"}),o.jsx("button",{type:"submit",className:"btn btn-primary",children:x?"Save Changes":"Create Product"})]})]})`;
bundle = bundle.replace(modalFooterTarget, modalFooterReplacement);
console.log('✓ Added Delete Product button to modal footer in S1');

// =========================================================================
// 3. REFACTOR BASELINE (w1) - Introduce Undo Previous Entries Button
// =========================================================================
const w1Target = 'w1=()=>{const{items:s,movements:t,addMovementsBatch:r,staffName:a,resetProductBaseline}=Vt(),';
if (!bundle.includes(w1Target)) {
  throw new Error('Could not find w1 component declaration!');
}

const w1NewDecl = `w1=()=>{const{items:s,movements:t,addMovementsBatch:r,staffName:a,resetProductBaseline,deleteMovements}=Vt(),handleUndoPreviousEntries=async()=>{const M=t.filter(ee=>ee.type==="opening_balance");if(M.length===0){if(Object.keys(f).some(ee=>f[ee]&&parseFloat(f[ee])>0)){const ee=window.confirm("You have unsaved baseline entries typed in the form.\\n\\nDo you want to undo/clear these unsaved inputs?");ee&&(m({}),window.alert("✓ Unsaved baseline inputs cleared."))}else window.alert("No previous baseline entries found to undo.");return}const ee=M[M.length-1];let le=[];ee.batch_id?le=M.filter(he=>he.batch_id===ee.batch_id):ee.created_at&&(le=M.filter(he=>he.created_at===ee.created_at)),le.length===0&&(le=[ee]);const he=Array.from(new Set(le.map(Pe=>{const oe=s.find(ue=>ue.id===Pe.item_id);return oe?oe.name:"Product"}))).join(", "),Pe=window.confirm(\`Undo previous baseline entry for:\\n\${he} (\${le.length} \${le.length===1?"record":"records"})?\\n\\nThis will remove the baseline record and restore the values into the form inputs for editing.\`);if(!Pe)return;deleteMovements&&await deleteMovements({ids:le.map(oe=>oe.id),batch_id:ee.batch_id}),m(oe=>{const ue={...oe};for(const P of le){const y=\`\${P.item_id}_\${P.color||"Standard"}\`,O=g[P.item_id]||"pcs",z=O==="sqm"&&P.quantity_sqm!=null?P.quantity_sqm:P.quantity_pcs;ue[y]=String(z)}return ue}),L(null),window.alert(\`✓ Undid previous baseline entries for \${he}.\\n\\nValues have been restored to the form inputs for editing.\`)},handleUndoItemBaseline=async M=>{const ee=t.filter(le=>le.type==="opening_balance"&&le.item_id===M.id);if(ee.length===0)return;const le=window.confirm(\`Undo baseline entry for "\${M.name}"?\\n\\nThis will remove its baseline record and restore its values into the form so you can edit it.\`);if(!le)return;deleteMovements&&await deleteMovements(ee.map(he=>he.id)),m(he=>{const Pe={...he};for(const oe of ee){const G=\`\${oe.item_id}_\${oe.color||"Standard"}\`,ue=g[oe.item_id]||"pcs",P=ue==="sqm"&&oe.quantity_sqm!=null?oe.quantity_sqm:oe.quantity_pcs;Pe[G]=String(P)}return Pe}),window.alert(\`✓ Baseline entry for "\${M.name}" removed and restored to form inputs.\`)},`;
bundle = bundle.replace(w1Target, w1NewDecl);
console.log('✓ Injected handleUndoPreviousEntries and handleUndoItemBaseline into w1');

// Replace top baseline buttons in w1 to include "Undo Previous Entries" button
const baselineTopBtnsTarget = `o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[o.jsxs("button",{type:"button",onClick:handleResetBaseline,className:"btn btn-ghost btn-sm",style:{border:"1px solid rgba(239, 68, 68, 0.4)",color:"#ef4444",padding:"9px 13px",fontSize:"13px",fontWeight:600,display:"flex",alignItems:"center",gap:"6px",borderRadius:"var(--radius-md)"},title:"Reset all product baseline opening balances for testing",children:[o.jsx("span",{children:"🔄"}),o.jsx("span",{children:"Reset Baseline"})]}),o.jsxs("button",{type:"button",disabled:j||xe.length===0,onClick:Ie,className:"btn btn-primary btn-lg",style:{padding:"10px 20px",fontSize:"14.5px",fontWeight:700,borderRadius:"var(--radius-md)",boxShadow:"0 4px 16px rgba(249, 115, 22, 0.4)",display:"flex",alignItems:"center",gap:"8px"},children:[o.jsx(gc,{size:18}),o.jsx("span",{children:j?"Saving...":xe.length>0?\`Save (\${xe.length})\`:"Save Opening Balance"})]})]})`;
if (!bundle.includes(baselineTopBtnsTarget)) {
  throw new Error('Could not find baselineTopBtnsTarget in w1!');
}

const baselineTopBtnsReplacement = `o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:[o.jsxs("button",{type:"button",onClick:handleResetBaseline,className:"btn btn-ghost btn-sm",style:{border:"1px solid rgba(239, 68, 68, 0.4)",color:"#ef4444",padding:"9px 13px",fontSize:"13px",fontWeight:600,display:"flex",alignItems:"center",gap:"6px",borderRadius:"var(--radius-md)"},title:"Reset all product baseline opening balances for testing",children:[o.jsx("span",{children:"🔄"}),o.jsx("span",{children:"Reset Baseline"})]}),o.jsxs("button",{type:"button",onClick:handleUndoPreviousEntries,className:"btn btn-secondary btn-sm",style:{border:"1px solid rgba(249, 115, 22, 0.4)",color:"var(--brand-400)",background:"rgba(249, 115, 22, 0.08)",padding:"9px 13px",fontSize:"13px",fontWeight:700,display:"flex",alignItems:"center",gap:"6px",borderRadius:"var(--radius-md)"},title:"Undo previous baseline entries and restore values to inputs",children:[o.jsx(Mx,{size:15}),o.jsx("span",{children:"Undo Previous Entries"})]}),o.jsxs("button",{type:"button",disabled:j||xe.length===0,onClick:Ie,className:"btn btn-primary btn-lg",style:{padding:"10px 20px",fontSize:"14.5px",fontWeight:700,borderRadius:"var(--radius-md)",boxShadow:"0 4px 16px rgba(249, 115, 22, 0.4)",display:"flex",alignItems:"center",gap:"8px"},children:[o.jsx(gc,{size:18}),o.jsx("span",{children:j?"Saving...":xe.length>0?\`Save (\${xe.length})\`:"Save Opening Balance"})]})]})`;
bundle = bundle.replace(baselineTopBtnsTarget, baselineTopBtnsReplacement);
console.log('✓ Added "Undo Previous Entries" button to Baseline header');

// Replace Baselined badge to include individual Undo button on row
const baselinedBadgeTarget = 'children:[o.jsx("span",{style:{fontSize:"14.5px",fontWeight:700,color:"#f8fafc"},children:oe.name}),G&&o.jsx("span",{className:"badge badge-success",style:{fontSize:"10px",padding:"1px 5px"},children:"Baselined ✓"})]';
if (!bundle.includes(baselinedBadgeTarget)) {
  throw new Error('Could not find baselinedBadgeTarget in w1!');
}

const baselinedBadgeReplacement = `children:[o.jsx("span",{style:{fontSize:"14.5px",fontWeight:700,color:"#f8fafc"},children:oe.name}),G&&o.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:"6px"},children:[o.jsx("span",{className:"badge badge-success",style:{fontSize:"10px",padding:"1px 5px"},children:"Baselined ✓"}),o.jsxs("button",{type:"button",onClick:()=>handleUndoItemBaseline(oe),className:"btn btn-ghost btn-sm",style:{padding:"2px 7px",fontSize:"11px",color:"var(--brand-400)",border:"1px solid rgba(249, 115, 22, 0.3)",borderRadius:"4px",display:"inline-flex",alignItems:"center",gap:"3px"},title:\`Undo baseline entry for \${oe.name}\`,children:[o.jsx(Mx,{size:11}),o.jsx("span",{children:"Undo"})]})]})]`;
bundle = bundle.replace(baselinedBadgeTarget, baselinedBadgeReplacement);
console.log('✓ Added individual Undo button to baselined products in w1');

// =========================================================================
// 4. VERIFY SYNTAX BEFORE SAVING
// =========================================================================
try {
  new vm.Script(bundle);
  console.log('✓ Full bundle syntax verified 100% valid JavaScript!');
} catch (err) {
  console.error('❌ SYNTAX ERROR in modified bundle:');
  console.error(err);
  process.exit(1);
}

fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log('✓ Successfully wrote modified bundle to assets/index-hgjhj-0G.js');
