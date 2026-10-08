const fs = require('fs');
const { execFile } = require('child_process');

let html = fs.readFileSync('index.html', 'utf8');
const originalHtml = html;

// Temporarily auto-unlock in script tag for headless verification
html = html.replace(
  'localStorage.setItem("stumarcot_supabase_anon_key", DEFAULT_SB_KEY);',
  'localStorage.setItem("stumarcot_supabase_anon_key", DEFAULT_SB_KEY); sessionStorage.setItem("stumarcot_pin_unlocked", "true"); localStorage.setItem("stumarcot_staff_name", "Juma");'
);
fs.writeFileSync('index.html', html, 'utf8');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const args = [
  '--headless=new',
  '--disable-gpu',
  '--virtual-time-budget=6000',
  '--dump-dom',
  'http://127.0.0.1:8085/index.html'
];

execFile(chromePath, args, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
  // Restore original HTML immediately
  fs.writeFileSync('index.html', originalHtml, 'utf8');

  console.log('DOM length when unlocked:', stdout ? stdout.length : 0);
  if (stdout) {
    console.log('Contains Raw Materials button:', stdout.includes('Raw Materials'));
    console.log('Contains Finished Goods button:', stdout.includes('Finished Goods'));
    console.log('Contains Sales record button:', stdout.includes('Sales record'));
    
    // Find top card section in DOM
    const rawIdx = stdout.indexOf('Raw Materials');
    if (rawIdx !== -1) {
      console.log('\nTop card HTML snippet:');
      console.log(stdout.slice(rawIdx - 100, rawIdx + 600));
    }
  }
});
