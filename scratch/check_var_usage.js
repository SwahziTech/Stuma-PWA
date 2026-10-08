const fs = require('fs');
const content = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const x1Idx = content.indexOf('x1=');
const _1Idx = content.indexOf('_1=');
const x1Code = content.slice(x1Idx, _1Idx);

function countVarInX1(varName) {
  const matches = [...x1Code.matchAll(new RegExp('\\b' + varName + '\\b', 'g'))];
  console.log(`Occurrences of ${varName} in x1:`, matches.length);
}

countVarInX1('M');
countVarInX1('ee');
countVarInX1('le');
countVarInX1('he');
countVarInX1('P');
