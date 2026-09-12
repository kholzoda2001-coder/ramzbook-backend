// Аудити САДОИ ВОҚЕИИ ҳамаи аудиоҳои кореягӣ + ислоҳи танҳо файлҳои хомӯш.
//
// Доира: алифбо (40 ҳарф), дарси шиносоӣ, курси TOPIK I (калима, мисоли
// грамматика, сатри муколама, матн). Ҳар файл аз URL-и ҳақиқӣ (ҳамон ки барнома
// мегирад) зеркашӣ ва бо `_audio-energy.py` санҷида мешавад. Файли хомӯш бо
// `speakReliable` аз нав сохта, бурида, бори дигар санҷида, бор ва сабт мешавад.
//
//   node prisma/_ko-audio-repair.mjs --check   # танҳо аудит
//   node prisma/_ko-audio-repair.mjs           # аудит + ислоҳ
import { SignJWT } from 'jose';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import { neon } from '@neondatabase/serverless';
import { speakReliable, checkEnergy, useTrimOrRaw } from './_ko-tts-google.mjs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const BASE = 'https://admin.ramz.tj';
const KO = 'cmtkb6u4i000pd8149oc';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const COURSE = 'cmtkb6vgg001lmgnbunb';
const CHECK = process.argv.includes('--check');
const DL = 'tmp/ko-audio-audit';
const WORK = 'tmp/ko-audio-repair';

// Номи ҳарф бо имлои ҳангул — ҳамон харитаи `_ko-alphabet-audio.mjs`.
const NAME = {
  'ㅏ': '아', 'ㅑ': '야', 'ㅓ': '어', 'ㅕ': '여', 'ㅗ': '오', 'ㅛ': '요', 'ㅜ': '우', 'ㅠ': '유', 'ㅡ': '으', 'ㅣ': '이',
  'ㄱ': '기역', 'ㄴ': '니은', 'ㄷ': '디귿', 'ㄹ': '리을', 'ㅁ': '미음', 'ㅂ': '비읍', 'ㅅ': '시옷', 'ㅇ': '이응', 'ㅈ': '지읒',
  'ㅊ': '치읓', 'ㅋ': '키읔', 'ㅌ': '티읕', 'ㅍ': '피읖', 'ㅎ': '히읗',
  'ㄲ': '쌍기역', 'ㄸ': '쌍디귿', 'ㅃ': '쌍비읍', 'ㅆ': '쌍시옷', 'ㅉ': '쌍지읒',
  'ㅐ': '애', 'ㅒ': '얘', 'ㅔ': '에', 'ㅖ': '예', 'ㅘ': '와', 'ㅙ': '왜', 'ㅚ': '외', 'ㅝ': '워', 'ㅞ': '웨', 'ㅟ': '위', 'ㅢ': '의',
};

// ── 1. Ҳамаи аудиоҳо ────────────────────────────────────────────────────────
const items = [
  ...(await sql.query(`SELECT 'AlphabetLetter' tbl, id, uppercase t, "audioUrl" u FROM "AlphabetLetter"
      WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2`, [KO, TG])).map(r => ({ ...r, text: NAME[r.t], label: `ҳарфи ${r.t}` })),
  ...(await sql.query(`SELECT 'OnboardingWord' tbl, id, word t, "audioUrl" u FROM "OnboardingWord" WHERE "targetLanguageId"=$1`, [KO]))
      .map(r => ({ ...r, text: r.t, label: `шиносоӣ «${r.t}»` })),
  ...(await sql.query(`SELECT 'Word' tbl, w.id, w.word t, w."audioUrl" u, l."skillType" st FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId"
      JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=$1`, [COURSE])).map(r => ({ ...r, text: r.t, label: `калима «${r.t}» (${r.st})` })),
  ...(await sql.query(`SELECT 'GrammarExample' tbl, e.id, e.sentence t, e."audioUrl" u FROM "GrammarExample" e JOIN "GrammarTopic" g ON g.id=e."topicId"
      WHERE g."courseId"=$1`, [COURSE])).map(r => ({ ...r, text: r.t, label: `мисол «${r.t}»` })),
  ...(await sql.query(`SELECT 'DialogueLine' tbl, dl.id, dl.text t, dl."audioUrl" u FROM "DialogueLine" dl JOIN "Dialogue" d ON d.id=dl."dialogueId"
      WHERE d."courseId"=$1`, [COURSE])).map(r => ({ ...r, text: r.t, label: `муколама «${r.t}»` })),
  ...(await sql.query(`SELECT 'ComprehensionExercise' tbl, x.id, x.passage t, x."audioUrl" u FROM "ComprehensionExercise" x WHERE x."courseId"=$1`, [COURSE]))
      .map(r => ({ ...r, text: r.t, label: `матн «${r.t.slice(0, 16)}…»` })),
];
const missingText = items.filter(i => !i.text);
if (missingText.length) { console.error('✗ матни синтез нест:', missingText.map(i => i.label).join(', ')); process.exit(1); }

