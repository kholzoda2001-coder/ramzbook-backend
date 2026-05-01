const fs = require('fs');
const path = require('path');

const fonts = {
  'Roboto-Regular.ttf': 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
  'Roboto-Bold.ttf': 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf'
};

const dir = path.join(__dirname, 'public', 'fonts');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function download() {
  for (const [name, url] of Object.entries(fonts)) {
    console.log(`Downloading ${name}...`);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(path.join(dir, name), Buffer.from(buffer));
      console.log(`Saved ${name}`);
    } catch (e) {
      console.error(`Error downloading ${name}:`, e.message);
    }
  }
}
download();
