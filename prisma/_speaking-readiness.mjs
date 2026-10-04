// Омодагии бахши «Гуфтор» барои як забон (→ tg) — ТАНҲО-ХОНДАН.
//
// Сохтор (ниша → вазъият → дарс → воҳид), гейтҳо ва ҲАР файли аудио аз CDN
// (`tools/audio_check.py`): ибора (`audioUrl`), cue (`cueAudioUrl`), нутқи воқеӣ
// (`cueRealAudioUrl`), ният (`intentAudioUrl`).
//
//   node prisma/_speaking-readiness.mjs ru
//   node prisma/_speaking-readiness.mjs ru --no-fetch
import { spawnSync } from 'child_process';
import { connect, TG } from './_ru-fix-lib.mjs';

const code = process.argv[2];
if (!code) throw new Error('забон: node prisma/_speaking-readiness.mjs <code>');
const FETCH = !process.argv.includes('--no-fetch');
const sql = connect();
const [lang] = await sql`SELECT id,name FROM "Language" WHERE code=${code}`;
if (!lang) throw new Error(`забони ${code} нест`);

const cats = await sql`SELECT id,title,"titleTranslated" tt,"isActive" act,"isPremium" prem,goals,level,"order",
  "requiresCategoryId" req FROM "SpeakingCategory" WHERE "targetLanguageId"=${lang.id} AND "nativeLanguageId"=${TG} ORDER BY "order"`;
const lessons = await sql`SELECT l.id,l."categoryId" cid,l."isActive" act,l.mode,l.stage FROM "SpeakingLesson" l
  WHERE l."categoryId" = ANY(${cats.map((c) => c.id)})`;
const items = await sql`SELECT i.id,i."lessonId" lid,i.kind,i.text,i.cue,i.intent,i."audioUrl" au,i."cueAudioUrl" cau,
  i."cueRealAudioUrl" rau,i."intentAudioUrl" iau FROM "SpeakingItem" i WHERE i."lessonId" = ANY(${lessons.map((l) => l.id)})`;

const activeCats = cats.filter((c) => c.act);
const catById = Object.fromEntries(cats.map((c) => [c.id, c]));
const liveLessons = lessons.filter((l) => l.act && catById[l.cid].act);
const liveLessonIds = new Set(liveLessons.map((l) => l.id));
const liveItems = items.filter((i) => liveLessonIds.has(i.lid));

console.log(`\n«Гуфтор» ${lang.name} (${code}→tg): ${activeCats.length}/${cats.length} вазъият фаъол · ` +
  `${liveLessons.length} дарс · ${liveItems.length} воҳид\n`);

// ── Нишаҳо ────────────────────────────────────────────────────────────────
const NICHES = ['build', 'study', 'service', 'drive', 'life'];
for (const g of [...NICHES, '(умумӣ)']) {
  const cs = activeCats.filter((c) => (g === '(умумӣ)' ? !c.goals?.length : c.goals?.includes(g)));
  const ls = liveLessons.filter((l) => cs.some((c) => c.id === l.cid));
  const n = liveItems.filter((i) => ls.some((l) => l.id === i.lid)).length;
  const lv = [...new Set(cs.map((c) => c.level))].join(',');
  console.log(`  ${g.padEnd(9)} ${String(cs.length).padStart(3)} вазъият · ${String(ls.length).padStart(4)} дарс · ${String(n).padStart(5)} воҳид · сатҳ ${lv || '-'}`);
}

