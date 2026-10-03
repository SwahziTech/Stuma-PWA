const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Idx = bundle.indexOf('function x1(');
const x1End = bundle.indexOf('function y1(', x1Idx);
const x1Code = bundle.slice(x1Idx, x1End > 0 ? x1End : x1Idx + 40000);

const icons = ['Kp', 'Gp', 'Cc', 'bx', 'pn', 'vr', 'pp', '$a', 'ii', 'Ua', 'lt'];
icons.forEach(name => {
  console.log(name, 'in x1:', x1Code.includes(name), 'in bundle:', bundle.includes(name));
});
