import fs from 'fs';
import https from 'https';

const urls = fs.readFileSync('prisma/_de-images-urls.tsv', 'utf8').trim().split('\n').map(l => l.split('\t'));
const OUT = '../frontend/public/images/de';

async function download() {
  for (const [name, url] of urls) {
    if (!name) continue;
    const path = `${OUT}/${name}.png`;
    if (fs.existsSync(path)) {
      console.log(`Skipping ${name}, already exists`);
      continue;
    }
    console.log(`Downloading ${name}...`);
    
    await new Promise(resolve => {
      https.get(url, res => {
        if (res.statusCode !== 200) {
          console.error(`Failed ${name}: ${res.statusCode}`);
          resolve();
          return;
        }
        const file = fs.createWriteStream(path);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      });
    });
    // Wait 1.5s between downloads to avoid rate limits
    await new Promise(r => setTimeout(r, 1500));
  }
}

download().then(() => console.log('Done!'));