// ── Сохтор ────────────────────────────────────────────────────────────────
const problems = [];
const P = (s) => problems.push(s);
for (const c of activeCats) {
  const ls = liveLessons.filter((l) => l.cid === c.id);
  if (!ls.length) P(`вазъияти бе дарс: «${c.tt}»`);
  for (const l of ls) if (!liveItems.some((i) => i.lid === l.id)) P(`дарси холӣ дар «${c.tt}» (${l.mode ?? l.stage ?? l.id})`);
  if (c.req) {
    const r = catById[c.req];
    if (!r) P(`гейти «${c.tt}» ба вазъияти нестшуда`);
    else if (!r.act) P(`гейти «${c.tt}» ба вазъияти ХОМӮШ «${r.tt}» — ҳеҷ гоҳ кушода намешавад`);
  }
}
for (const i of liveItems) {
  if (!i.text?.trim()) P(`воҳиди бе матн ${i.id}`);
  if (!i.au) P(`бе аудио: «${i.text}»`);
  if (i.cue && !i.cau) P(`cue бе аудио: «${i.cue}»`);
}
const withReal = liveItems.filter((i) => i.rau).length, withCue = liveItems.filter((i) => i.cue).length;
console.log(`\nАудио: ибора ${liveItems.filter((i) => i.au).length}/${liveItems.length} · cue ${liveItems.filter((i) => i.cau).length}/${withCue}` +
  ` · нутқи воқеӣ ${withReal} · ният ${liveItems.filter((i) => i.iau).length}`);

// ── Файлҳо ────────────────────────────────────────────────────────────────
if (FETCH) {
  const refs = [];
  // `…_{goal}.mp3` — барнома ҳадафи хонандаро мегузорад (`speaking_persona.dart`): ҳар 5 файл бояд бошад.
  const GOALS = ['build', 'service', 'drive', 'study', 'life'];
  for (const i of liveItems) for (const [k, u] of [['ибора', i.au], ['cue', i.cau], ['воқеӣ', i.rau], ['ният', i.iau]]) {
    if (!u) continue;
    if (u.includes('{goal}')) for (const g of GOALS) refs.push({ k: `${k}/${g}`, u: u.replace('{goal}', g), i });
    else refs.push({ k, u, i });
  }
  const urls = [...new Set(refs.map((r) => r.u))];
  console.log(`\nКашидан ва чен кардани ${urls.length} файл…`);
  const meas = {};
  const run = (list) => {
    for (let s = 0; s < list.length; s += 120) {
      const r = spawnSync(process.env.RAMZ_PY || 'py', ['../tools/audio_check.py', ...list.slice(s, s + 120)],
        { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
      if (r.status !== 0) throw new Error(r.stderr);
      Object.assign(meas, JSON.parse(r.stdout));
      process.stdout.write(`  ${Math.min(s + 120, list.length)}/${list.length}\r`);
    }
  };
  run(urls);
  console.log();
  // Хатои ШАБАКА (DNS/timeout/403-и гузаранда) то 4 бор бо танаффус; 404 — ҳақиқӣ.
  for (let a = 1; a <= 4; a++) {
    const retry = urls.filter((u) => meas[u].error && !/404/.test(meas[u].error));
    if (!retry.length) break;
    console.log(`такрор ${a}: ${retry.length} файл (хатои шабака)…`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000 * a);
    run(retry);
    console.log();
  }
  for (const { k, u, i } of refs) {
    const m = meas[u];
    if (m.error) P(`файл кушода намешавад (${k}): «${(k === 'cue' ? i.cue : i.text).slice(0, 40)}» — ${m.error}`);
    else if (m.speech < 0.06 || m.peak < 0.02) P(`хомӯш (${k}): «${(k === 'cue' ? i.cue : i.text).slice(0, 40)}» нутқ ${m.speech}с`);
    else if (m.lead > 0.8) P(`хомӯшии дарози сар (${k}) ${m.lead}с: «${(k === 'cue' ? i.cue : i.text).slice(0, 40)}»`);
  }
  const blob = urls.filter((u) => /blob\.vercel-storage\.com/.test(u)).length;
  const main = urls.filter((u) => /@main\//.test(u)).length;
  console.log(`ℹ️  Vercel Blob: ${blob} · @main: ${main}`);
}

console.log(`\n${problems.length ? '❌' : '✅'} Мушкилот: ${problems.length}`);
for (const p of problems.slice(0, 60)) console.log('   ', p);
if (problems.length > 60) console.log(`    … ва боз ${problems.length - 60}`);
