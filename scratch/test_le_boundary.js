const fs = require('fs');

const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
const oldLeStart = bundle.indexOf('le=B.useCallback(async(V,J,ie)=>{if(J<=0)return!1;');
const oldHeEnd = bundle.indexOf('Pe=B.useCallback(()=>{k(Fl),L([]),localStorage.removeItem(Xl),localStorage.removeItem(Zl)},[])');

console.log('oldLeStart:', oldLeStart);
console.log('oldHeEnd:', oldHeEnd);
console.log('Starts with:', bundle.substring(oldLeStart, oldLeStart + 30));
console.log('Ends with:', bundle.substring(oldHeEnd - 30, oldHeEnd));
console.log('Followed by:', bundle.substring(oldHeEnd, oldHeEnd + 30));
