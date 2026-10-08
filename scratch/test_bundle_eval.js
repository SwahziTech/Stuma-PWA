const fs = require('fs');
const vm = require('vm');

const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const sandbox = {
  window: {},
  document: {
    getElementById: (id) => ({ id, appendChild: () => {}, innerHTML: '', style: {} }),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ setAttribute: () => {}, style: {} }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    addEventListener: () => {}
  },
  MutationObserver: class {
    observe() {}
    disconnect() {}
  },
  localStorage: {
    getItem: (key) => null,
    setItem: () => {},
    removeItem: () => {}
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  navigator: { userAgent: 'Mozilla/5.0' },
  location: { href: 'http://localhost:8085/', origin: 'http://localhost:8085' },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }),
  Date: Date,
  Math: Math,
  JSON: JSON,
  Object: Object,
  Array: Array,
  String: String,
  Number: Number,
  Boolean: Boolean,
  RegExp: RegExp,
  Error: Error,
  parseInt: parseInt,
  parseFloat: parseFloat,
  isNaN: isNaN
};
sandbox.window = sandbox;
sandbox.global = sandbox;
sandbox.self = sandbox;

try {
  const context = vm.createContext(sandbox);
  const renderCall = 'ig.createRoot(document.getElementById("root")).render(o.jsx(Xm.StrictMode,{children:o.jsx(j1,{})}));';
  const bundleWithoutRender = bundle.replace(renderCall, 'global._loaded = true;');
  
  vm.runInContext(bundleWithoutRender, context);
  console.log('✓ Bundle parsed and loaded all component definitions without errors!');
} catch (err) {
  console.error('❌ ERROR WHEN LOADING COMPONENT DEFINITIONS:');
  console.error(err);
}
