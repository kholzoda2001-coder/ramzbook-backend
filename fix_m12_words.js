const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const targetFile = path.join(__dirname, 'prisma', '_ko-m12-content.mjs');
let content = fs.readFileSync(targetFile, 'utf8');

try {
  execSync('node prisma/_ko-module-build.mjs ./_ko-m12-content.mjs', { encoding: 'utf8' });
} catch (e) {
  const output = e.stdout || e.stderr || e.message;
  console.log('Got build error, extracting words...');
  
  const missingWords = new Set();
  const regex = /калимаи наомӯхта дар[^:]+:\s*([^\—]+)\s*\—/g;
  let match;
  while ((match = regex.exec(output)) !== null) {
    const words = match[1].split(',').map(w => w.trim()).filter(Boolean);
    for (const w of words) {
      if (w.trim()) {
        missingWords.add(w.trim());
      }
    }
  }

  if (missingWords.size > 0) {
    const wordsArray = Array.from(missingWords).map(w => `'${w}'`).join(', ');
    console.log('Missing words:', wordsArray);
    
    // Append to EXTRA_KNOWN
    const marker = 'export const EXTRA_KNOWN = [';
    if (content.includes(marker)) {
      content = content.replace(marker, marker + '\n  ' + wordsArray + ',');
      fs.writeFileSync(targetFile, content, 'utf8');
      console.log('Appended to EXTRA_KNOWN!');
    }
  } else {
    console.log('No missing words found in output.');
  }
}
