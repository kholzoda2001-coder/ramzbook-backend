const fs = require('fs');
const https = require('https');
const FormData = require('form-data');

const form = new FormData();
// Create a fake 1x1 png image
const fakeImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
form.append('file', fakeImage, { filename: 'test.png', contentType: 'image/png' });

const options = {
  hostname: 'admin.ramz.tj',
  path: '/api/admin/upload',
  method: 'POST',
  headers: form.getHeaders(),
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    console.log('Response body:', body);
  });
});

form.pipe(req);
