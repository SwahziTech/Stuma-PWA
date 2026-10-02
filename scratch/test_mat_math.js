const fs = require('fs');

// Test the math and conversion helpers
const materials = [
  { no: 1, key: "cement", purchaseUnit: "50 kg bags", unit: "bags", unitRatio: 1, currentBalance: 450, purchasePrice: 18500 },
  { no: 2, key: "mchanga_laini", purchaseUnit: "Trip (20 Cbm)", unit: "ndoo", unitRatio: 2500, currentBalance: 2500, purchasePrice: 350000 },
  { no: 8, key: "dawa", purchaseUnit: "Barrel of 200L", unit: "Liters", unitRatio: 200, currentBalance: 200, purchasePrice: 480000 },
  { no: 9, key: "rangi_red", purchaseUnit: "Bags of 25kg", unit: "kg", unitRatio: 25, currentBalance: 75, purchasePrice: 85000 },
  { no: 12, key: "steel_r6", purchaseUnit: "Pcs / Bars (12m)", unit: "bars", unitRatio: 1, currentBalance: 60, purchasePrice: 12500 }
];

materials.forEach(m => {
  const effectiveUnitPrice = m.purchasePrice / (m.unitRatio || 1);
  const totalValuation = m.currentBalance * effectiveUnitPrice;
  console.log(`${m.key}: ${m.currentBalance} ${m.unit} @ ${m.purchasePrice} Tsh/${m.purchaseUnit} = Tsh ${totalValuation.toLocaleString()}`);
});

const grandTotal = materials.reduce((acc, m) => acc + (m.currentBalance * (m.purchasePrice / (m.unitRatio || 1))), 0);
console.log('Grand total:', grandTotal.toLocaleString(), 'Tsh');
