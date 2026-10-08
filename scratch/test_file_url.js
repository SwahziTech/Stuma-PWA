const { execFile } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const args = [
  '--headless=new',
  '--disable-gpu',
  '--enable-logging=stderr',
  '--v=1',
  '--virtual-time-budget=4000',
  '--dump-dom',
  'file:///c:/Users/HPnew/Desktop/git-trial-stuma-PWA/index.html'
];
execFile(chromePath, args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
  console.log('--- STDERR LOGS ---');
  const lines = (stderr || '').split('\n').filter(l => l.includes('CONSOLE') || l.includes('Error') || l.includes('CORS') || l.includes('blocked') || l.includes('Failed'));
  console.log(lines.join('\n'));
  console.log('--- ROOT CONTENT ---');
  const idx = stdout ? stdout.indexOf('id="root"') : -1;
  console.log(stdout ? stdout.slice(idx, idx + 200) : 'NO STDOUT');
});
