const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'extracted_supabase_context.js'), 'utf8');

// Find where Wp (context) is defined and where the Provider component is defined
const wpIdx = content.indexOf('const Wp=B.createContext(null)');
if (wpIdx !== -1) {
  console.log(content.substring(wpIdx, wpIdx + 15000));
}
