const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'extracted_supabase_context.js'), 'utf8');

// Find where G is defined and print until the context value object
const gIdx = content.indexOf('G=B.useCallback(async V=>{var ke;');
console.log(content.substring(gIdx, gIdx + 12000));
