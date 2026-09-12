// МОДУЛИ 2-и РУСӢ — R3: ду акси НОДУРУСТ аз CDN нест карда мешаванд.
//
//   images/ru/таджикистан.png — ҳайкали марди костюмпӯш (AI), на ёдгории тоҷик
//   images/ru/англия.png      — саҳрои сабзи умумӣ, ба ҳар кишвар монанд
//
// Танҳо ҳамин ду калимаи РУСӢ (Д5, Д13) онҳоро истифода мебаранд
// (`_ru-m2-precheck.mjs`). Корт эмоҷии 🇹🇯 / 🇬🇧-ро нишон медиҳад — дар ҳамаи
// версияҳои барнома, бе билд. Нусхаи файлҳо дар `tmp/` пеш аз нест кардан.
//
// ⚠️ Доми jsDelivr (11.09.2026, «друг»): purge-и якум пайванди «main → commit»-ро
// фавран нав намекунад. Қоида: purge → 5 дақ → purge → санҷиш.
//
//   node prisma/_ru-m2-images.mjs           # dry-run
//   node prisma/_ru-m2-images.mjs --apply
import { writeFileSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { APPLY } from './_ru-fix-lib.mjs';

const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const FILES = ['таджикистан', 'англия'];
const git = (a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
const cdn = (ver, k) => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@${ver}/images/ru/${encodeURIComponent(k)}.png`;
const status = async (u) => (await fetch(u, { method: 'HEAD' })).status;

if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`клони ${REPO} нест`);
git(['fetch', '--depth', '1', 'origin', 'main']);
git(['reset', '--hard', 'origin/main']);
for (const k of FILES) {
  const blob = git(['ls-tree', 'origin/main', `images/ru/${k}.png`]);
  console.log(`${k}: ${blob ? 'дар репо ҲАСТ' : 'дар репо нест'} · @main → HTTP ${await status(cdn('main', k))}`);
  if (blob) {
    const sha = blob.split(/\s+/)[2];
    const out = `../tmp/BACKUP-images-ru-${k === 'таджикистан' ? 'tajikistan' : 'england'}-2026-09-11.png`;
    if (!existsSync(out)) writeFileSync(out, execFileSync('git', ['cat-file', '-p', sha], { cwd: REPO }));
    console.log(`   нусха: ${out}`);
  }
}
if (!APPLY) { console.log('\n--dry: ҳеҷ чиз нест нашуд.'); process.exit(0); }

const present = FILES.filter((k) => git(['ls-tree', 'origin/main', `images/ru/${k}.png`]));
if (present.length) {
  git(['rm', '--sparse', '-q', ...present.map((k) => `images/ru/${k}.png`)]);
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-q', '-m',
    'Remove images/ru/таджикистан.png (AI statue, not a Tajik landmark) and англия.png (generic fields); cards fall back to flag emoji']);
  git(['push', '-q', 'origin', 'HEAD:main']);
}
const sha = git(['rev-parse', 'HEAD']);
for (const k of FILES) {
  const s = await status(cdn(sha, k));
  console.log(`@${sha.slice(0, 7)} ${k} → HTTP ${s} ${s === 404 ? '✓' : '✗'}`);
}
const purge = async () => {
  for (const k of FILES) {
    const r = await fetch(`https://purge.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/ru/${encodeURIComponent(k)}.png`);
    console.log(`purge ${k}: ${r.status}`);
  }
};
await purge();
for (let minute = 1; minute <= 20; minute++) {
  await new Promise((r) => setTimeout(r, 60000));
  const st = await Promise.all(FILES.map((k) => status(cdn('main', k))));
  console.log(`дақиқаи ${minute}: @main → ${st.join(', ')}`);
  if (st.every((s) => s === 404)) { console.log('✅ ҳарду акс аз CDN нопадид шуданд'); process.exit(0); }
  if (minute === 5 || minute === 12) await purge();
}
console.log('⚠️ @main ҳанӯз кӯҳна — репо дуруст аст (@sha = 404); jsDelivr то 12 соат нав мекунад');
