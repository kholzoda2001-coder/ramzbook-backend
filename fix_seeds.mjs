import fs from 'fs';

const fails = ['das_krankenhaus', 'die_post', 'die_stadt', 'die_u-bahn'];
let urls = fs.readFileSync('prisma/all-images.tsv', 'utf8');

for (const name of fails) {
  // modify seed slightly
  const regex = new RegExp(`${name}\\t.*seed=(\\d+)`, 'g');
  urls = urls.replace(regex, (match, seed) => match.replace(`seed=${seed}`, `seed=${parseInt(seed) + 50}`));
}

fs.writeFileSync('prisma/all-images.tsv', urls);
