const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.git') continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      searchDir(full);
    } else {
      if (f.endsWith('.js') || f.endsWith('.sql') || f.endsWith('.json') || f.endsWith('.md')) {
        const content = fs.readFileSync(full, 'utf8');
        const matches = content.match(/raw[_\s\-]?material[s]?|material[s]?[_\s\-]?master/gi);
        if (matches) {
          console.log(`Found in ${full}:`, matches.slice(0, 5));
        }
      }
    }
  }
}

searchDir('.');
