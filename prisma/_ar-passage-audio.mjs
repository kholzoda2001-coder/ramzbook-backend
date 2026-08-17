// Аудиои матнҳои хониш ва мисолҳои грамматикаи арабӣ, ки онро надоштанд.
//
// Чаро: дар курси англисӣ ҳар 48 матн ва ҳар 124 мисоли грамматика аудио дорад
// — хонанда матнро мешунавад ва такрор мекунад. Дар арабӣ 15 матн ва 10 мисол
// хомӯш буданд, аз ҷумла ҳар панҷ дарси «Такрори модул» ва ҳар панҷ имтиҳон.
// Барои хате, ки садоноки кӯтоҳашро наменависад, шунидан аз хондан муҳимтар аст.
//
// Ҷои файл: ҳамон ҷои тамоми аудиои курс — репои `ramz-audio`, роҳи
// `audio/ar/<id>.mp3`, бо пини commit (на `@main`: jsDelivr-и `@main`-ро дер
// нав мекунад — ниг. [[ramz-audio-hosting]]).
//
//   node prisma/_ar-passage-audio.mjs --dry     // танҳо рӯйхат
//   node prisma/_ar-passage-audio.mjs           // тавлид + push + сабт
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const DRY = process.argv.includes('--dry');
const VOICE = 'ar-SA-ZariyahNeural';
const COURSE = 'cmqdqfv7300021rcswj4fy6vf';
const WORK = 'tmp/ar-passage-audio';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';

// ── 1. Чӣ лозим аст ─────────────────────────────────────────────────────────
const passages = await q(`SELECT c.id, c."titleTranslated" t, c.passage txt FROM "ComprehensionExercise" c
  WHERE c."courseId"='${COURSE}' AND (c."audioUrl" IS NULL OR c."audioUrl"='')`);
const examples = await q(`SELECT x.id, t."titleTranslated" t, x.sentence txt FROM "GrammarExample" x
  JOIN "GrammarTopic" t ON x."topicId"=t.id
  WHERE t."courseId"='${COURSE}' AND (x."audioUrl" IS NULL OR x."audioUrl"='')`);
const items = [
  ...passages.map(r => ({ ...r, table: 'ComprehensionExercise' })),
  ...examples.map(r => ({ ...r, table: 'GrammarExample' })),
];
console.log(`матни бе аудио: ${passages.length} · мисоли грамматика бе аудио: ${examples.length}`);
for (const it of items) console.log(`  ${it.table === 'GrammarExample' ? 'мисол' : 'матн '} «${it.t}» — ${it.txt.length} аломат`);
if (!items.length) { console.log('\nҲама чиз аллакай аудио дорад.'); process.exit(0); }
if (DRY) { console.log(`\n[--dry] ${items.length} файл сохта мешуд.`); process.exit(0); }

// ── 2. Тавлид ───────────────────────────────────────────────────────────────
mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}/items.json`, JSON.stringify(items.map(i => ({ id: i.id, text: i.txt })), null, 1));
console.log(`\n== Тавлид (edge-tts, ${VOICE}) ==`);
const out = execFileSync('python', ['prisma/_ar-tts.py', WORK, `${WORK}/items.json`, VOICE],
  { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
console.log(out.trim().split('\n').slice(-2).join('\n'));

// ── 3. Ба репои аудио ───────────────────────────────────────────────────────
// Клони сабук: бе таърих ва бе blob-ҳо, танҳо ҳамон як директория.
console.log('\n== Репои аудио ==');
const git = (args, cwd = REPO) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
if (!existsSync(REPO)) {
  console.log('клони сабук…');
  execFileSync('git', ['clone', '--depth', '1', '--filter=blob:none', '--no-checkout',
    'https://github.com/kholzoda2001-coder/ramz-audio', REPO], { encoding: 'utf8' });
  git(['sparse-checkout', 'set', 'audio/ar']);
  git(['checkout', 'main']);
} else {
  git(['fetch', '--depth', '1', 'origin', 'main']);
  git(['reset', '--hard', 'origin/main']);
}
for (const it of items) copyFileSync(`${WORK}/${it.id}.mp3`, `${REPO}/audio/ar/${it.id}.mp3`);
git(['add', 'audio/ar']);
const status = git(['status', '--porcelain']);
if (!status.trim()) { console.log('файли нав нест — эҳтимол аллакай push шудааст'); }
else {
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj',
    'commit', '-m', `Add Arabic passage and grammar-example audio (${items.length} clips)`]);
  git(['push', 'origin', 'main']);
  console.log('push шуд');
}
const sha = git(['rev-parse', 'HEAD']);
console.log(`commit: ${sha}`);

// ── 4. Сабт дар база ────────────────────────────────────────────────────────
console.log('\n== Сабт ==');
let done = 0;
for (const it of items) {
  const url = `${CDN}@${sha}/audio/ar/${it.id}.mp3`;
  await q(`UPDATE "${it.table}" SET "audioUrl"=$1 WHERE id=$2`, [url, it.id]);
  done++;
}
await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
console.log(`  ${done} сабт навишта шуд · content_version ламс шуд`);

// ── 5. Санҷиш ───────────────────────────────────────────────────────────────
console.log('\n== Санҷиш (jsDelivr метавонад чанд сония дер кунад) ==');
let ok = 0, bad = 0;
for (const it of items) {
  const url = `${CDN}@${sha}/audio/ar/${it.id}.mp3`;
  let r = await fetch(url, { method: 'HEAD' });
  if (!r.ok) { await new Promise(s => setTimeout(s, 2000)); r = await fetch(url, { method: 'HEAD' }); }
  if (r.ok) ok++; else { bad++; console.log(`  ✗ «${it.t}»: HTTP ${r.status}`); }
}
console.log(`  дастрас: ${ok}/${items.length}${bad ? ` · нокомӣ: ${bad}` : ''}`);
