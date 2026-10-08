const { execFile } = require('child_process');

// We can launch Chrome with --headless=new and execute a script to unlock and inspect the rendered dashboard DOM!
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const script = `
  sessionStorage.setItem('stumarcot_pin_unlocked', 'true');
  localStorage.setItem('stumarcot_staff_name', 'Juma');
`;

const args = [
  '--headless=new',
  '--disable-gpu',
  '--virtual-time-budget=6000',
  '--dump-dom',
  'http://127.0.0.1:8085/index.html'
];

execFile(chromePath, args, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
  console.log('DOM length:', stdout ? stdout.length : 0);
  if (stdout) {
    console.log('Contains Raw Materials button:', stdout.includes('Raw Materials'));
    console.log('Contains Finished Goods button:', stdout.includes('Finished Goods'));
    console.log('Contains Sales record button:', stdout.includes('Sales record'));
    console.log('Contains Production Capacity Planner:', stdout.includes('Capacity Planner'));
  }
});
