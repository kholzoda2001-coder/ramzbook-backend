import fs from 'fs';
import { execFileSync } from 'child_process';
import { neon } from '@neondatabase/serverless';
import https from 'https';

const env = Object.fromEntries(
  fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);

const REPO = `${process.env.TEMP}/ramz-audio-img-en`.replace(/\\/g, '/');

const words = ["Goodbye","Bye","Yes","No","Hi","Please","Sorry","You're welcome","OK","I","You","My","Name","Is","What","Your","Who","Question","Man","Woman","Friend","Boy","Girl","Good afternoon","Good evening","Good night"];
const key = w => w.toLowerCase().trim().replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/['’.,!?]/g, '').replace(/\s+/g, '_');

const STYLE = "A cute 3D Pixar style illustration of a scene representing the word: 'WORD', bright and colorful, white background, high quality, no text";
const SCENES = {
  "goodbye": "someone waving goodbye",
  "bye": "someone waving bye",
  "yes": "someone nodding yes happily",
  "no": "someone shaking head no",
  "hi": "someone waving hi",
  "please": "someone asking politely with hands together",
  "sorry": "someone looking apologetic",
  "you're welcome": "someone welcoming with open arms",
  "ok": "someone giving an OK sign",
  "i": "a person pointing to themselves",
  "you": "a person pointing to someone else",
  "my": "a person hugging their own toy",
  "name": "a name tag on a shirt",
  "is": "an equal sign in 3d",
  "what": "someone looking confused with a question mark",
  "your": "someone handing something to another person",
  "who": "someone looking through a magnifying glass",
  "question": "a glowing 3d question mark",
  "man": "a cute 3d pixar man",
  "woman": "a cute 3d pixar woman",
  "friend": "two friends hugging",
  "boy": "a cute 3d pixar boy",
  "girl": "a cute 3d pixar girl",
  "good afternoon": "bright sunny afternoon scene",
  "good evening": "evening scene with sunset",
  "good night": "sleeping in bed with moon outside"
};

const download = (url, path) => new Promise((resolve, reject) => {
  https.get(url, res => {
    if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
    const file = fs.createWriteStream(path);
    res.pipe(file);
    file.on('finish', () => { file.close(); resolve(); });
  }).on('error', reject);
});

async function run() {
  const git = a => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
  fs.mkdirSync(`${REPO}/images/en`, { recursive: true });

  let done = 0;
  for (const w of words) {
    const k = key(w);
    if (fs.existsSync(`${REPO}/images/en/${k}.jpg`) || fs.existsSync(`${REPO}/images/en/${k}.png`)) continue;
    const prompt = STYLE.replace('WORD', SCENES[w.toLowerCase()] || w);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux`;
    console.log(`Downloading ${k}...`);
    try {
      await download(url, `${REPO}/images/en/${k}.jpg`);
      done++;
    } catch(e) {
      console.error(`Failed ${w}: ${e.message}`);
    }
  }

  if (done > 0) {
    git(['add', 'images/en/*.jpg']);
    if (git(['status', '--porcelain']).trim()) {
      git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-q', '-m', `en: add pixar images for M1 (${done})`]);
      git(['push', '-q', 'origin', 'HEAD:main']);
      console.log(`pushed ${done} images to github`);
    }
  } else {
    console.log('No new images to push');
  }
}
run();
