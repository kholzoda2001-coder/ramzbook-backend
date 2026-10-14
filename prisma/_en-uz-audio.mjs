// Ingliz tili (en->uz) modulida INGLIZCHA matni o'zgargan (Tashkent, Uzbek, ...) elementlar uchun
// yangi audio: edge-tts en-US-AriaNeural (en A1 ning ovozi bilan bir xil) ->
// ramz-audio/audio/en-uz/<sha1(matn)>.mp3 -> git push -> jsDelivr @commitSHA -> data fayliga audioUrl.
//
//   node prisma/_en-uz-audio.mjs prisma/data/en-uz-a1-m02.json          # reja
//   node prisma/_en-uz-audio.mjs prisma/data/en-uz-a1-m02.json --go     # tavlid + push + yozish
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { spawnSync } from 'child_process';
import { exerciseSentence } from './_grammar-ex-text.mjs';

const file = process.argv[2];
const GO = process.argv.includes('--go');
const REPO = 'C:/Users/ASUS1/Desktop/RAMZ/ramz-audio';
const DIR = `${REPO}/audio/en-uz`;
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const M = JSON.parse(readFileSync(file, 'utf8'));
const hash = (t) => createHash('sha1').update(t).digest('hex').slice(0, 16);

// [obyekt, matn] juftliklari
const items = [];
const add = (o, text) => { if (o.needAudio !== undefined) items.push([o, text]); };
for (const l of M.lessons) for (const w of l.words) add(w, w.needAudio);
for (const g of M.grammar) {
  for (const e of g.examples) add(e, e.needAudio);
  for (const x of g.exercises) {
    if (x.needAudio === undefined) continue;
    const r = exerciseSentence(x.needAudio, 'en');
    items.push([x, r.text]);
    if (!r.text) console.log('  mashq uchun audio YOQ:', r.reason, '|', x.prompt);
  }
}
for (const d of M.dialogues) for (const l of d.lines) add(l, l.needAudio);
for (const c of M.comps) add(c, c.needAudio);

const texts = [...new Set(items.map(([, t]) => t).filter(Boolean))];
console.log(`${items.length} element, ${texts.length} noyob matn:`);
for (const t of texts) console.log('  -', t.length > 90 ? t.slice(0, 90) + '...' : t);
if (!GO) process.exit(0);
if (texts.length === 0) { console.log('Audio kerak emas.'); process.exit(0); }

mkdirSync(DIR, { recursive: true });
const todo = texts.filter((t) => !existsSync(`${DIR}/${hash(t)}.mp3`));
if (todo.length) {
  const job = todo.map((t) => ({ text: t, out: `${DIR}/${hash(t)}.mp3` }));
  const py = `
import asyncio, json, sys, edge_tts
jobs = json.load(open(sys.argv[1], encoding='utf-8'))
async def one(j, sem):
    async with sem:
        for attempt in range(3):
            try:
                await edge_tts.Communicate(j['text'], 'en-US-AriaNeural').save(j['out']); return
            except Exception as e:
                if attempt == 2: raise
async def main():
    sem = asyncio.Semaphore(5)
    await asyncio.gather(*[one(j, sem) for j in jobs])
asyncio.run(main())
`;
  const tmp = `${process.env.TEMP}/en-uz-audio-job`.replace(/\\/g, '/');
  mkdirSync(tmp, { recursive: true });
  writeFileSync(`${tmp}/job.json`, JSON.stringify(job));
  writeFileSync(`${tmp}/run.py`, py);
  const r = spawnSync('python', [`${tmp}/run.py`, `${tmp}/job.json`], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
  if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
}
for (const t of texts) {
  const f = `${DIR}/${hash(t)}.mp3`;
  if (!existsSync(f) || readFileSync(f).length < 3000) { console.error('audio buzuq/yoq:', t); process.exit(1); }
}
console.log(`${texts.length} fayl tayyor (${todo.length} yangi).`);

const git = (...a) => spawnSync('git', ['-C', REPO, ...a], { encoding: 'utf8' });
git('add', 'audio/en-uz');
const st = git('status', '--porcelain', 'audio/en-uz').stdout.trim();
if (st) {
  const c = git('commit', '-m', `en-uz: audio for ${todo.length} localized English lines (Uzbekistan context)`);
  if (c.status !== 0) { console.error(c.stderr || c.stdout); process.exit(1); }
  const p = git('push', 'origin', 'main');
  if (p.status !== 0) { console.error(p.stderr); process.exit(1); }
}
const sha = git('rev-parse', 'HEAD').stdout.trim();
console.log('commit', sha);

// Har fayl o'zini QO'SHGAN commitga pin qilinadi (jsDelivr yangi SHA'da ba'zan 404 kesh qiladi).
const shaOf = (t) => git('log', '-1', '--format=%H', '--', `audio/en-uz/${hash(t)}.mp3`).stdout.trim() || sha;
const urlOf = (t) => `${CDN}@${shaOf(t)}/audio/en-uz/${hash(t)}.mp3`;
// CDN tayyor bo'lishini kut (birinchi fayl)
for (let i = 0; i < 20; i++) {
  const res = await fetch(urlOf(texts[0]), { method: 'HEAD' });
  if (res.ok) break;
  await new Promise((r) => setTimeout(r, 6000));
  if (i === 19) { console.error('CDN javob bermadi'); process.exit(1); }
}
for (const [o, t] of items) {
  o.audioUrl = t ? urlOf(t) : null;
  delete o.needAudio;
}
for (const t of texts) {
  let ok = false;
  for (let i = 0; i < 6 && !ok; i++) {
    const res = await fetch(urlOf(t), { method: 'HEAD' });
    ok = res.ok;
    if (!ok) await new Promise((r) => setTimeout(r, 5000));
  }
  if (!ok) { console.error('CDN javob bermadi:', t); process.exit(1); }
}
writeFileSync(file, JSON.stringify(M, null, 1));
console.log('audioUrl yozildi:', items.length);
