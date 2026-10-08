const { execFile } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const args = [
  '--headless=new',
  '--disable-gpu',
  '--enable-logging=stderr',
  '--v=1',
  '--virtual-time-budget=5000',
  'http://127.0.0.1:8085/index.html'
];

execFile(chromePath, args, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
  const lines = (stderr || '').split('\n');
  const interesting = lines.filter(l => 
    l.includes('CONSOLE') || 
    l.includes('Error') || 
    l.includes('error') || 
    l.includes('Uncaught') ||
    l.includes('PWA') ||
    l.includes('STUMARCOT')
  );
  console.log('Interesting lines (' + interesting.length + '):');
  console.log(interesting.slice(0, 50).join('\n'));
});
