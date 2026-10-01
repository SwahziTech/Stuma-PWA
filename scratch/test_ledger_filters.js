const fs = require('fs');

const pad = (n) => String(n).padStart(2, '0');
const toYMD = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
const now = new Date();
console.log('Today:', toYMD(now));

const past7 = new Date(now);
past7.setDate(past7.getDate() - 6);
console.log('This Week (last 7d):', toYMD(past7), 'to', toYMD(now));

const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
console.log('This Month:', toYMD(firstOfMonth), 'to', toYMD(now));

const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
console.log('Last Month:', toYMD(firstOfLastMonth), 'to', toYMD(lastOfLastMonth));

// Test category filtering and summary
const mockItems = [
  { id: '1', name: 'Z-Plain 60mm', category: 'Paving Blocks', pcs_per_sqm: 50 },
  { id: '2', name: '6" Dust Block', category: 'Hollow Blocks', pcs_per_sqm: null },
  { id: '3', name: 'Trihex 80mm', category: 'Paving Blocks', pcs_per_sqm: 40 }
];

const mockMovements = [
  { id: 'm1', item_id: '1', type: 'production_in', date: toYMD(now), quantity_pcs: 500, quantity_sqm: 10 },
  { id: 'm2', item_id: '1', type: 'dispatch_out', date: toYMD(now), quantity_pcs: 300, quantity_sqm: 6 },
  { id: 'm3', item_id: '2', type: 'production_in', date: toYMD(now), quantity_pcs: 200, quantity_sqm: null },
  { id: 'm4', item_id: '3', type: 'dispatch_out', date: '2020-01-01', quantity_pcs: 100, quantity_sqm: 2.5 }
];

const itemMap = new Map(mockItems.map(it => [it.id, it]));

// Filter by category "Paving Blocks" and date range "this_month"
const selectedCategory = 'Paving Blocks';
const startDate = toYMD(firstOfMonth);
const endDate = toYMD(now);

const filtered = mockMovements.filter(m => {
  if (selectedCategory !== 'all') {
    const it = itemMap.get(m.item_id);
    if (!it || it.category !== selectedCategory) return false;
  }
  if (startDate && m.date < startDate) return false;
  if (endDate && m.date > endDate) return false;
  return true;
});

console.log('Filtered movements count:', filtered.length); // should be 2 (m1, m2)

let prodPcs = 0, prodSqm = 0, prodCount = 0;
let salesPcs = 0, salesSqm = 0, salesCount = 0;
for (const m of filtered) {
  const pcs = Number(m.quantity_pcs) || 0;
  const sqm = Number(m.quantity_sqm) ? Math.abs(Number(m.quantity_sqm)) : 0;
  if (m.type === 'production_in') {
    prodPcs += pcs;
    prodSqm += sqm;
    prodCount++;
  } else if (m.type === 'dispatch_out') {
    salesPcs += pcs;
    salesSqm += sqm;
    salesCount++;
  }
}

console.log('Production: ' + prodPcs + ' pcs, ' + prodSqm + ' sqm, ' + prodCount + ' logs');
console.log('Sales: ' + salesPcs + ' pcs, ' + salesSqm + ' sqm, ' + salesCount + ' logs');
