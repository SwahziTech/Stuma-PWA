const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const slice1 = code.substring(406000, 432000);
fs.writeFileSync(path.join(__dirname, 'extracted_supabase_context.js'), slice1, 'utf8');
console.log('Wrote slice 406000-432000 to scratch/extracted_supabase_context.js, size:', slice1.length);
