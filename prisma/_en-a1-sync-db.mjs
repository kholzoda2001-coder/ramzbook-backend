// Тағйири JSON-и бастаҳои гуфторро ба база мебарад — ДАР ҶОЯШ, бе seed (02.10.2026).
//
//   node prisma/_en-a1-sync-db.mjs <slug>… [--apply]
//
// Чаро на `_seed-speaking-http.mjs`: он категорияро НЕСТ ва аз нав месозад →
// прогресси хонандагон (SpeakingProgress, каскад) ва ҳамаи аудио гум мешаванд
// (ниг. хотираи ramz-speaking-german). Ин скрипт танҳо UPDATE ва INSERT мекунад:
//   • воҳид бо ҳамон kind+text → майдонҳо ва `order` нав мешаванд, аудио мемонад;
//   • воҳиди ҳамон kind дар ҳамон `order`, ки матнаш иваз шуд → майдонҳо нав,
//     `audioUrl` холӣ (аз нав сабт мешавад); cue иваз шуд → cueAudioUrl ва
//     cueRealAudioUrl холӣ; ният иваз шуд → intentAudioUrl холӣ;
//   • воҳиди нав → INSERT (бо `wordCount`, мисли seed);
//   • воҳиди базаи бе ҷуфт → ХАТО ва ҳеҷ чиз навишта намешавад (DELETE нест).
// Бе `--apply` — танҳо нишон медиҳад, ки чӣ иваз мешавад.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const APPLY = process.argv.includes('--apply');
const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!slugs.length) throw new Error('Истифода: node prisma/_en-a1-sync-db.mjs <slug>… [--apply]');

let n = 0;
const cuid = () => 'c' + Date.now().toString(36) + (n++).toString(36).padStart(3, '0') + Math.random().toString(36).slice(2, 10);
const wc = (t) => t.trim().split(/\s+/).filter(Boolean).length;
const arr = (a) => JSON.stringify(a ?? []);
const nz = (v) => (v === undefined || v === '' ? null : v);

