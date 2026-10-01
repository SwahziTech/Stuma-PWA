const fs = require('fs');

const sharedXml = fs.readFileSync('scratch/xlsx_unpacked/xl/sharedStrings.xml', 'utf8');
const strings = [];
const matches = sharedXml.matchAll(/<si>(.*?)<\/si>/gs);
for (const m of matches) {
  const tMatches = m[1].matchAll(/<t[^>]*>(.*?)<\/t>/gs);
  let text = '';
  for (const tm of tMatches) text += tm[1];
  strings.push(text);
}

function parseSheet(filename) {
  const xml = fs.readFileSync('scratch/xlsx_unpacked/xl/worksheets/' + filename, 'utf8');
  const rows = [];
  const rowRegex = /<row[^>]*r="(\d+)"[^>]*>(.*?)<\/row>/gs;
  let rm;
  while ((rm = rowRegex.exec(xml)) !== null) {
    const rowNum = rm[1];
    const cells = {};
    const cellRegex = /<c[^>]*r="([A-Z]+)\d+"([^>]*)>(.*?)<\/c>/gs;
    let cm;
    while ((cm = cellRegex.exec(rm[2])) !== null) {
      const col = cm[1];
      const attrs = cm[2];
      const inner = cm[3];
      const isString = attrs.includes('t="s"');
      const valMatch = inner.match(/<v>(.*?)<\/v>/);
      const val = valMatch ? valMatch[1] : '';
      if (isString) cells[col] = strings[parseInt(val, 10)] || '';
      else cells[col] = val;
    }
    rows.push({ row: rowNum, cells });
  }
  return rows;
}

const priceMap = {};

['sheet1.xml', 'sheet2.xml', 'sheet3.xml'].forEach(sh => {
  const rows = parseSheet(sh);
  let currentCategory = '';
  rows.forEach(r => {
    if (r.cells.A && !r.cells.B && isNaN(Number(r.cells.A))) {
      currentCategory = r.cells.A;
    }
    if (r.cells.B && (r.cells.G || r.cells.E)) {
      const name = r.cells.B.trim();
      const unitPrice = Number(r.cells.G) || Number(r.cells.E) || 0;
      const sqmPrice = Number(r.cells.H) || 0;
      const pcsPerSqm = Number(r.cells.D) || null;
      priceMap[name.toLowerCase()] = {
        name,
        category: currentCategory,
        unitPrice: Math.round(unitPrice),
        sqmPrice: Math.round(sqmPrice),
        pcsPerSqm,
        size: r.cells.C || ''
      };
    }
  });
});

console.log('Extracted prices count:', Object.keys(priceMap).length);
console.log(JSON.stringify(priceMap, null, 2));

fs.writeFileSync('scratch/pricelist_dump.json', JSON.stringify(priceMap, null, 2));
