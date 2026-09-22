import fs from 'fs';
import path from 'path';

const outDir = 'c:/Users/ASUS1/Desktop/ramz-audio/images/de';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const lines = fs.readFileSync('prisma/all-images.tsv', 'utf8').split('\n');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  let ok = 0, fail = 0, skip = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const [key, url] = line.split('\t');
    const f = path.join(outDir, key + '.png');
    
    if (fs.existsSync(f) && fs.statSync(f).size > 0) {
      console.log(`[${i+1}/${lines.length}] ${key} — аллакай ҳаст`);
      skip++;
      continue;
    }

    try {
      console.log(`[${i+1}/${lines.length}] ${key} — боргирӣ мешавад...`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      const sz = buf.byteLength;
      
      if (sz < 20000) {
        console.log(`[${i+1}/${lines.length}] ${key} — ҷавоби хеле хурд (${sz} b)`);
        fail++;
      } else {
        fs.writeFileSync(f, Buffer.from(buf));
        console.log(`[${i+1}/${lines.length}] ${key} — ${sz} b`);
        ok++;
      }
    } catch (err) {
      console.log(`[${i+1}/${lines.length}] ${key} — НОКОМ: ${err.message}`);
      fail++;
    }
    await delay(3000); // 3 seconds delay between requests
  }
  console.log(`\nтайёр: ${ok} · буд: ${skip} · ноком: ${fail}`);
}
run();
