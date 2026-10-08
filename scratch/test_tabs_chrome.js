const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

// We want to test rendering each tab: "dashboard", "production", "sales", "items", "history", "opening_balance"
const tabsToTest = ["dashboard", "sales", "history", "opening_balance"];

async function runTest() {
  for (const tab of tabsToTest) {
    let html = fs.readFileSync('index.html', 'utf8');
    const originalHtml = html;

    // Set initial tab in C1 component or in localStorage
    // In C1: [t, r] = B.useState("dashboard")
    // Let's modify index.html to prefill the tab
    let bundle = fs.readFileSync('assets/index-hgjhj-0G.js', 'utf8');
    const origBundle = bundle;

    bundle = bundle.replace('[t,r]=B.useState("dashboard")', `[t,r]=B.useState("${tab}")`);
    fs.writeFileSync('assets/index-hgjhj-0G.js', bundle, 'utf8');

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

    await new Promise((resolve) => {
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
          fs.writeFileSync('assets/index-hgjhj-0G.js', origBundle, 'utf8');
          server.close();
          console.log(`\n=== TAB: ${tab} ===`);
          console.log('DOM length:', stdout ? stdout.length : 0);
          if (stdout && stdout.length > 500) {
            const rootIdx = stdout.indexOf('id="root"');
            console.log('Snippet:', stdout.slice(rootIdx, rootIdx + 400).replace(/\s+/g, ' '));
          } else {
            console.error('❌ TAB IS BLANK OR FAILED TO RENDER!');
            console.error('Stderr:', stderr.slice(-1000));
          }
          resolve();
        });
      });
    });
  }
}

runTest();
