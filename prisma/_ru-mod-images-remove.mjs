// Нест кардани аксҳои НОДУРУСТИ русӣ аз CDN (images/ru/<калид>.png) — умумӣ барои ҳар модул.
//
// Корти калима баъд эмоҷии худро нишон медиҳад — дар ҳамаи версияҳои барнома, бе билд.
// Нусхаи ҳар файл пеш аз нест кардан ба tmp/ меравад (барқароршаванда).
// ⚠️ jsDelivr: purge-и якум пайванди «main → commit»-ро фавран нав намекунад →
//    purge → интизорӣ → purge дубора (дақиқаи 5 ва 12) → санҷиш то 404.
//
//   node prisma/_ru-mod-images-remove.mjs <тег> <калид1> <калид2> …            # dry-run
//   node prisma/_ru-mod-images-remove.mjs <тег> <калид1> <калид2> … --apply
import { writeFileSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { APPLY } from './_ru-fix-lib.mjs';

const args = process.argv.slice(2).filter((a) => a !== '--apply');
const [TAG, ...KEYS] = args;
if (!TAG || !KEYS.length) throw new Error('истифода: <тег> <калид…>');
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const git = (a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
const cdn = (ver, k) => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@${ver}/images/ru/${encodeURIComponent(k)}.png`;
const status = async (u) => (await fetch(u, { method: 'HEAD' })).status;

if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`клони ${REPO} нест`);
git(['fetch', '--depth', '1', 'origin', 'main']);
git(['reset', '--hard', 'origin/main']);
const present = [];
for (const k of KEYS) {
  const blob = git(['ls-tree', 'origin/main', `images/ru/${k}.png`]);
  console.log(`${k}: ${blob ? 'дар репо ҲАСТ' : 'дар репо нест'} · @main → HTTP ${await status(cdn('main', k))}`);
  if (blob) {
    present.push(k);
    const out = `../tmp/BACKUP-images-ru-${TAG}-${Buffer.from(k).toString('hex').slice(0, 24)}-2026-09-11.png`;
    if (!existsSync(out)) writeFileSync(out, execFileSync('git', ['cat-file', '-p', blob.split(/\s+/)[2]], { cwd: REPO }));
    console.log(`   нусха: ${out}`);
  }
}
if (!APPLY) { console.log('\n--dry: ҳеҷ чиз нест нашуд.'); process.exit(0); }
if (present.length) {
  git(['rm', '--sparse', '-q', ...present.map((k) => `images/ru/${k}.png`)]);
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-q', '-m',
    `Remove ${present.length} misleading/uncanny Russian photos (${TAG}): ${present.join(', ')}; cards fall back to emoji`]);
  git(['push', '-q', 'origin', 'HEAD:main']);
}
const sha = git(['rev-parse', 'HEAD']);
for (const k of KEYS) console.log(`@${sha.slice(0, 7)} ${k} → HTTP ${await status(cdn(sha, k))}`);
const purge = async () => {
  for (const k of KEYS) {
    const r = await fetch(`https://purge.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/ru/${encodeURIComponent(k)}.png`);
    console.log(`purge ${k}: ${r.status}`);
  }
};
await purge();
for (let minute = 1; minute <= 25; minute++) {
  await new Promise((r) => setTimeout(r, 60000));
  const st = await Promise.all(KEYS.map((k) => status(cdn('main', k))));
  console.log(`дақиқаи ${minute}: @main → ${st.join(', ')}`);
  if (st.every((s) => s === 404)) { console.log(`✅ ҳамаи ${KEYS.length} акс аз CDN нопадид шуданд`); process.exit(0); }
  if (minute === 5 || minute === 12 || minute === 20) await purge();
}
console.log('⚠️ @main ҳанӯз кӯҳна — репо дуруст аст (@sha = 404); jsDelivr то 12 соат нав мекунад');
