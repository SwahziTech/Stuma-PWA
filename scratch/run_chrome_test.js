const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), reqPath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath);
    const ct = ext === '.html' ? 'text/html' : (ext === '.js' ? 'application/javascript' : 'text/css');
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});

server.listen(8085, '127.0.0.1', () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--enable-logging=stderr',
    '--v=1',
    '--virtual-time-budget=4000',
    '--dump-dom',
    'http://127.0.0.1:8085/index.html'
  ];
  execFile(chromePath, args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
    console.log('--- STDERR LOGS (Browser Console) ---');
    console.log(stderr);
    if (stdout) {
      console.log('--- ROOT CONTENT ---');
      const idx = stdout.indexOf('id="root"');
      console.log(stdout.slice(idx, idx + 500));
    }
    server.close();
  });
});
