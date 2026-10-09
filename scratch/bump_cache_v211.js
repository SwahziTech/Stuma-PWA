const fs = require('fs');
const path = require('path');

const now = Date.now();
const newCache = 'stumarcot-pwa-v2.1.1-' + now;

const swPath = path.join(__dirname, '..', 'service-worker.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/const CACHE_NAME = '[^']+';/, "const CACHE_NAME = '" + newCache + "';");
fs.writeFileSync(swPath, sw, 'utf8');

const indexPath = path.join(__dirname, '..', 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
indexHtml = indexHtml.replace(/index-hgjhj-0G\.js\?v=\d+/, 'index-hgjhj-0G.js?v=' + now);
fs.writeFileSync(indexPath, indexHtml, 'utf8');

console.log('✅ Successfully bumped cache to:', newCache);
