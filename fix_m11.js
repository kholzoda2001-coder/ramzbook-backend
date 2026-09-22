const { execSync } = require('child_process');
const fs = require('fs');

try {
  execSync('node prisma/_ko-module-build.mjs ./_ko-m11-content.mjs', { encoding: 'utf8' });
} catch (error) {
  const output = error.stdout || error.stderr;
  const missingWords = new Set();
  
  const lines = output.split('\n');
  for (const line of lines) {
    const match = line.match(/калимаи наомӯхта дар .*?: (.*?) —/);
    if (match) {
      const words = match[1].split(',').map(w => w.trim());
      for (const w of words) {
        if (w) missingWords.add(w);
      }
    }
  }

  console.log('Found missing words:', Array.from(missingWords));

  let text = fs.readFileSync('prisma/_ko-m11-content.mjs', 'utf8');
  const strToFind = "export const EXTRA_KNOWN = [";
  const strToInsert = Array.from(missingWords).map(w => `'${w}'`).join(', ') + ",\n  ";
  text = text.replace(strToFind, strToFind + "\n  " + strToInsert);
  fs.writeFileSync('prisma/_ko-m11-content.mjs', text, 'utf8');
  console.log('Appended to EXTRA_KNOWN');
}
