const https = require('https');

https.get('https://admin.ramz.tj/api/books', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const books = JSON.parse(data);
    const recent = books.slice(0, 3).map(b => ({
      title: b.title,
      coverUrl: b.coverUrl
    }));
    console.log(JSON.stringify(recent, null, 2));
  });
});