const plan = []; // [{sql, params, label}]
let errors = 0;
for (const slug of slugs) {
  const pack = JSON.parse(readFileSync(new URL(`../content/speaking/${slug}.json`, import.meta.url), 'utf8'));
  const [cat] = await sql.query(
    `SELECT c.id FROM "SpeakingCategory" c
       JOIN "Language" t ON t.id=c."targetLanguageId" JOIN "Language" n ON n.id=c."nativeLanguageId"
      WHERE t.code=$1 AND n.code=$2 AND c."titleTranslated"=$3`,
    [pack.targetLanguage, pack.nativeLanguage, pack.category.titleTranslated]);
  if (!cat) { console.error(`⛔ ${slug}: категория дар база нест`); errors++; continue; }
  const lessons = await sql.query(`SELECT id, "order" FROM "SpeakingLesson" WHERE "categoryId"=$1 ORDER BY "order"`, [cat.id]);
  if (lessons.length !== pack.lessons.length) { console.error(`⛔ ${slug}: дарсҳо ${lessons.length} ≠ ${pack.lessons.length}`); errors++; continue; }
  for (const L of pack.lessons) {
    const dbL = lessons.find((x) => x.order === L.order);
    if (!dbL) { console.error(`⛔ ${slug}: дарси ${L.order} нест`); errors++; continue; }
    const db = await sql.query(
      `SELECT id, kind, text, translation, literal, note, cue, "cueTranslation", intent, accepts, swaps, "order"
         FROM "SpeakingItem" WHERE "lessonId"=$1 ORDER BY "order"`, [dbL.id]);
    const used = new Set();
    const pairs = [];
    // 1) ҳамон kind + text
    for (const j of L.items) {
      const d = db.find((x) => !used.has(x.id) && x.kind === j.kind && x.text === j.text);
      if (d) { used.add(d.id); pairs.push([j, d]); } else pairs.push([j, null]);
    }
    // 2) ҳамон kind дар ҳамон order → матн иваз шуд
    for (const p of pairs) {
      if (p[1]) continue;
      const d = db.find((x) => !used.has(x.id) && x.kind === p[0].kind && x.order === p[0].order);
      if (d) { used.add(d.id); p[1] = d; }
    }
    const orphans = db.filter((x) => !used.has(x.id));
    if (orphans.length) {
      for (const o of orphans) console.error(`⛔ ${slug} L${L.order}: дар база бе ҷуфт: [${o.kind}] «${o.text}»`);
      errors++;
      continue;
    }
    for (const [j, d] of pairs) {
      const label = `${slug} L${L.order}#${j.order} [${j.kind}]`;
      if (!d) {
        plan.push({
          label: `+ ${label} «${j.text}»`,
          sql: `INSERT INTO "SpeakingItem" (id, "lessonId", kind, text, translation, literal, note, cue, "cueTranslation",
                  "audioUrl", "order", "wordCount", intent, accepts, swaps)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NULL,$10,$11,$12,$13::text[],$14::text[])`,
          params: [cuid(), dbL.id, j.kind, j.text, j.translation, nz(j.literal), nz(j.note), nz(j.cue), nz(j.cueTranslation),
            j.order, wc(j.text), nz(j.intent), j.accepts ?? [], j.swaps ?? []],
        });
        continue;
      }
      const set = [], params = [], why = [];
      const put = (col, v, cast = '') => { params.push(v); set.push(`"${col}"=$${params.length}${cast}`); };
      if (d.text !== j.text) { put('text', j.text); put('wordCount', wc(j.text)); set.push(`"audioUrl"=NULL`); why.push(`матн «${d.text}» → «${j.text}» (аудио аз нав)`); }
      if (d.translation !== j.translation) { put('translation', j.translation); why.push(`тарҷума → «${j.translation}»`); }
      if ((d.literal ?? null) !== nz(j.literal)) { put('literal', nz(j.literal)); why.push(`транскрипсия → «${j.literal}»`); }
      if ((d.note ?? null) !== nz(j.note)) { put('note', nz(j.note)); why.push('шарҳ'); }
      if ((d.cue ?? null) !== nz(j.cue)) { put('cue', nz(j.cue)); set.push(`"cueAudioUrl"=NULL`, `"cueRealAudioUrl"=NULL`); why.push(`cue «${d.cue}» → «${j.cue}» (аудио аз нав)`); }
      if ((d.cueTranslation ?? null) !== nz(j.cueTranslation)) { put('cueTranslation', nz(j.cueTranslation)); why.push('тарҷумаи cue'); }
      if ((d.intent ?? null) !== nz(j.intent)) { put('intent', nz(j.intent)); set.push(`"intentAudioUrl"=NULL`); why.push(`ният → «${j.intent}»`); }
      if (arr(d.accepts) !== arr(j.accepts)) { put('accepts', j.accepts ?? [], '::text[]'); why.push('accepts'); }
      if (arr(d.swaps) !== arr(j.swaps)) { put('swaps', j.swaps ?? [], '::text[]'); why.push('swaps'); }
      if (d.order !== j.order) { put('order', j.order); why.push(`order ${d.order}→${j.order}`); }
      if (!set.length) continue;
      params.push(d.id);
      plan.push({ label: `~ ${label}: ${why.join('; ')}`, sql: `UPDATE "SpeakingItem" SET ${set.join(', ')} WHERE id=$${params.length}`, params });
    }
  }
}
for (const p of plan) console.log(p.label);
console.log(`\nнақша: ${plan.length} амал · хато: ${errors}`);
if (errors) { console.error('⛔ хато ҳаст — ҳеҷ чиз навишта нашуд'); process.exit(1); }
if (!APPLY) { console.log('(санҷиш — барои навиштан --apply)'); process.exit(0); }
// Як транзаксия: ё ҳама, ё ҳеҷ.
await sql.transaction(plan.map((p) => sql.query(p.sql, p.params)));
await sql.query(
  `INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version', '"1"', NOW())
   ON CONFLICT (key) DO UPDATE SET "updatedAt" = NOW()`);
console.log(`✅ навишта шуд: ${plan.length} · content_version ламс шуд`);
