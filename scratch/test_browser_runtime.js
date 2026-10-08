const fs = require('fs');
const vm = require('vm');

const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const sandbox = {
  window: {},
  document: {
    getElementById: (id) => ({ id, appendChild: () => {}, innerHTML: '', style: {} }),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      relList: { supports: () => true },
      setAttribute: () => {},
      style: {}
    }),
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
  navigator: { userAgent: 'Mozilla/5.0', serviceWorker: { register: () => Promise.resolve() } },
  location: { href: 'http://localhost:8085/', origin: 'http://localhost:8085' },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
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
  vm.runInContext(bundle, context);
  console.log('✓ Script executed successfully without runtime errors!');
} catch (err) {
  console.error('❌ RUNTIME ERROR DETECTED:');
  console.error(err.message);
  console.error(err.stack);
}