// ── 2. Зеркашӣ ва санҷиши садо ──────────────────────────────────────────────
rmSync(DL, { recursive: true, force: true });
mkdirSync(DL, { recursive: true });
const noUrl = [];
for (const it of items) {
  if (!it.u) { noUrl.push(it); continue; }
  it.file = `${DL}/${it.tbl}_${it.id}.mp3`;
  let ok = false;
  for (let a = 0; a < 3 && !ok; a++) {
    try { const r = await fetch(it.u); if (r.ok) { writeFileSync(it.file, Buffer.from(await r.arrayBuffer())); ok = true; } } catch {}
  }
  if (!ok) { it.file = null; noUrl.push(it); }
}
const silentFiles = new Set(checkEnergy(items.filter(i => i.file).map(i => i.file)));
const bad = [...noUrl, ...items.filter(i => i.file && silentFiles.has(i.file))];
console.log(`Санҷида шуд: ${items.length} аудио · хомӯш ё дастнорас: ${bad.length}`);
for (const b of bad) console.log(`  ✗ ${b.label}`);
if (CHECK || !bad.length) process.exit(bad.length && CHECK ? 1 : 0);

// ── 3. Ислоҳ ────────────────────────────────────────────────────────────────
const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });
console.log('\n== Аз нав сохтан ==');
for (const b of bad) {
  const { buf, variant, attempts } = await speakReliable(b.text, { apiKey: env.GOOGLE_TTS_KEY, workDir: WORK });
  writeFileSync(`${WORK}/${b.id}.mp3`, buf);
  console.log(`  ✓ ${b.label}: ${variant}, ${attempts} кӯшиш`);
}
const TRIM = `${WORK}-trim`;
rmSync(TRIM, { recursive: true, force: true });
console.log('  ' + execFileSync('python', ['prisma/_ar-trim.py', WORK, TRIM], { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } }).trim().split('\n').slice(-1)[0]);
const { still: stillSilent, usedRaw } = useTrimOrRaw(bad.map(b => [`${WORK}/${b.id}.mp3`, `${TRIM}/${b.id}.mp3`]));
if (usedRaw) console.log(`  ${usedRaw} клипи кӯтоҳ бе буриш монд (буриш садоро мехӯрд)`);
if (stillSilent.length) { console.error('✗ ҳатто нусхаи хом хомӯш:', stillSilent.join(', ')); process.exit(1); }

console.log('\n== Бор кардан ва сабт ==');
for (const b of bad) {
  const fd = new FormData();
  fd.append('file', new File([readFileSync(`${TRIM}/${b.id}.mp3`)], `ko_fix_${b.id}.mp3`, { type: 'audio/mpeg' }));
  const up = await fetch(`${BASE}/api/admin/upload`, { method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd });
  const body = await up.json().catch(() => ({}));
  if (!up.ok || !body.url) { console.error(`  ✗ ${b.label}: upload ${up.status}`); process.exit(1); }
  await sql.query(`UPDATE "${b.tbl}" SET "audioUrl"=$1 WHERE id=$2`, [body.url, b.id]);
  b.newUrl = body.url;
  console.log(`  ✓ ${b.label}`);
}
// SQL-и мустақим → кэши мазмун дастӣ: версияи умумӣ + версияи бахшҳои курс.
await sql.query(`INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version','"1"',NOW())
                 ON CONFLICT (key) DO UPDATE SET "updatedAt"=NOW()`);
if (bad.some(b => b.tbl !== 'AlphabetLetter' && b.tbl !== 'OnboardingWord'))
  await sql.query(`UPDATE "Module" SET "contentVersion"="contentVersion"+1 WHERE "courseId"=$1`, [COURSE]);

// ── 4. Санҷиши такрорӣ аз URL-и нав ─────────────────────────────────────────
const recheck = [];
for (const b of bad) {
  const f = `${DL}/recheck_${b.id}.mp3`;
  const r = await fetch(b.newUrl);
  writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  recheck.push(f);
}
const after = checkEnergy(recheck);
console.log(`\nАз URL-и нав: ${bad.length - after.length}/${bad.length} бо садо`);
process.exit(after.length ? 1 : 0);
