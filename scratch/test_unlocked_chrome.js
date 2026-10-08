const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

let html = fs.readFileSync('index.html', 'utf8');
const originalHtml = html;

html = html.replace(
  'localStorage.setItem("stumarcot_supabase_anon_key", DEFAULT_SB_KEY);',
  'localStorage.setItem("stumarcot_supabase_anon_key", DEFAULT_SB_KEY); sessionStorage.setItem("stumarcot_pin_unlocked", "true"); localStorage.setItem("stumarcot_staff_name", "Juma");'
);
fs.writeFileSync('index.html', html, 'utf8');

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
    '--virtual-time-budget=6000',
    '--dump-dom',
    'http://127.0.0.1:8085/index.html'
  ];
  execFile(chromePath, args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
    fs.writeFileSync('index.html', originalHtml, 'utf8');
    server.close();
    console.log('DOM length:', stdout ? stdout.length : 0);
    const rootIdx = stdout ? stdout.indexOf('id="root"') : -1;
    if (rootIdx !== -1) {
      console.log('ROOT DOM SNIPPET:');
      console.log(stdout.slice(rootIdx, rootIdx + 1200));
    }
  });
});
