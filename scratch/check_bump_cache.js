const fs = require('fs');
if (fs.existsSync('scratch/bump_cache.js')) {
  console.log(fs.readFileSync('scratch/bump_cache.js', 'utf8'));
}
