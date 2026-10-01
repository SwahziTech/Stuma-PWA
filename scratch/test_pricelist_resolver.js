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

function getItemPricelist(item) {
  if (!item) return { unitPrice: 0, sqmPrice: 0 };
  const name = (item.name || '').toLowerCase();
  const cat = (item.category || '').toLowerCase();

  // Culverts
  if (cat.includes('culvert') || name.includes('culvert')) {
    if (name.includes('900n')) return { unitPrice: 146000, sqmPrice: 0 };
    if (name.includes('900r') || name.includes('600n')) return { unitPrice: 116000, sqmPrice: 0 };
    if (name.includes('600r') || name.includes('400n')) return { unitPrice: 96000, sqmPrice: 0 };
    if (name.includes('400r')) return { unitPrice: 76000, sqmPrice: 0 };
    return { unitPrice: 96000, sqmPrice: 0 };
  }

  // Kerbstones
  if (cat.includes('kerb') || cat.includes('curb')) {
    if (name.includes('panasonic')) return { unitPrice: 18500, sqmPrice: 0 };
    if (name.includes('100') || name.includes('80')) return { unitPrice: 17500, sqmPrice: 0 };
    if (name.includes('60') || name.includes('50 press')) return { unitPrice: 13500, sqmPrice: 0 };
    if (name.includes('50') || name.includes('bevo') || name.includes('bevel')) return { unitPrice: 11500, sqmPrice: 0 };
    return { unitPrice: 13500, sqmPrice: 0 };
  }

  // Mifuniko / Covers
  if (cat.includes('mifuniko') || cat.includes('cover')) {
    if (name.includes('mkubwa') || name.includes('cm80') || name.includes('cm60') || name.includes('nondo') || name.includes('ulalo')) return { unitPrice: 13500, sqmPrice: 0 };
    return { unitPrice: 11500, sqmPrice: 0 };
  }

  // Poles / Nguzo
  if (cat.includes('pole') || cat.includes('nguzo')) {
    if (name.includes('bicon')) return { unitPrice: 26000, sqmPrice: 0 };
    return { unitPrice: 8000, sqmPrice: 0 };
  }

  // Blocks
  if (cat.includes('block') || cat.includes('tofali')) {
    if (name.includes('dust') || name.includes('chip') || name.includes('8"')) return { unitPrice: 2242, sqmPrice: 0 };
    if (name.includes('hollow')) return { unitPrice: 1888, sqmPrice: 0 };
    return { unitPrice: 1770, sqmPrice: 0 };
  }

  // Wall Tiles
  if (cat.includes('wall')) {
    if (name.includes('banzi') || name.includes('gamba sq')) return { unitPrice: 1159, sqmPrice: 25500 };
    if (name.includes('ngazi') || name.includes('wall gamba')) return { unitPrice: 1214, sqmPrice: 25500 };
    return { unitPrice: 2125, sqmPrice: 25500 };
  }

  // Floor Tiles (25500 per sqm standard)
  if (cat.includes('floor')) {
    if (name.includes('slab')) return { unitPrice: 16500, sqmPrice: 16500 };
    if (name.includes('combo') && name.includes('800')) return { unitPrice: 10833, sqmPrice: 32500 };
    if (name.includes('mbao')) return { unitPrice: 4250, sqmPrice: 25500 };
    if (name.includes('50plain') || (name.includes('draft') && (name.includes('490') || name.includes('450'))) || (name.includes('mayai') && !name.includes('40'))) return { unitPrice: 6375, sqmPrice: 25500 };
    if (name.includes('40')) return { unitPrice: 4250, sqmPrice: 25500 };
    if (name.includes('worldcup') || name.includes('350')) return { unitPrice: 3188, sqmPrice: 25500 };
    if (name.includes('30') || name.includes('draft') || name.includes('8gon')) return { unitPrice: 2318, sqmPrice: 25500 };
    if (name.includes('chuchu') || name.includes('buibui') || name.includes('25')) return { unitPrice: 1594, sqmPrice: 25500 };
    const psqm = item.pcs_per_sqm || 6;
    return { unitPrice: Math.round(25500 / psqm), sqmPrice: 25500 };
  }

  // Paving blocks
  if (cat.includes('paving')) {
    if (name.includes('u dot') || name.includes('udot')) return { unitPrice: 1475, sqmPrice: 29500 };
    if (name.includes('z plain') || name.includes('z-plain')) return { unitPrice: 983, sqmPrice: 29500 };
    if (name.includes('trio')) return { unitPrice: 1093, sqmPrice: 29500 };
    if (name.includes('culture')) return { unitPrice: 1054, sqmPrice: 29500 };
    if (name.includes('v paver') || name.includes('v-shape') || name.includes('v shape')) return { unitPrice: 567, sqmPrice: 29500 };
    if (name.includes('kisu')) return { unitPrice: 738, sqmPrice: 29500 };
    if (name.includes('worldcup')) return { unitPrice: 783, sqmPrice: 25830 };
    if (name.includes('h paver') || name.includes('mtungi')) {
      if (name.includes('40') || name.includes('45')) return { unitPrice: 946, sqmPrice: 35000 };
      if (name.includes('60') || name.includes('6cm')) return { unitPrice: 698, sqmPrice: 25830 };
      return { unitPrice: 851, sqmPrice: 31500 };
    }
    if (name.includes('zigzag')) {
      if (name.includes('40') || name.includes('45')) return { unitPrice: 729, sqmPrice: 35000 };
      if (name.includes('60') || name.includes('6cm')) return { unitPrice: 538, sqmPrice: 25830 };
      return { unitPrice: 656, sqmPrice: 31500 };
    }
    // Rectangular / standard press
    if (name.includes('40') || name.includes('45') || name.includes('mpa-40')) return { unitPrice: 700, sqmPrice: 35000 };
    if (name.includes('60') || name.includes('6cm') || name.includes('rough 6cm')) return { unitPrice: 517, sqmPrice: 25830 };
    return { unitPrice: 630, sqmPrice: 31500 };
  }

  return { unitPrice: 1000, sqmPrice: 0 };
}

console.log('Testing price resolver:');
items.slice(0, 15).forEach(it => {
  const p = getItemPricelist(it);
  console.log(it.name.padEnd(25), '|', it.category.padEnd(18), '|', (p.unitPrice + ' TZS').padStart(12));
});
