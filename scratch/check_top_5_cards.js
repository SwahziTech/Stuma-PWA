const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const returnTarget = 'return o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"14px"},children:[';
const returnIdx = content.indexOf(returnTarget);
console.log('returnIdx:', returnIdx);

const targetStart = returnIdx + returnTarget.length;

// Find where the 3 tabs bar starts:
const tabsTarget = 'o.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"6px",background:"var(--bg-surface-elevated)"';
const tabsIdx = content.indexOf(tabsTarget, targetStart);
console.log('tabsIdx:', tabsIdx);

console.log('--- EXACT SLICE TO REMOVE ---');
console.log(content.slice(targetStart, tabsIdx));
console.log('--- END SLICE ---');
