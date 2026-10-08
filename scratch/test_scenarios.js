const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

let html = fs.readFileSync('index.html', 'utf8');
const originalHtml = html;

// Simulate having localStorage / sessionStorage
const testScenarios = [
  { name: 'Fresh Visitor (no storage)', script: '' },
  { name: 'PIN unlocked with staff name', script: 'sessionStorage.setItem("stumarcot_pin_unlocked", "true"); localStorage.setItem("stumarcot_staff_name", "Supervisor");' },
  { name: 'PIN unlocked without staff name', script: 'sessionStorage.setItem("stumarcot_pin_unlocked", "true"); localStorage.removeItem("stumarcot_staff_name");' },
  { name: 'Admin settings present', script: 'sessionStorage.setItem("stumarcot_pin_unlocked", "true"); localStorage.setItem("stumarcot_staff_name", "Supervisor"); localStorage.setItem("stumarcot_admin_settings", JSON.stringify({appPin:"1234"}));' }
];

async function run() {
  for (const scen of testScenarios) {
    let modifiedHtml = originalHtml.replace(
      'localStorage.setItem("stumarcot_supabase_anon_key", DEFAULT_SB_KEY);',
      'localStorage.setItem("stumarcot_supabase_anon_key", DEFAULT_SB_KEY); ' + scen.script
    );
    fs.writeFileSync('index.html', modifiedHtml, 'utf8');

    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
      const filePath = path.join(process.cwd(), reqPath);
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        const ext = path.extname(filePath);
        const ct = ext === '.html' ? 'text/html' : (ext === '.js' ? 'application/javascript' : 'text/css');
        res.writeHead(200, { 'Content-Type': ct, 'Access-Control-Allow-Origin': '*' });
        res.end(data);
      });
    });

    await new Promise(resolve => {
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
          server.close();
          const errs = (stderr || '').split('\n').filter(l => l.includes('Uncaught') || l.includes('TypeError') || l.includes('ReferenceError'));
          console.log(`Scenario [${scen.name}]: DOM length = ${stdout ? stdout.length : 0}, Errors = ${errs.length}`);
          if (errs.length > 0) {
            console.log('Errors:', errs);
          }
          resolve();
        });
      });
    });
  }
  fs.writeFileSync('index.html', originalHtml, 'utf8');
}

run();
