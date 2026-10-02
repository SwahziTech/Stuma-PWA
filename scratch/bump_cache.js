const fs = require('fs');
const now = Date.now();

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/src="\.\/assets\/index-hgjhj-0G\.js[^"]*"/, 'src="./assets/index-hgjhj-0G.js?v=' + now + '"');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Updated index.html with ?v=' + now);

// 2. Update service-worker.js
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = ['"][^'"]+['"]/, "const CACHE_NAME = 'stumarcot-pwa-v2.0.0-" + now + "'");
fs.writeFileSync('service-worker.js', sw, 'utf8');
console.log('Updated service-worker.js with CACHE_NAME: stumarcot-pwa-v2.0.0-' + now);

// Also fix scratch/apply_vertical_list_baseline.js so it never regresses if run again
let script = fs.readFileSync('scratch/apply_vertical_list_baseline.js', 'utf8');
script = script.replace('  });\n};\n`;', '  });\n},\n`;');
fs.writeFileSync('scratch/apply_vertical_list_baseline.js', script, 'utf8');
console.log('Fixed apply_vertical_list_baseline.js trailing comma');
