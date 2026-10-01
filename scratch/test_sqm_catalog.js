const fs = require('fs');
const code = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const start = code.indexOf(',nc=') + 4;
let depth = 0, end = start;
for (let i = start; i < code.length; i++) {
  if (code[i] === '[') depth++;
  else if (code[i] === ']') {
    depth--;
    if (depth === 0) { end = i + 1; break; }
  }
}
const items = eval(code.substring(start, end));

function getItemCatalogPrice(item) {
  if (!item) return { price: 0, unit: 'pcs', label: '0 Tsh' };
  const name = (item.name || '').toLowerCase();
  const cat = (item.category || '').toLowerCase();
  const isSqm = item.unit === 'sqm';

  if (isSqm) {
    if (cat.includes('floor')) {
      if (name.includes('slab')) return { price: 16500, unit: 'sqm', label: '16,500 Tsh/m²' };
      if (name.includes('combo') && name.includes('800')) return { price: 32500, unit: 'sqm', label: '32,500 Tsh/m²' };
      return { price: 25500, unit: 'sqm', label: '25,500 Tsh/m²' };
    }
    if (cat.includes('wall')) {
      return { price: 25500, unit: 'sqm', label: '25,500 Tsh/m²' };
    }
    if (cat.includes('paving')) {
      if (name.includes('u dot') || name.includes('udot') || name.includes('z plain') || name.includes('trio') || name.includes('culture') || name.includes('v paver') || name.includes('v-shape') || name.includes('kisu')) {
        return { price: 29500, unit: 'sqm', label: '29,500 Tsh/m²' };
      }
      if (name.includes('40') || name.includes('45') || name.includes('mpa-40')) {
        return { price: 35000, unit: 'sqm', label: '35,000 Tsh/m²' };
      }
      if (name.includes('60') || name.includes('6cm') || name.includes('rough 6cm') || name.includes('worldcup')) {
        return { price: 25830, unit: 'sqm', label: '25,830 Tsh/m²' };
      }
      return { price: 31500, unit: 'sqm', label: '31,500 Tsh/m²' };
    }
    return { price: 25500, unit: 'sqm', label: '25,500 Tsh/m²' };
  }

  // Pcs items
  if (cat.includes('culvert')) {
    if (name.includes('900n')) return { price: 146000, unit: 'pcs', label: '146,000 Tsh/pc' };
    if (name.includes('900r') || name.includes('600n')) return { price: 116000, unit: 'pcs', label: '116,000 Tsh/pc' };
    if (name.includes('600r') || name.includes('400n')) return { price: 96000, unit: 'pcs', label: '96,000 Tsh/pc' };
    if (name.includes('400r')) return { price: 76000, unit: 'pcs', label: '76,000 Tsh/pc' };
    return { price: 96000, unit: 'pcs', label: '96,000 Tsh/pc' };
  }
  if (cat.includes('kerb') || cat.includes('curb')) {
    if (name.includes('panasonic')) return { price: 18500, unit: 'pcs', label: '18,500 Tsh/pc' };
    if (name.includes('100') || name.includes('80')) return { price: 17500, unit: 'pcs', label: '17,500 Tsh/pc' };
    if (name.includes('60') || name.includes('50 press')) return { price: 13500, unit: 'pcs', label: '13,500 Tsh/pc' };
    if (name.includes('50') || name.includes('bevo') || name.includes('bevel')) return { price: 11500, unit: 'pcs', label: '11,500 Tsh/pc' };
    return { price: 13500, unit: 'pcs', label: '13,500 Tsh/pc' };
  }
  if (cat.includes('mifuniko') || cat.includes('cover')) {
    if (name.includes('mkubwa') || name.includes('cm80') || name.includes('cm60') || name.includes('nondo') || name.includes('ulalo')) return { price: 13500, unit: 'pcs', label: '13,500 Tsh/pc' };
    return { price: 11500, unit: 'pcs', label: '11,500 Tsh/pc' };
  }
  if (cat.includes('pole') || cat.includes('nguzo')) {
    if (name.includes('bicon')) return { price: 26000, unit: 'pcs', label: '26,000 Tsh/pc' };
    return { price: 8000, unit: 'pcs', label: '8,000 Tsh/pc' };
  }
  if (cat.includes('block') || cat.includes('tofali')) {
    if (name.includes('dust') || name.includes('chip') || name.includes('8"')) return { price: 2242, unit: 'pcs', label: '2,242 Tsh/pc' };
    if (name.includes('hollow')) return { price: 1888, unit: 'pcs', label: '1,888 Tsh/pc' };
    return { price: 1770, unit: 'pcs', label: '1,770 Tsh/pc' };
  }

  return { price: 1000, unit: 'pcs', label: '1,000 Tsh/pc' };
}

items.forEach(it => {
  const p = getItemCatalogPrice(it);
  console.log(it.name.padEnd(25), '|', it.category.padEnd(18), '| unit:', it.unit.padEnd(5), '|', p.label);
});
