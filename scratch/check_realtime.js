const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-hgjhj-0G.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const regexChannel = /\.channel\s*\(/g;
const regexSubscribe = /\.subscribe\s*\(/g;
const regexOn = /\.on\s*\(\s*['"`]postgres_changes['"`]/g;

console.log('.channel calls:', (code.match(regexChannel) || []).length);
console.log('.subscribe calls:', (code.match(regexSubscribe) || []).length);
console.log('.on("postgres_changes") calls:', (code.match(regexOn) || []).length);
