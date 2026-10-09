const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'extracted_supabase_context.js'), 'utf8');

// Find Wp.Provider and preceding code
const provIdx = content.indexOf('const Wp=B.createContext(null)');
console.log(content.substring(provIdx, provIdx + 6000));
