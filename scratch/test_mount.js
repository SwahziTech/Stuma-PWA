const fs = require('fs');
const vm = require('vm');

const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const rootEl = {
  nodeType: 1,
  id: 'root',
  ownerDocument: null,
  appendChild: () => {},
  removeChild: () => {},
  insertBefore: () => {},
  replaceChild: () => {},
  setAttribute: () => {},
  removeAttribute: () => {},
  getAttribute: () => null,
  style: {},
  childNodes: [],
  addEventListener: () => {},
  removeEventListener: () => {}
};
rootEl.ownerDocument = {
  createElement: (tag) => ({
    nodeType: 1,
    tagName: tag.toUpperCase(),
    ownerDocument: rootEl.ownerDocument,
    style: {},
    setAttribute: () => {},
    removeAttribute: () => {},
    getAttribute: () => null,
    appendChild: () => {},
    removeChild: () => {},
    insertBefore: () => {},
    childNodes: [],
    addEventListener: () => {},
    removeEventListener: () => {}
  }),
  createTextNode: (text) => ({ nodeType: 3, nodeValue: text, textContent: text }),
  createComment: () => ({ nodeType: 8 })
};

const sandbox = {
  window: {},
  document: {
    nodeType: 9,
    getElementById: (id) => id === 'root' ? rootEl : null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: rootEl.ownerDocument.createElement,
    createTextNode: rootEl.ownerDocument.createTextNode,
    createComment: rootEl.ownerDocument.createComment,
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  MutationObserver: class {
    observe() {}
    disconnect() {}
  },
  localStorage: {
    getItem: (key) => 'true', // unlocked
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
  vm.runInContext(bundle, context);
  console.log('✓ Script mounted and ran without errors!');
} catch (err) {
  console.error('❌ RUNTIME ERROR DETECTED:');
  console.error(err.message);
  console.error(err.stack);
}
