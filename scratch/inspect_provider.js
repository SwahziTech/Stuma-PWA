const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const providerPos = bundle.indexOf('Wp.Provider');
console.log('Wp.Provider pos:', providerPos);
if (providerPos !== -1) {
  console.log(bundle.slice(providerPos - 1200, providerPos + 300));
}
