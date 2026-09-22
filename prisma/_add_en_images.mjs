import fs, { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);

const REPO = `${process.env.TEMP}/ramz-audio-img-en`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';

// Get the files from artifacts
const artDir = 'C:/Users/ASUS1/.gemini/antigravity/brain/370e3240-486d-4799-bf9f-b78752389f4f';
const files = fs.readdirSync(artDir);
const helloFile = files.find(f => f.startsWith('en_hello_'));
const morningFile = files.find(f => f.startsWith('en_good_morning_'));
const thankFile = files.find(f => f.startsWith('en_thank_you_'));

const git = a => execFileSync('git', a, { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26 }).trim();
if (!existsSync(`${REPO}/.git/HEAD`)) {
  console.log(`Cloning ${REPO}...`);
  execFileSync('git', ['clone', '--depth', '1', 'https://github.com/kholzoda2001-coder/ramz-audio.git', REPO], { stdio: 'inherit' });
} else {
  git(['fetch', '--depth', '1', 'origin', 'main']);
  git(['reset', '--hard', 'origin/main']);
}

mkdirSync(`${REPO}/images/en`, { recursive: true });

copyFileSync(`${artDir}/${helloFile}`, `${REPO}/images/en/hello.jpg`);
copyFileSync(`${artDir}/${morningFile}`, `${REPO}/images/en/good_morning.jpg`);
copyFileSync(`${artDir}/${thankFile}`, `${REPO}/images/en/thank_you.jpg`);

git(['add', 'images/en/hello.jpg', 'images/en/good_morning.jpg', 'images/en/thank_you.jpg']);
if (git(['status', '--porcelain']).trim()) {
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-q', '-m', `en: add 3D Pixar images for Hello, Good morning, Thank you`]);
  git(['push', '-q', 'origin', 'HEAD:main']);
  console.log('pushed to github');
}
const sha = git(['rev-parse', 'HEAD']);

// update db
const words = {
  'Hello': 'hello.jpg',
  'Good morning': 'good_morning.jpg',
  'Thank you': 'thank_you.jpg'
};

const [{id: EN}] = await sql`SELECT id FROM "Language" WHERE code='en'`;
for (const [w, f] of Object.entries(words)) {
  const url = `${CDN}@${sha}/images/en/${f}`;
  await sql`
    UPDATE "Word" w SET "imageUrl" = ${url}
    FROM "Lesson" l, "Module" m, "Course" c
    WHERE w."lessonId" = l.id AND l."moduleId" = m.id AND m."courseId" = c.id
    AND c."targetLanguageId" = ${EN} AND w.word = ${w}
  `;
}
console.log('done updating db');
