const fs = require('fs');
const http = require('http');
const path = require('path');
const { execFile } = require('child_process');

let html = fs.readFileSync('index.html', 'utf8');
const originalHtml = html;

// Temporarily auto-unlock in script tag for headless verification
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

server.listen(8089, '127.0.0.1', () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--virtual-time-budget=6000',
    '--dump-dom',
    'http://127.0.0.1:8089/index.html'
  ];

  execFile(chromePath, args, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
    // Restore original HTML immediately
    fs.writeFileSync('index.html', originalHtml, 'utf8');
    server.close();

    console.log('DOM length when unlocked:', stdout ? stdout.length : 0);
    if (stdout) {
      console.log('Contains app-layout:', stdout.includes('app-layout'));
      console.log('Contains main-content:', stdout.includes('main-content'));
      console.log('Contains Batch Production Logging or Capacity Planner:', stdout.includes('Batch Production') || stdout.includes('Capacity Planner'));
      console.log('Contains Cement bags input:', stdout.includes('Cement bags'));
      console.log('Contains Select Product:', stdout.includes('Select Product'));
      console.log('Contains Daily Productions:', stdout.includes('Daily Production'));
    }
  });
});
