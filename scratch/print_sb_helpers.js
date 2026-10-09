const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'extracted_supabase_context.js'), 'utf8');

// Let's print the functions jv, bc, Pv, Tv, Ht, Ev, Rv, Nv, op, Av, Iv, Ov
// and the React Context Provider that surrounds them!
const fns = ['jv', 'bc', 'Pv', 'Tv', 'Ht', 'Ev', 'Rv', 'Nv', 'op', 'Av', 'Iv', 'Ov'];
for (const fn of fns) {
  const re = new RegExp('(function\\s+' + fn + '\\b[\\s\\S]*?)(?=function\\s+[a-zA-Z0-9_$]+\\b|const\\s+Wp\\b)', 'g');
  const m = re.exec(content);
  if (m) {
    console.log(`\n=================== ${fn} ===================`);
    console.log(m[1].substring(0, 1000));
  }
}
