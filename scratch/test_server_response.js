const http = require('http');

http.get('http://127.0.0.1:8085/index.html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    const match = data.match(/src="([^"]+)"/);
    console.log('Script tag in index.html:', match ? match[1] : 'not found');
  });
});
