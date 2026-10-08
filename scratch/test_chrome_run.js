const { execFile } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const args = [
  '--headless=new',
  '--disable-gpu',
  '--virtual-time-budget=5000',
  '--dump-dom',
  'http://127.0.0.1:8085/index.html'
];

execFile(chromePath, args, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
  if (error) {
    console.error('Chrome execution error:', error);
  }
  if (stderr) {
    console.error('Chrome stderr:', stderr);
  }
  console.log('DOM output length:', stdout ? stdout.length : 0);
  if (stdout) {
    const rootIdx = stdout.indexOf('id="root"');
    if (rootIdx !== -1) {
      console.log('Root content in DOM:');
      console.log(stdout.slice(rootIdx, rootIdx + 1500));
    }
  }
});
