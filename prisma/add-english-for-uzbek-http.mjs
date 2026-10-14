// Inglizcha (target `en`) × Oʻzbekcha (native `uz`) — "poydevor" (2026-10-14):
//   • Course en→uz A1 (qobiq, modullarsiz)
//   • Onboarding "nol dars" (OnboardingWord)  — audio tojikcha qatordan ko'chirilgan (so'z inglizcha)
//   • Alifbo: 26 harf + 22 qoida (transkripsiya OʻZBEK lotinida, misollar uzbekcha o'qilishi bilan)
//   • Daraja testi (PlacementQuestion, 40 savol, Toshkent/o'zbekcha izohlar)
//   • CEFR can-do (CefrDescriptor)
// Manba matn: prisma/data/en-uz-foundation.json (qo'lda tarjima qilingan).
//
//   node prisma/add-english-for-uzbek-http.mjs --dry
//   node prisma/add-english-for-uzbek-http.mjs            # faqat yo'q jadvallarni to'ldiradi
//   node prisma/add-english-for-uzbek-http.mjs --replace  # mavjud en→uz qatorlarni o'chirib qayta yozadi
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const DRY = process.argv.includes('--dry');
const REPLACE = process.argv.includes('--replace');
const D = JSON.parse(readFileSync(new URL('./data/en-uz-foundation.json', import.meta.url), 'utf8'));
const cuid = () => 'c' + [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
const say = (...a) => console.log(...a);

const [en] = await sql.query(`SELECT id FROM "Language" WHERE code='en'`);
const [uz] = await sql.query(`SELECT id FROM "Language" WHERE code='uz'`);
if (!en || !uz) { say('en yoki uz Language yoʻq'); process.exit(1); }
const T = en.id, N = uz.id;

async function fill(table, rows, insert) {
  const [{ n }] = await sql.query(`SELECT COUNT(*)::int n FROM "${table}" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2`, [T, N]);
  if (n > 0 && !REPLACE) { say(`${table}: ${n} qator bor — oʻtkazildi (--replace bilan qayta yoziladi)`); return; }
  say(`${table}: ${n ? n + ' oʻchiriladi, ' : ''}${rows.length} qator yoziladi`);
  if (DRY) return;
  if (n > 0) await sql.query(`DELETE FROM "${table}" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2`, [T, N]);
  for (const r of rows) await insert(r);
}

// 0) Course qobiq
{
  const [c] = await sql.query(`SELECT id FROM "Course" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2 AND level='A1'`, [T, N]);
  if (c) say('Course en→uz A1: bor');
  else {
    say('Course en→uz A1: yaratiladi (modullarsiz; faol)');
    if (!DRY) await sql.query(
      `INSERT INTO "Course" (id, "targetLanguageId", "nativeLanguageId", level, title, description, emoji, color, "order", "isActive")
       VALUES ($1,$2,$3,'A1',$4,$5,'🇬🇧','#14B8A6',0,true)`,
      [cuid(), T, N, 'Ingliz tili — A1', 'A1 daraja noldan: alifbo, birinchi tovushlar, salomlashish, tanishuv, raqamlar va qisqa kundalik gaplar (CEFR bo‘yicha).'.replace(/‘/g, 'ʻ')]);
  }
}

await fill('OnboardingWord', D.onboarding, r => sql.query(
  `INSERT INTO "OnboardingWord" (id,"targetLanguageId","nativeLanguageId",word,translation,transcription,"transcriptionTajik",emoji,example,"exampleTrans",options,"audioUrl","order")
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13)`,
  [cuid(), T, N, r.word, r.translation, r.transcription, r.transcriptionTajik, r.emoji, r.example, r.exampleTrans, JSON.stringify(r.options), r.audioUrl, r.order]));

await fill('AlphabetLetter', D.letters, r => sql.query(
  `INSERT INTO "AlphabetLetter" (id,"targetLanguageId","nativeLanguageId",uppercase,lowercase,ipa,"tajikTranscription",category,"audioUrl","order")
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
  [cuid(), T, N, r.uppercase, r.lowercase, r.ipa, r.tajikTranscription, r.category, r.audioUrl, r.order]));

await fill('AlphabetRule', D.rules, r => sql.query(
  `INSERT INTO "AlphabetRule" (id,"targetLanguageId","nativeLanguageId",category,title,body,"order") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
  [cuid(), T, N, r.category, r.title, r.body, r.order]));

await fill('PlacementQuestion', D.placement, r => sql.query(
  `INSERT INTO "PlacementQuestion" (id,"targetLanguageId","nativeLanguageId","cefrLevel",skill,prompt,"promptTranslated",options,answer,explanation,"audioUrl","order","isActive")
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12,true)`,
  [cuid(), T, N, r.cefrLevel, r.skill, r.prompt, r.promptTranslated, JSON.stringify(r.options), r.answer, r.explanation, r.audioUrl, r.order]));

await fill('CefrDescriptor', D.cefr, r => sql.query(
  `INSERT INTO "CefrDescriptor" (id,"targetLanguageId","nativeLanguageId","cefrLevel",skill,"canDo","order") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
  [cuid(), T, N, r.cefrLevel, r.skill, r.canDo, r.order]));

say(DRY ? '\n--dry: hech narsa yozilmadi.' : '\nTayyor.');
