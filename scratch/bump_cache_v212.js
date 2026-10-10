const fs = require('fs');
const timestamp = Date.now();
let sw = fs.readFileSync('service-worker.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = ['"][^'"]+['"];/, `const CACHE_NAME = 'stumarcot-pwa-v2.1.2-${timestamp}';`);
fs.writeFileSync('service-worker.js', sw, 'utf8');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/src="\.\/assets\/index-hgjhj-0G\.js\?v=\d+"/, `src="./assets/index-hgjhj-0G.js?v=${timestamp}"`);
fs.writeFileSync('index.html', html, 'utf8');
console.log('Bumped cache to v2.1.2-' + timestamp);
