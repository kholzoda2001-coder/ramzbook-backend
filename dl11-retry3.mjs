import fs from 'fs';
import https from 'https';

const urls = fs.readFileSync('prisma/_de-images-urls.tsv', 'utf8').trim().split('\n').map(l => l.split('\t'));
const OUT = '../frontend/public/images/de';

async function download() {
  for (const [name, url] of urls) {
    if (!name) continue;
    const path = `${OUT}/${name}.png`;
    if (fs.existsSync(path) && fs.statSync(path).size > 100) {
      console.log(`Skipping ${name}, already exists`);
      continue;
    }
    
    let attempts = 0;
    let success = false;
    
    while (!success && attempts < 10) {
      attempts++;
      console.log(`Downloading ${name} (attempt ${attempts})...`);
      
      const seedVal = Date.now() % 100000;
      const bypassUrl = url.replace(/seed=\d+/, `seed=${seedVal}`);
      
      await new Promise(resolve => {
        https.get(bypassUrl, res => {
          if (res.statusCode !== 200) {
            console.error(`Failed ${name}: ${res.statusCode}`);
            resolve();
            return;
          }
          const file = fs.createWriteStream(path);
          res.pipe(file);
          file.on('finish', () => { 
            file.close(); 
            success = true;
            resolve(); 
          });
        }).on('error', err => {
          console.error(`Error ${name}: ${err.message}`);
          resolve();
        });
      });
      // Wait 5s between retries to avoid rate limits
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

download().then(() => console.log('Done!'));
