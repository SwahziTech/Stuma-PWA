const mockMovements = [
  {
    id: 'm1',
    item_id: 'item-pb-01',
    type: 'production_in',
    batch_id: 'batch-1',
    quantity_pcs: 330,
    quantity_sqm: 11,
    actual_cement_bags: 2,
    computed_materials_deducted: { cementBags: 2 },
    date: '2026-09-29'
  },
  {
    id: 'm2',
    item_id: 'item-pb-01',
    type: 'dispatch_out',
    quantity_pcs: 150,
    quantity_sqm: 5,
    total_price: 300000,
    date: '2026-09-29'
  },
  {
    id: 'm3',
    item_id: 'item-ks-01', // Kerbstone
    type: 'production_in',
    batch_id: 'batch-2',
    quantity_pcs: 10,
    quantity_sqm: null,
    actual_cement_bags: 2,
    computed_materials_deducted: { cementBags: 2 },
    date: '2026-09-29'
  },
  {
    id: 'm4',
    item_id: 'item-ks-01',
    type: 'dispatch_out',
    quantity_pcs: 6,
    quantity_sqm: null,
    total_price: 105000,
    date: '2026-09-29'
  }
];

const mockItems = new Map([
  ['item-pb-01', { id: 'item-pb-01', name: 'Z-Plain Press', category: 'Paving Blocks', unit: 'sqm' }],
  ['item-ks-01', { id: 'item-ks-01', name: '80cm Press', category: 'Kerbstones', unit: 'pcs' }]
]);

// Compute stats
const byProduct = new Map();
const seenBatches = new Set();
let totalCementBags = 0;
let totalSalesAmount = 0;

for (const mov of mockMovements) {
  const item = mockItems.get(mov.item_id);
  const prodId = mov.item_id || "unknown";
  if (!byProduct.has(prodId)) {
    byProduct.set(prodId, {
      id: prodId,
      name: item ? item.name : prodId,
      category: item ? item.category : "",
      unit: item ? item.unit : "pcs",
      prodPcs: 0,
      prodSqm: 0,
      prodCement: 0,
      salesPcs: 0,
      salesSqm: 0,
      salesAmount: 0
    });
  }
  const stat = byProduct.get(prodId);
  const pcs = Number(mov.quantity_pcs) || 0;
  const sqm = Number(mov.quantity_sqm) ? Math.abs(Number(mov.quantity_sqm)) : 0;

  if (mov.type === "production_in") {
    stat.prodPcs += pcs;
    stat.prodSqm += sqm;

    const batchKey = mov.batch_id || mov.id;
    if (!seenBatches.has(batchKey)) {
      seenBatches.add(batchKey);
      const cement = Number(mov.actual_cement_bags) || 
                     Number(mov.computed_materials_deducted && mov.computed_materials_deducted.cementBags) || 
                     0;
      totalCementBags += cement;
      stat.prodCement += cement;
    }
  } else if (mov.type === "dispatch_out") {
    stat.salesPcs += pcs;
    stat.salesSqm += sqm;
    const amt = Number(mov.total_price) || Number(mov.total_amount) || 0;
    stat.salesAmount += amt;
    totalSalesAmount += amt;
  }
}

const productsList = Array.from(byProduct.values()).filter(p => p.prodPcs > 0 || p.salesPcs > 0);

console.log('Total Cement Used:', totalCementBags, 'bags');
console.log('Total Sales Amount: Tsh', totalSalesAmount.toLocaleString());
console.log('Unique Products:', productsList.length);
productsList.forEach(p => {
  console.log(`- ${p.name}: Prod = +${p.prodPcs} pcs (${p.prodSqm} sqm, ${p.prodCement} bags cem) | Sales = -${p.salesPcs} pcs (${p.salesSqm} sqm, Tsh ${p.salesAmount.toLocaleString()})`);
});
