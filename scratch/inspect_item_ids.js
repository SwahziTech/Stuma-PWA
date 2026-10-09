const fs = require('fs');
const path = require('path');

const items = JSON.parse(fs.readFileSync(path.join(__dirname, 'backups', 'supabase_items_latest.json'), 'utf8'));
const movements = JSON.parse(fs.readFileSync(path.join(__dirname, 'backups', 'supabase_movements_latest.json'), 'utf8'));

// Extract bundled items (nc)
const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');
const start = code.indexOf(',nc=') + 4;
let depth = 0, end = start;
for (let i = start; i < code.length; i++) {
  if (code[i] === '[') depth++;
  else if (code[i] === ']') {
    depth--;
    if (depth === 0) { end = i + 1; break; }
  }
}
const bundledItems = eval(code.substring(start, end));

console.log('--- Target Items in Bundled Catalog (nc) ---');
['item-hb-01', 'item-hb-02', 'item-pb-13'].forEach(id => {
  const found = bundledItems.find(it => it.id === id);
  console.log(`Bundled ${id}:`, found);
});

console.log('\n--- Target Items in Supabase (items) ---');
const sbMatches = items.filter(it => 
  it.id.includes('hb') || it.id.includes('pb-13') || 
  it.name.toLowerCase().includes('6"') || it.name.toLowerCase().includes('mpa') ||
  it.name.toLowerCase().includes('40 y')
);
sbMatches.forEach(it => {
  console.log(`Supabase ${it.id}:`, { name: it.name, category: it.category, unit: it.unit });
});

console.log('\n--- Checking References in Existing Movements ---');
const movItemIds = new Set(movements.map(m => m.item_id));
console.log('Total distinct item_ids referenced in movements:', movItemIds.size);
['item-hb-01', 'item-hb-02', 'item-pb-13', 'fa40b4b9-da17-4ea2-9cad-7c0aeb98db13', 'f00adc97-865a-464e-bf6c-5da07e46b9ae', '7fed035f-7adf-4684-be90-128ffc59d9c9'].forEach(id => {
  const count = movements.filter(m => m.item_id === id).length;
  console.log(`Movements referencing ${id}: ${count}`);
});
