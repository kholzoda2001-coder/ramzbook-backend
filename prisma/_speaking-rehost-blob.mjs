// Клипҳои бахши ГУФТОР-ро аз Vercel Blob (баста шуд → 403) ба GitHub +
// jsDelivr мекӯчонад — ҳамон роҳе, ки `_de-audio-rehost.mjs` барои курси
// олмонӣ гузашт.
//
// 🔴 Сабаб (20.09.2026): анбори Blob «suspended» аст. Ҳар URL-и
// `*.public.blob.vercel-storage.com` HTTP 403 медиҳад, яъне 277 воҳиди
// гуфтори ar/ru/ko дар телефон ХОМӮШ буданд.
//
// Аз нав САБТ НАМЕШАВАД: нусхаи буридашудаи ҳар клип дар `tmp/<lang>-speaking-
// audio-trim/<id>.mp3` ҳаст — ҳамон файле, ки ба Blob рафта буд. Пас овоз,
// буриш ва баландии садо айнан ҳамон мемонад; танҳо ҷои нигоҳдорӣ иваз
// мешавад. Агар ягон файл наёбад — скрипт ҚАТЪ мешавад, то нимкора накунад.
//
//   node prisma/_speaking-rehost-blob.mjs <ramz-audio dir> [--dry]
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';

const REPO = process.argv[2];
if (!REPO || REPO.startsWith('--')) throw new Error('Истифода: node prisma/_speaking-rehost-blob.mjs <ramz-audio dir>');
const DRY = process.argv.includes('--dry');

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);

const items = await sql.query(
  `SELECT i.id, i.text, i."audioUrl" au, lt.code lang, c."titleTranslated" cat, l."order" les
     FROM "SpeakingItem" i
     JOIN "SpeakingLesson" l ON i."lessonId" = l.id
     JOIN "SpeakingCategory" c ON l."categoryId" = c.id
     JOIN "Language" lt ON lt.id = c."targetLanguageId"
    WHERE i."audioUrl" LIKE '%blob.vercel-storage%'
    ORDER BY lt.code, c."order", l."order", i."order"`);
const byLang = items.reduce((a, i) => ((a[i.lang] = (a[i.lang] ?? 0) + 1), a), {});
console.log(`Дар Blob: ${items.length} воҳид ·`, JSON.stringify(byLang));
if (!items.length) { console.log('Коре нест.'); process.exit(0); }

// ── 1. Нусхаи маҳаллии ҳар клип ─────────────────────────────────────────────
const srcOf = (it) => `tmp/${it.lang}-speaking-audio-trim/${it.id}.mp3`;
const missing = items.filter((i) => !existsSync(srcOf(i)));
if (missing.length) {
  console.error(`⛔ ${missing.length} файл дар tmp нест — аз нав сабт кардан лозим:`);
  for (const m of missing.slice(0, 10)) console.error(`   ${m.lang} «${m.text}» → ${srcOf(m)}`);
  process.exit(1);
}
console.log('Ҳамаи нусхаҳои маҳаллӣ ёфт шуданд.');
if (DRY) { console.log('--dry: ҳеҷ чиз нусхабардорӣ ва навишта нашуд.'); process.exit(0); }

// ── 2. Ба репои CDN ─────────────────────────────────────────────────────────
for (const it of items) {
  const dir = `${REPO}/audio/${it.lang}`;
  mkdirSync(dir, { recursive: true });
  copyFileSync(srcOf(it), `${dir}/${it.id}.mp3`);
}
const langs = Object.keys(byLang).map((l) => `audio/${l}`).join(' ');
const dirty = execSync(`git status --porcelain ${langs}`, { cwd: REPO }).toString().trim();
if (dirty) {
  execSync(`git add ${langs}`, { cwd: REPO, stdio: 'inherit' });
  execSync(
    'git -c user.email="255218020+kholzoda2001-coder@users.noreply.github.com" '
    + '-c user.name="kholzoda2001-coder" commit -m "Speaking ar/ru/ko: rehost 277 clips from the suspended Blob store to jsDelivr"',
    { cwd: REPO, stdio: 'inherit' });
  execSync('git push origin HEAD', { cwd: REPO, stdio: 'inherit' });
} else {
  console.log('тағйирот нест — коммити ҷорӣ истифода мешавад');
}
const sha = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim();
const cdn = (it) => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@${sha}/audio/${it.lang}/${it.id}.mp3`;
console.log('SHA:', sha);

// ── 3. Санҷиши md5 аз CDN ва навиштани audioUrl ─────────────────────────────
// ⚠️ Аввал САНҶИШ, баъд навиштан: агар jsDelivr файлро ҳанӯз накашида бошад,
// база набояд ба пайванди мурда ишора кунад.
writeFileSync('tmp/_speaking-blob-backup.json', JSON.stringify(items.map((i) => ({ id: i.id, lang: i.lang, text: i.text, old: i.au })), null, 1));
let ok = 0, bad = 0;
for (const it of items) {
  const url = cdn(it);
  const res = await fetch(url).catch(() => null);
  if (!res || !res.ok) { console.log(`  ✗ ${res ? res.status : 'ERR'} ${it.lang} «${it.text}»`); bad++; continue; }
  const got = createHash('md5').update(Buffer.from(await res.arrayBuffer())).digest('hex');
  const want = createHash('md5').update(readFileSync(srcOf(it))).digest('hex');
  if (got !== want) { console.log(`  ✗ md5 фарқ мекунад: ${it.lang} «${it.text}»`); bad++; continue; }
  await sql.query(`UPDATE "SpeakingItem" SET "audioUrl" = $1 WHERE id = $2`, [url, it.id]);
  if (++ok % 50 === 0) console.log(`  ...${ok}/${items.length}`);
}
await sql.query(
  `INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version', '"1"', NOW())
   ON CONFLICT (key) DO UPDATE SET "updatedAt" = NOW()`);
console.log(`\nнавишта шуд: ${ok}/${items.length} · бад: ${bad} (нусхаи URL-ҳои кӯҳна: tmp/_speaking-blob-backup.json)`);
if (bad) process.exit(1);
