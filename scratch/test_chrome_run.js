const { execFile } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

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

server.listen(8088, '127.0.0.1', () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--enable-logging=stderr',
    '--v=1',
    '--dump-dom',
    'http://127.0.0.1:8088/index.html'
  ];
  execFile(chromePath, args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
    const lines = stderr.split('\n');
    const consoleLines = lines.filter(l => l.includes('CONSOLE') || l.includes('Uncaught') || l.includes('Error'));
    console.log('--- CONSOLE LOGS ---');
    consoleLines.slice(0, 20).forEach(l => console.log(l));
    if (stdout) {
      console.log('\n--- ROOT CONTENT ---');
      const idx = stdout.indexOf('id="root"');
      console.log(stdout.slice(idx, idx + 600));
    }
    server.close();
  });
});
