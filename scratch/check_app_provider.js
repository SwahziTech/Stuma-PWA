const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const leIdx = content.indexOf('le=B.useCallback(async(V,J,ie,priceVal');
console.log('--- le code: ---');
console.log(content.slice(leIdx, leIdx + 1500));

const provIdx = content.indexOf('return o.jsx(Wp.Provider,{value:{');
console.log('--- Provider export code: ---');
console.log(content.slice(provIdx, provIdx + 600));
