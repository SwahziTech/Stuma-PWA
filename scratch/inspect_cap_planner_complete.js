const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const startIdx = content.indexOf('L==="capacity_planner"&&');
const rawIdx = content.indexOf('L==="raw_materials"&&', startIdx);
console.log('capacity_planner block length:', rawIdx - startIdx);
console.log(content.slice(startIdx, rawIdx));
