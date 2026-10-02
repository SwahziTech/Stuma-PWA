const fs = require('fs');
const bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');

const pos = bundle.indexOf('x1=({onNavigate');
const sub = bundle.substring(pos, pos + 25000);
let mPos = 0;
while ((mPos = sub.indexOf('ne(', mPos)) !== -1) {
  console.log('ne( at', mPos);
  console.log(sub.substring(mPos - 50, mPos + 150));
  mPos += 3;
}

let hPos = 0;
while ((hPos = sub.indexOf('H', hPos)) !== -1) {
  if (sub[hPos+1] === '?' || sub[hPos+1] === '&' || sub[hPos-1] === '(' || sub[hPos+1] === ' ') {
    console.log('H around:', sub.substring(Math.max(0, hPos - 30), Math.min(sub.length, hPos + 100)));
  }
  hPos += 1;
}
