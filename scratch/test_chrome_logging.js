const { execFile } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const args = [
  '--headless=new',
  '--disable-gpu',
  '--enable-logging=stderr',
  '--v=1',
  '--virtual-time-budget=5000',
  '--dump-dom',
  'http://127.0.0.1:8085/index.html'
];

execFile(chromePath, args, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
  console.log('Stderr from chrome:');
  console.log(stderr);
});
