const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

// Find where rawMaterials is initialized
const pos = 416590;
console.log(bundle.substring(pos - 4000, pos + 500));
