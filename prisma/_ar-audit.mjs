// Аудити пурраи ҳамаи мазмуни арабӣ (ar → tg) — аз рӯи он чи ХОНАНДА мебинад.
// Танҳо мехонад, чизе намеқавад.
//
//   node prisma/_ar-audit.mjs            // сохтор + матн (тез)
//   node prisma/_ar-audit.mjs --audio    // + ҳар аудиоро боргирӣ ва ЧЕН мекунад (суст)
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = t => sql.query(t);

const WITH_AUDIO = process.argv.includes('--audio');
const BASE = 'https://admin.ramz.tj';
const AR = 'cmqdqfuxi00001rcsseeq42fi';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const COURSE = 'cmqdqfv7300021rcswj4fy6vf';

const problems = [];
const P = (area, msg) => problems.push(`[${area}] ${msg}`);
const head = t => console.log(`\n${'─'.repeat(64)}\n${t}\n${'─'.repeat(64)}`);

// ── ёвартарҳо ───────────────────────────────────────────────────────────────
const ARABIC = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
const TASHKEEL = /[ً-ْٰ]/;           // фатҳа, касра, замма, сукун, шадда…
const CYRILLIC = /[Ѐ-ӿ]/;
const LATIN = /[A-Za-z]/;
// Ҳарфҳои русӣ, ки дар тоҷикӣ НЕСТАНД (ниг. [[ramz-english-audit]]).
// «ъ» ин ҷо НЕСТ — он ҳарфи қонунии тоҷикист (Ҷумъа, баъд, аъло).
const RU_ONLY = /[ьыщцЬЫЩЦ]/;
// Нормализатсияи АЙНАН мисли барнома (grammar_models.dart → _normalize):
// ҳарфу рақам мемонад, ҳаракат ва аломат меафтад.
const gnorm = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
const stripHarakat = s => s.replace(/[ً-ْٰ]/g, '');
// Калиди расм — АЙНАН мисли course_roadmap_screen.dart → _normImageKey
// (ҳаракат + татвил тоза, аломат тоза, фосила → «_»).
const normImageKey = w => w.toLowerCase().trim()
  .replace(/[ً-ٰٟۖ-ۭـ]/g, '')
  .replace(/['’.,!?]/g, '')
  .replace(/\s+/g, '_');

const seenUrl = new Map();
async function reachable(url) {
  if (seenUrl.has(url)) return seenUrl.get(url);
  let ok = false;
  try { ok = (await fetch(url, { method: 'HEAD' })).ok; } catch { ok = false; }
  seenUrl.set(url, ok);
  return ok;
}
// Ҳамгироии маҳдуд — вагарна jsDelivr дархостҳоро мепартояд.
async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}
// Давомнокии MP3 аз рӯи фреймҳо (бе китобхонаи беруна).
// Аудиои курс MPEG-2 Layer III @24 kHz аст, на MPEG-1 — ҳарду бояд хонда шаванд,
// вагарна ҳар клип «0.00с» менамояд.
function mp3Duration(buf) {
  const BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]; // MPEG-1 L3
  const BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];     // MPEG-2/2.5 L3
  const SR = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
  let i = 0, dur = 0, guard = 0;
  while (i < buf.length - 4 && guard++ < 400000) {
    if (buf[i] === 0xFF && (buf[i + 1] & 0xE0) === 0xE0) {
      const ver = (buf[i + 1] >> 3) & 3, layer = (buf[i + 1] >> 1) & 3;
      const srTab = SR[ver];
      if (layer === 1 && srTab) {
        const br = (ver === 3 ? BR1 : BR2)[(buf[i + 2] >> 4) & 15];
        const sr = srTab[(buf[i + 2] >> 2) & 3];
        const pad = (buf[i + 2] >> 1) & 1;
        if (br && sr) {
          const spf = ver === 3 ? 1152 : 576;
          const len = Math.floor(spf / 8 * 1000 * br / sr) + pad;
          dur += spf / sr; i += len; continue;
        }
      }
    }
    i++;
  }
  return dur;
}
// Матни арабӣ: ҳиҷоҳоро тахминан мешуморем (ҳарфи ҳамсадо ≈ як воҳиди вақт).
const arLetters = s => (s.match(/[ء-ي]/g) ?? []).length;

// ── 1. Забон ────────────────────────────────────────────────────────────────
head('1. Забон');
const [lang] = await q(`SELECT * FROM "Language" WHERE id='${AR}'`);
console.log(`${lang.flag} ${lang.name} / ${lang.nativeName} · tts=${lang.ttsLocale} · dir=${lang.direction} · hasIPA=${lang.hasIPA}`);
console.log(`isActive=${lang.isActive} · canBeTarget=${lang.canBeTarget} · badge=${lang.badge}`);
if (!lang.ttsLocale) P('забон', 'ttsLocale холӣ');
if (lang.direction !== 'rtl') P('забон', `direction='${lang.direction}' — арабӣ бояд rtl бошад`);
if (CYRILLIC.test(lang.name) === false && lang.name === 'Arabic') P('забон', `номи забон «${lang.name}» англисӣ аст — хонандаи тоҷик «Арабӣ» интизор аст`);
if (lang.isActive) console.log('  ⚠ isActive=true — курс ба ҳамаи хонандагон намоён аст');

// ── 2. Дарси шиносоӣ ────────────────────────────────────────────────────────
head('2. Дарси шиносоӣ (OnboardingWord)');
const ob = await q(`SELECT * FROM "OnboardingWord" WHERE "targetLanguageId"='${AR}' AND "nativeLanguageId"='${TG}' ORDER BY "order"`);
console.log(`калимаҳо: ${ob.length}`);
for (const w of ob) {
  const miss = ['word', 'translation', 'transcription', 'transcriptionTajik', 'emoji', 'example', 'exampleTrans', 'audioUrl']
    .filter(f => !w[f] || !String(w[f]).trim());
  if (miss.length) P('шиносоӣ', `${w.word}: ${miss.join(', ')} нест`);
  const opts = w.options ?? [];
  if (opts.length !== 4) P('шиносоӣ', `${w.word}: ${opts.length} вариант (бояд 4)`);
  if (!opts.includes(w.translation)) P('шиносоӣ', `${w.word}: ҷавоби дуруст дар вариантҳо нест`);
  if (!ARABIC.test(w.word)) P('шиносоӣ', `«${w.word}»: матни арабӣ нест`);
  if (w.audioUrl && !await reachable(w.audioUrl)) P('шиносоӣ', `${w.word}: аудио дастнорас`);
  console.log(`  ${w.word} — ${w.translation} · ${w.transcriptionTajik ?? '—'}`);
}
if (ob.length < 3) P('шиносоӣ', `танҳо ${ob.length} калима`);

// ── 3. Сатҳсанҷӣ ────────────────────────────────────────────────────────────
head('3. Сатҳсанҷӣ (PlacementQuestion)');
// Танҳо саволҳои ФАЪОЛ санҷида мешаванд: саволи хомӯш ба хонанда намеравад.
// Саволҳои B1/B2 қасдан хомӯш карда шуданд — курси он сатҳҳо ҳанӯз нест ва
// хонанда «B2» гирифта, алифбо ва тамоми A1-ро аз даст медод.
const plAll = await q(`SELECT * FROM "PlacementQuestion" WHERE "targetLanguageId"='${AR}' AND "nativeLanguageId"='${TG}' ORDER BY "cefrLevel", "order"`);
const pl = plAll.filter(x => x.isActive);
if (plAll.length !== pl.length) console.log(`(дар бойгонӣ: ${plAll.length - pl.length} саволи хомӯш)`);
const byLvl = pl.reduce((a, x) => ((a[x.cefrLevel] = (a[x.cefrLevel] ?? 0) + 1), a), {});
const bySkill = pl.reduce((a, x) => ((a[x.skill] = (a[x.skill] ?? 0) + 1), a), {});
console.log(`саволҳо: ${pl.length} · сатҳ ${JSON.stringify(byLvl)} · маҳорат ${JSON.stringify(bySkill)}`);
for (const x of pl) {
  const opts = x.options ?? [];
  if (!opts.includes(x.answer)) P('сатҳсанҷӣ', `#${x.cefrLevel}/${x.order}: ҷавоб дар вариантҳо нест`);
  if (new Set(opts).size !== opts.length) P('сатҳсанҷӣ', `#${x.cefrLevel}/${x.order}: варианти такрорӣ`);
  if (!x.promptTranslated) P('сатҳсанҷӣ', `#${x.cefrLevel}/${x.order}: тарҷумаи тоҷикӣ нест`);
  if (!x.explanation) P('сатҳсанҷӣ', `#${x.cefrLevel}/${x.order}: тавзеҳ нест`);
}
// Сатҳе, ки курс надорад, натиҷаи бемаъно медиҳад.
const LADDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const haveLevels = (await q(`SELECT level FROM "Course" WHERE "targetLanguageId"='${AR}' AND "isActive"=true`)).map(c => c.level);
// Сатҳи БАЪДӢ аз баландтарин курси мавҷуда иҷозат дода мешавад: он ба хонанда
// мегӯяд «ту аз A1 болотарӣ» ва ҳамин тавр дар олмонӣ низ кор мекунад. Аз он
// боло — бемаънӣ: натиҷа мазмун надорад.
const maxHave = Math.max(...haveLevels.map(l => LADDER.indexOf(l)), 0);
for (const lvl of Object.keys(byLvl)) {
  if (LADDER.indexOf(lvl) > maxHave + 1) P('сатҳсанҷӣ', `саволҳои сатҳи ${lvl} фаъоланд, вале курси он сатҳ нест (${byLvl[lvl]} савол)`);
}
try {
  const mobPl = await (await fetch(`${BASE}/api/mobile/placement?targetLanguageId=${AR}&nativeLanguageId=${TG}`)).json();
  if ((mobPl.questions ?? []).some(x => x.answer !== undefined)) P('сатҳсанҷӣ', 'ҷавоби дуруст ба муштарӣ мефарояд');
  console.log(`✓ ба барнома мераванд: ${(mobPl.questions ?? []).length} савол, ҷавобҳо пинҳон`);
} catch { P('сатҳсанҷӣ', 'API-и mobile/placement ҷавоб надод'); }

// ── 4. Алифбо ───────────────────────────────────────────────────────────────
head('4. Алифбо');
const al = await (await fetch(`${BASE}/api/mobile/alphabet?targetLanguageId=${AR}&nativeLanguageId=${TG}`)).json();
const letters = al.letters ?? [], rules = al.rules ?? [];
console.log(`ҳарфҳо: ${letters.length} · қоидаҳо: ${rules.length}`);
const byCat = letters.reduce((a, l) => ((a[l.category] = (a[l.category] ?? 0) + 1), a), {});
console.log(`категорияҳо: ${JSON.stringify(byCat)}`);
for (const l of letters) {
  const miss = ['uppercase', 'lowercase', 'ipa', 'tajikTranscription', 'audioUrl'].filter(f => !l[f]);
  if (miss.length) P('алифбо', `«${l.uppercase}»: ${miss.join(', ')} нест`);
  if (!ARABIC.test(l.uppercase ?? '')) P('алифбо', `«${l.uppercase}»: ҳарфи арабӣ нест`);
  // Арабӣ ҳарфи калон/хурд НАДОРАД — агар ин ду фарқ кунанд, ягонтоаш шакли дигар аст.
  if (l.audioUrl && !await reachable(l.audioUrl)) P('алифбо', `«${l.uppercase}»: аудио дастнорас`);
}
const dupLetters = new Map();
for (const l of letters) dupLetters.set(l.uppercase, (dupLetters.get(l.uppercase) ?? 0) + 1);
for (const [k, n] of dupLetters) if (n > 1) P('алифбо', `ҳарфи «${k}» ${n} бор такрор шудааст`);
const ord = letters.map(l => l.order);
if (!ord.every((v, i) => i === 0 || ord[i - 1] < v)) P('алифбо', 'тартиб афзоянда нест');
if (!rules.length) P('алифбо', 'ҲЕҶ ҚОИДАИ АЛИФБО НЕСТ — хонанда шакли ҳарфҳо ва ҳаракатҳоро аз куҷо омӯзад?');
for (const c of ['general', 'vowel', 'consonant']) {
  if (!rules.some(r => r.category === c)) P('алифбо', `қоидаҳои «${c}» нестанд`);
}

// ── 5. Курс ─────────────────────────────────────────────────────────────────
head('5. Курс A1 — сохтор');
const [course] = await q(`SELECT * FROM "Course" WHERE id='${COURSE}'`);
console.log(`«${course.title}» · сатҳ ${course.level} · isActive=${course.isActive}`);
const mods = await q(`SELECT id, "order", title, "titleTranslated", emoji, "isActive" FROM "Module" WHERE "courseId"='${COURSE}' ORDER BY "order", id`);
const active = mods.filter(m => m.isActive), inactive = mods.filter(m => !m.isActive);
console.log(`модулҳо: ${mods.length} (фаъол ${active.length} · хомӯш ${inactive.length})`);
console.log(`тартиби фаъолҳо: ${active.map(m => m.order).join(',')}`);
if (inactive.length) console.log(`хомӯшҳо: ${inactive.map(m => `${m.order}:${m.titleTranslated}`).join(' · ')}`);

const seenOrder = new Map();
for (const m of mods.filter(m => m.order < 100)) seenOrder.set(m.order, [...(seenOrder.get(m.order) ?? []), m]);
for (const [o, arr] of seenOrder) {
  if (arr.length > 1) P('курс', `тартиби ${o} дар ${arr.length} модул такрор: ${arr.map(m => `«${m.titleTranslated}»${m.isActive ? '' : '(хомӯш)'}`).join(' + ')}`);
}
const aOrders = active.map(m => m.order);
for (let i = 0; i < aOrders.length; i++) if (aOrders[i] !== i) { P('курс', `тартиби модулҳои фаъол пайваста нест: ${aOrders.join(',')}`); break; }
for (const m of mods) {
  if (!m.titleTranslated?.trim()) P('курс', `модули ${m.order}: тарҷумаи ном нест`);
  if (!m.emoji) P('курс', `модули ${m.order}: эмоҷӣ нест`);
  if (!ARABIC.test(m.title)) P('курс', `модули ${m.order}: унвони арабӣ нест («${m.title}»)`);
}
// Модули хомӯш дар БОЙГОНӢ (order >= 100) хато нест: он ба хонанда намеравад
// ва тартиби занҷири фаъолро вайрон намекунад. Танҳо хомӯши дар МОБАЙН монда
// мушкил аст — вай ҷои тартибро аз модули фаъол мегирад.
for (const m of inactive.filter(m => m.order < 100)) {
  const [{ n }] = await q(`SELECT COUNT(*)::int n FROM "Lesson" WHERE "moduleId"='${m.id}'`);
  P('курс', `модули хомӯши «${m.titleTranslated}» (${n} дарс) дар мобайни занҷир — ба бойгонӣ баред ё тамом кунед`);
}

const lessons = await q(`SELECT l.*, m."order" AS morder, m."isActive" AS mactive, m."titleTranslated" AS mtitle
  FROM "Lesson" l JOIN "Module" m ON l."moduleId"=m.id WHERE m."courseId"='${COURSE}' ORDER BY m."order", l."order"`);
console.log(`дарсҳо: ${lessons.length}`);
for (const l of lessons) {
  if (!l.titleTranslated?.trim()) P('курс', `дарси «${l.title}»: тарҷумаи ном нест`);
  if (!l.isActive && l.order < 100) P('курс', `дарси «${l.title}»: хомӯш ва дар мобайни модул`);
  if (!l.emoji) P('курс', `дарси «${l.title}»: эмоҷӣ нест`);
}
// Дарсҳои ҳамном дар як модул — хонанда унвони МАТН-ро мебинад, на дарсро.
const byMod = new Map();
for (const l of lessons.filter(x => x.mactive)) byMod.set(l.moduleId, [...(byMod.get(l.moduleId) ?? []), l]);
for (const [, arr] of byMod) {
  const t = arr.map(l => l.titleTranslated.trim().toLowerCase());
  const dup = t.filter((x, i) => t.indexOf(x) !== i);
  for (const d of new Set(dup)) P('курс', `модули «${arr[0].mtitle}»: унвони дарси такрорӣ «${d}»`);
  const lo = arr.map(l => l.order);
  if (new Set(lo).size !== lo.length) P('курс', `модули «${arr[0].mtitle}»: тартиби дарс такрор мешавад`);
}
// Дарси холӣ — экрани холӣ.
const empty = await q(`SELECT l.title, m."isActive" AS mactive FROM "Lesson" l JOIN "Module" m ON l."moduleId"=m.id
  WHERE m."courseId"='${COURSE}'
    AND (SELECT COUNT(*) FROM "Word" w WHERE w."lessonId"=l.id)=0
    AND l."grammarTopicId" IS NULL AND l."dialogueId" IS NULL
    AND l."comprehensionId" IS NULL AND l."phraseCollectionId" IS NULL`);
for (const e of empty) if (e.mactive) P('курс', `дарси «${e.title}» на калима дорад, на ба чизе пайваст аст`);

// ── 6. Калимаҳо ─────────────────────────────────────────────────────────────
head('6. Калимаҳо');
const words = await q(`SELECT w.*, l.title AS lesson, l."titleTranslated" AS "lessonTg", l."skillType", l."isActive" AS lactive,
    m."isActive" AS mactive, m."titleTranslated" AS mtitle
  FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
  WHERE m."courseId"='${COURSE}' ORDER BY m."order", l."order", w."order"`);
const live = words.filter(w => w.mactive && w.lactive);
console.log(`калимаҳо: ${words.length} (ба хонанда мерасанд: ${live.length})`);

const cnt = (f) => live.filter(f).length;
const noAudio = cnt(w => !w.audioUrl?.trim());
const noIpa = cnt(w => !w.ipa?.trim());
const noIpaTj = cnt(w => !w.ipaTajik?.trim());
const noEx = cnt(w => !w.example?.trim());
const noExTr = cnt(w => !w.exampleTrans?.trim());
const noPos = cnt(w => !w.partOfSpeech?.trim());
const noEmoji = cnt(w => !w.emoji?.trim());
console.log(`  бе аудио: ${noAudio} · бе IPA: ${noIpa} · бе хониши тоҷикӣ: ${noIpaTj}`);
console.log(`  бе мисол: ${noEx} · бе тарҷумаи мисол: ${noExTr} · бе partOfSpeech: ${noPos} · бе эмоҷӣ: ${noEmoji}`);
if (noAudio) P('калима', `${noAudio} калима аудио надорад`);
if (noIpaTj) P('калима', `${noIpaTj} калима хониши тоҷикӣ надорад`);
if (noEx) P('калима', `${noEx} калима мисол надорад`);
if (noExTr) P('калима', `${noExTr} калима тарҷумаи мисол надорад`);
if (noIpa) P('калима', `${noIpa} калима IPA надорад`);
if (noPos) P('калима', `${noPos} калима partOfSpeech надорад (расм намоён намешавад — ниг. [[ramz-german]])`);

// Матни арабӣ дар ҷои арабӣ, тоҷикӣ дар ҷои тоҷикӣ.
let noTashkeel = 0;
for (const w of live) {
  if (!ARABIC.test(w.word)) P('калима', `«${w.word}» (${w.lesson}): матни арабӣ НЕСТ`);
  if (LATIN.test(w.word)) P('калима', `«${w.word}» (${w.lesson}): ҳарфи лотинӣ дар матни арабӣ`);
  if (CYRILLIC.test(w.word)) P('калима', `«${w.word}» (${w.lesson}): ҳарфи кириллӣ дар матни арабӣ`);
  if (w.example && !ARABIC.test(w.example)) P('калима', `«${w.word}»: мисол арабӣ нест («${w.example}»)`);
  if (ARABIC.test(w.translation)) P('калима', `«${w.word}»: тарҷума матни арабӣ дорад («${w.translation}»)`);
  if (RU_ONLY.test(w.translation)) P('имло', `«${w.word}» → «${w.translation}»: ҳарфи русӣ (ь/ъ/ы/щ/ц) дар тоҷикӣ`);
  if (w.exampleTrans && RU_ONLY.test(w.exampleTrans)) P('имло', `«${w.word}» мисол → «${w.exampleTrans}»: ҳарфи русӣ`);
  if (w.ipaTajik && !CYRILLIC.test(w.ipaTajik)) P('калима', `«${w.word}»: хониши тоҷикӣ кириллӣ нест («${w.ipaTajik}»)`);
  if (w.ipa && !/^\/.*\/$/.test(w.ipa.trim())) P('калима', `«${w.word}»: IPA дар қавс нест («${w.ipa}»)`);
  if (/\S {2,}\S/.test(w.translation) || /\S {2,}\S/.test(w.word)) P('матн', `«${w.word}»: фосилаи дукарата`);
  if (w.word.trim() !== w.word || w.translation.trim() !== w.translation) P('матн', `«${w.word}»: фосилаи изофӣ дар сар/охир`);
  if (!TASHKEEL.test(w.word)) noTashkeel++;
  // Аломати саволи арабӣ ؟ ва вергули арабӣ ، — на аломати лотинӣ.
  if (w.example?.includes('?')) P('матн', `«${w.word}»: мисол аломати саволи лотинӣ «?» дорад (бояд «؟»)`);
  if (w.example?.includes(';')) P('матн', `«${w.word}»: мисол «;» дорад (бояд «؛»)`);
}
const pctT = Math.round(100 * (live.length - noTashkeel) / (live.length || 1));
console.log(`  бо ҳаракат (ташкил): ${live.length - noTashkeel}/${live.length} = ${pctT}%`);
if (pctT < 80) P('калима', `танҳо ${pctT}% калима ҳаракат (َ ِ ُ) дорад — навомӯз матни беҳаракатро хонда наметавонад (${noTashkeel} калима)`);

// Такрор — машқ ду ҷавоби якхела медиҳад. Дарси навиштан қасдан такрор мекунад.
const uniqWords = live.filter(w => w.skillType !== 'writing');
const norm = s => stripHarakat(s).replace(/\s+/g, ' ').trim();
const dup0 = new Map();
// Айнан як хел навишта — такрори ҳақиқӣ.
const dupExact = new Map();
for (const w of uniqWords) dupExact.set(w.word.trim(), [...(dupExact.get(w.word.trim()) ?? []), w]);
for (const [k, arr] of dupExact) {
  if (arr.length > 1) P('калима', `такрори айнан «${k}» ×${arr.length} → ${arr.map(w => w.lessonTg).join(' | ')}`);
}
// Бе ҳаракат як хел — дар арабӣ ин ДУ калимаи гуногун буда метавонад
// (من «аз» ва مَن «кӣ»). Танҳо агар тарҷума ҳам бирасад, машқ вайрон мешавад.
for (const w of uniqWords) { const k = norm(w.word); dup0.set(k, [...(dup0.get(k) ?? []), w]); }
for (const [k, arr] of dup0) {
  if (arr.length < 2) continue;
  const tr = arr.map(w => w.translation.trim().toLowerCase());
  if (new Set(tr).size !== tr.length) P('калима', `«${k}»: калимаҳои бе ҳаракат якхела ва тарҷумаашон ҳам як → ${arr.map(w => w.lessonTg).join(' | ')}`);
}

// Машқи «интихоб» ба тарҷумаҳои ФАРҚКУНАНДА дар як дарс такя мекунад.
const perLesson = new Map();
for (const w of live) perLesson.set(w.lessonId, [...(perLesson.get(w.lessonId) ?? []), w]);
for (const [, arr] of perLesson) {
  const tr = arr.map(w => w.translation.trim().toLowerCase());
  if (new Set(tr).size !== tr.length) P('калима', `дарси «${arr[0].lessonTg}»: тарҷумаи такрорӣ (машқи интихоб вайрон мешавад)`);
  if (arr.length < 4 && arr[0].skillType === 'vocab') P('калима', `дарси «${arr[0].lessonTg}»: танҳо ${arr.length} калима — барои 4 варианти ҷавоб кам аст`);
}

// ── 7. Грамматика ───────────────────────────────────────────────────────────
head('7. Грамматика');
const gts = await q(`SELECT * FROM "GrammarTopic" WHERE "courseId"='${COURSE}' ORDER BY "order"`);
console.log(`мавзӯъҳо: ${gts.length}`);
for (const g of gts) {
  const [{ n: nEx }] = await q(`SELECT COUNT(*)::int n FROM "GrammarExample" WHERE "topicId"='${g.id}'`);
  const [{ n: nRl }] = await q(`SELECT COUNT(*)::int n FROM "GrammarRule" WHERE "topicId"='${g.id}'`);
  const [{ n: nEs }] = await q(`SELECT COUNT(*)::int n FROM "GrammarExercise" WHERE "topicId"='${g.id}'`);
  if (!g.explanation?.trim()) P('грамматика', `«${g.titleTranslated}»: тавзеҳ нест`);
  if (!g.titleTranslated?.trim()) P('грамматика', `«${g.title}»: тарҷумаи ном нест`);
  if (!nEx) P('грамматика', `«${g.titleTranslated}»: 0 мисол`);
  if (!nRl) P('грамматика', `«${g.titleTranslated}»: 0 қоида`);
  if (!nEs) P('грамматика', `«${g.titleTranslated}»: 0 машқ`);
  if (RU_ONLY.test(g.explanation ?? '')) P('имло', `грамматикаи «${g.titleTranslated}»: ҳарфи русӣ дар тавзеҳ`);
  const [{ n: nL }] = await q(`SELECT COUNT(*)::int n FROM "Lesson" WHERE "grammarTopicId"='${g.id}'`);
  if (!nL) P('грамматика', `«${g.titleTranslated}»: ба ҳеҷ дарс пайваст нест — хонанда онро НАМЕБИНАД`);
}
const gexs = await q(`SELECT e.*, t."titleTranslated" AS topic FROM "GrammarExercise" e JOIN "GrammarTopic" t ON e."topicId"=t.id WHERE t."courseId"='${COURSE}'`);
console.log(`машқҳо: ${gexs.length}`);
// Ҷойи ҷавоби дуруст. Экрани грамматика вариантҳоро НАМЕОМЕХТАД
// (grammar_topic_screen.dart: `ex.options.map(...)` бе shuffle) — пас тартиби
// база маҳз ҳамон тартибест, ки хонанда мебинад. Агар ҷавоб ҳамеша якум бошад,
// хонанда қоидаро не, балки ҷойро меомӯзад.
const answerPos = {};
for (const e of gexs) {
  const opts = (e.options ?? []).map(String);
  const isChoice = e.type !== 'reorder' && opts.length > 1;
  if (e.type === 'choose' && opts.length < 2) P('грамматика', `машқи «${e.topic}»: навъи choose, вале ${opts.length} вариант`);
  if (isChoice) {
    const i = opts.map(gnorm).indexOf(gnorm(e.answer));
    if (i < 0) P('грамматика', `машқи «${e.topic}»: ҷавоб «${e.answer}» дар вариантҳо нест`);
    else answerPos[i] = (answerPos[i] ?? 0) + 1;
    // Варианте, ки танҳо бо ҲАРАКАТ фарқ мекунад, хато НЕСТ: маҳз ҳамин
    // мавзӯи машқ аст ва барнома барои чунин рӯйхат ба муқоисаи сахт мегузарад
    // (grammar_models.dart → strictGrading). Танҳо айнан якхела хатост.
    if (new Set(opts.map(o => o.trim())).size !== opts.length) P('грамматика', `машқи «${e.topic}»: ду варианти АЙНАН якхела`);
  }
  // reorder: вариантҳо пораҳои ҷумлаанд — ҷамъашон бояд маҳз ҷавобро диҳад.
  if (e.type === 'reorder' && opts.length) {
    const a = gnorm(e.answer).split(' ').sort().join(' ');
    const b = opts.map(gnorm).join(' ').split(' ').filter(Boolean).sort().join(' ');
    if (a !== b) P('грамматика', `машқи reorder-и «${e.topic}»: аз пораҳо «${b}» мебарояд, вале ҷавоб «${a}»`);
  }
  if (!e.explanation?.trim()) P('грамматика', `машқи «${e.topic}» (${String(e.prompt).slice(0, 30)}…): тавзеҳ нест`);
  if (!e.promptTranslated?.trim()) P('грамматика', `машқи «${e.topic}» (${String(e.prompt).slice(0, 30)}…): тарҷума нест`);
  if (e.type === 'fill_blank' && !String(e.prompt).includes('_')) P('грамматика', `машқи «${e.topic}»: fill_blank аст, вале «___» надорад`);
}
const totChoice = Object.values(answerPos).reduce((a, b) => a + b, 0);
const pct1 = Math.round(100 * (answerPos[0] ?? 0) / (totChoice || 1));
console.log(`ҷойи ҷавоби дуруст: ${Object.entries(answerPos).map(([i, n]) => `в${+i + 1}=${n}`).join(' · ')} (аз ${totChoice})`);
if (pct1 > 45) P('грамматика', `${pct1}% ҷавобҳои дуруст ВАРИАНТИ ЯКУМанд (${answerPos[0]}/${totChoice}) — экран вариантҳоро намеомехтад, пас хонанда бе фикр «якум»-ро пахш карда мегузарад`);
const gexm = await q(`SELECT x.*, t."titleTranslated" AS topic FROM "GrammarExample" x JOIN "GrammarTopic" t ON x."topicId"=t.id WHERE t."courseId"='${COURSE}'`);
let gexNoAudio = 0;
for (const x of gexm) {
  if (!ARABIC.test(x.sentence)) P('грамматика', `мисоли «${x.topic}»: арабӣ нест («${x.sentence}»)`);
  if (!x.translation?.trim()) P('грамматика', `мисоли «${x.sentence}»: тарҷума нест`);
  if (x.highlight && !x.sentence.includes(x.highlight)) P('грамматика', `мисоли «${x.topic}»: highlight «${x.highlight}» дар ҷумла нест`);
  if (!x.audioUrl?.trim()) gexNoAudio++;
}
// Дар англисӣ ҳар 124 мисоли грамматика аудио дорад — хонанда ҷумларо мешунавад.
if (gexNoAudio) P('грамматика', `${gexNoAudio}/${gexm.length} мисол аудио надорад`);

// ── 8. Муколама ─────────────────────────────────────────────────────────────
head('8. Муколама');
const dls = await q(`SELECT * FROM "Dialogue" WHERE "courseId"='${COURSE}' ORDER BY "order"`);
console.log(`муколамаҳо: ${dls.length}`);
for (const d of dls) {
  const lines = await q(`SELECT * FROM "DialogueLine" WHERE "dialogueId"='${d.id}' ORDER BY "order"`);
  if (lines.length < 4) P('муколама', `«${d.titleTranslated}»: танҳо ${lines.length} сатр`);
  if (!d.scenario?.trim()) P('муколама', `«${d.titleTranslated}»: сенария (шарҳи вазъият) нест`);
  const [{ n: nL }] = await q(`SELECT COUNT(*)::int n FROM "Lesson" WHERE "dialogueId"='${d.id}'`);
  if (!nL) P('муколама', `«${d.titleTranslated}»: ба ҳеҷ дарс пайваст нест`);
  for (const ln of lines) {
    if (!ARABIC.test(ln.text)) P('муколама', `«${d.titleTranslated}» сатри ${ln.order}: арабӣ нест`);
    if (!ln.translation?.trim()) P('муколама', `«${d.titleTranslated}» сатри ${ln.order}: тарҷума нест`);
    if (!ln.speaker?.trim()) P('муколама', `«${d.titleTranslated}» сатри ${ln.order}: ном (speaker) нест`);
    if (RU_ONLY.test(ln.translation ?? '')) P('имло', `муколамаи «${d.titleTranslated}» сатри ${ln.order}: ҳарфи русӣ`);
  }
  // Бе сатри isUser нақшбозӣ (DialogueRolePlayScreen) микрофонро ҲЕҶ ГОҲ
  // намепурсад — хонанда танҳо гӯш мекунад, гап намезанад.
  if (!lines.some(l => l.isUser)) P('муколама', `«${d.titleTranslated}» (${lines.length} сатр): ҳеҷ сатри «ман» нест → дар машқи гап задан МИКРОФОН намебарояд`);
  const noAud = lines.filter(l => !l.audioUrl?.trim()).length;
  if (noAud) P('муколама', `«${d.titleTranslated}»: ${noAud}/${lines.length} сатр аудио надорад`);
}
const dTitles = new Map();
for (const d of dls) dTitles.set(d.titleTranslated?.trim() ?? '', (dTitles.get(d.titleTranslated?.trim() ?? '') ?? 0) + 1);
for (const [t, n] of dTitles) if (n > 1) P('муколама', `унвони такрорӣ «${t}» ×${n} — дар роҳнамо чанд дарс як ном мебинад`);

// ── 9. Матни хониш ──────────────────────────────────────────────────────────
head('9. Матни хониш (ComprehensionExercise)');
const cms = await q(`SELECT * FROM "ComprehensionExercise" WHERE "courseId"='${COURSE}' ORDER BY "order"`);
console.log(`матнҳо: ${cms.length}`);
const cmTitles = new Map();
const cIdx = {};
// Матни бе аудио = хонанда талаффузро намешунавад. Дар англисӣ 0/48 бе аудио.
const cmNoAudio = cms.filter(c => !c.audioUrl?.trim());
if (cmNoAudio.length) P('хониш', `${cmNoAudio.length}/${cms.length} матн аудио надорад → ${cmNoAudio.slice(0, 6).map(c => `«${c.titleTranslated}»`).join(' · ')}${cmNoAudio.length > 6 ? ' …' : ''}`);
for (const c of cms) {
  const qs = await q(`SELECT * FROM "ComprehensionQuestion" WHERE "exerciseId"='${c.id}' ORDER BY "order"`);
  if (!qs.length) P('хониш', `«${c.titleTranslated}»: 0 савол`);
  if (!ARABIC.test(c.passage ?? '')) P('хониш', `«${c.titleTranslated}»: матн арабӣ нест`);
  if (!c.passageTranslated?.trim()) P('хониш', `«${c.titleTranslated}»: тарҷумаи матн нест`);
  cmTitles.set(c.titleTranslated?.trim() ?? '', (cmTitles.get(c.titleTranslated?.trim() ?? '') ?? 0) + 1);
  const [{ n: nL }] = await q(`SELECT COUNT(*)::int n FROM "Lesson" WHERE "comprehensionId"='${c.id}'`);
  if (!nL) P('хониш', `«${c.titleTranslated}»: ба ҳеҷ дарс пайваст нест`);
  for (const x of qs) {
    // Ҷавоб бо correctIndex нишон дода мешавад, на бо матн.
    const opts = (x.options ?? []).map(String);
    if (opts.length < 2) P('хониш', `«${c.titleTranslated}»: саволе бо ${opts.length} вариант`);
    if (x.correctIndex < 0 || x.correctIndex >= opts.length) P('хониш', `«${c.titleTranslated}»: correctIndex=${x.correctIndex} берун аз ${opts.length} вариант`);
    else cIdx[x.correctIndex] = (cIdx[x.correctIndex] ?? 0) + 1;
    // Ин ҷо интихоб аз рӯи РАҚАМи ҷой меравад (correctIndex), пас фарқи ҳаракат
    // машқро вайрон намекунад — танҳо матни айнан якхела хатост.
    if (opts.length && new Set(opts.map(o => o.trim())).size !== opts.length) P('хониш', `«${c.titleTranslated}»: ду варианти АЙНАН якхела`);
    if (!x.question?.trim()) P('хониш', `«${c.titleTranslated}»: савол холӣ`);
    if (!x.explanation?.trim()) P('хониш', `«${c.titleTranslated}»: савол тавзеҳ надорад`);
  }
}
for (const [t, n] of cmTitles) if (n > 1) P('хониш', `унвони матни такрорӣ «${t}» ×${n} — хонанда ҳамин унвонро дар рӯйхати дарсҳо мебинад`);
const totC = Object.values(cIdx).reduce((a, b) => a + b, 0);
const pctC1 = Math.round(100 * (cIdx[0] ?? 0) / (totC || 1));
console.log(`ҷойи ҷавоби дуруст: ${Object.entries(cIdx).map(([i, n]) => `в${+i + 1}=${n}`).join(' · ')} (аз ${totC})`);
if (pctC1 > 45) P('хониш', `${pctC1}% ҷавобҳо ВАРИАНТИ ЯКУМанд (${cIdx[0]}/${totC}) — экрани хониш ҳам вариантҳоро намеомехтад`);

// ── 10. Аудио ───────────────────────────────────────────────────────────────
head('10. Аудио');
const withAudio = live.filter(w => w.audioUrl?.trim());
const urls = withAudio.map(w => w.audioUrl);
const atMain = urls.filter(u => u.includes('@main')).length;
if (atMain) P('аудио', `${atMain} URL ба «@main» ишора мекунад (бояд commit-и қуфлшуда бошад — кэши jsDelivr)`);
const shared = new Map();
for (const w of withAudio) shared.set(w.audioUrl, [...(shared.get(w.audioUrl) ?? []), w]);
for (const [u, arr] of shared) {
  if (arr.length > 1 && new Set(arr.map(w => norm(w.word))).size > 1)
    P('аудио', `як файл барои калимаҳои гуногун: ${arr.map(w => w.word).join(' / ')}`);
}
const badName = withAudio.filter(w => !w.audioUrl.includes(w.id)).length;
if (badName) P('аудио', `${badName} URL номи файлаш ба id-и калима мувофиқ нест`);
console.log(`бо аудио: ${withAudio.length} · @main: ${atMain} · номи файл≠id: ${badName}`);

if (WITH_AUDIO) {
  console.log('боргирӣ ва ченкунӣ… (ин чанд дақиқа мегирад)');
  let dead = 0, done = 0;
  const meas = [];
  await pool(withAudio, 12, async (w) => {
    try {
      const r = await fetch(w.audioUrl);
      if (!r.ok) { dead++; P('аудио', `${w.word}: HTTP ${r.status}`); return; }
      const dur = mp3Duration(Buffer.from(await r.arrayBuffer()));
      meas.push({ w, dur, n: arLetters(w.word) });
    } catch (e) { dead++; P('аудио', `${w.word}: боргирӣ нашуд (${e.message})`); }
    if (++done % 100 === 0) process.stdout.write(`  ${done}/${withAudio.length}\r`);
  });
  // Модели интизорӣ аз ХУДИ маҷмӯа гирифта мешавад (миёнаи ҳар дарозии ҳарф),
  // на аз рақами дастӣ — овоз ва суръати сабт дар ҳар забон дигар аст.
  const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  const byLen = new Map();
  for (const m of meas) byLen.set(m.n, [...(byLen.get(m.n) ?? []), m.dur]);
  const model = new Map([...byLen].map(([n, arr]) => [n, median(arr)]));
  const overall = median(meas.map(m => m.dur));
  let bad = 0;
  for (const m of meas) {
    const exp = (byLen.get(m.n)?.length ?? 0) >= 5 ? model.get(m.n) : overall;
    if (m.dur < 0.25) { bad++; P('аудио', `${m.w.word} (${m.w.lessonTg}): клип ${m.dur.toFixed(2)}с — қариб холӣ`); continue; }
    const ratio = m.dur / (exp || 1);
    if (ratio < 0.45 || ratio > 2.3) { bad++; P('аудио', `${m.w.word} (${m.w.lessonTg}): ${m.dur.toFixed(2)}с, интизор ~${exp.toFixed(2)}с (нисбат ${ratio.toFixed(2)})`); }
  }
  console.log(`\nчен шуд: ${meas.length} · дастнорас: ${dead} · дарозии шубҳанок: ${bad}`);
  console.log(`миёнаи умумӣ: ${overall.toFixed(2)}с · модел аз рӯи шумораи ҳарф: ${[...model].sort((a, b) => a[0] - b[0]).slice(0, 12).map(([n, d]) => `${n}ҳ=${d.toFixed(2)}`).join(' ')}`);
} else {
  console.log('(--audio надодед: дастрасӣ ва давомнокӣ санҷида НАШУД)');
}

// ── 10б. Расм ───────────────────────────────────────────────────────────────
// Барнома расмро аз рӯи НОМИ ФАЙЛ мегирад: images/ar/<калид>.png, манифест нест.
// Калид дар course_roadmap_screen.dart → _normImageKey сохта мешавад ва он
// ҳаракату татвилро ТОЗА мекунад («رَجُل» → «رجل»), пас калимаи ҳаракатдор ҳам
// файли худро меёбад. (`_pickWordKey`-и unit_lesson_screen ҳаракатро намепартояд,
// вале он танҳо барои рӯйхати истисноҳои англисӣ/русӣ кор мекунад, на барои URL.)
head('10б. Расм');
let cdnFiles = null;
try {
  const tree = await (await fetch('https://api.github.com/repos/kholzoda2001-coder/ramz-audio/git/trees/main?recursive=1')).json();
  cdnFiles = new Set((tree.tree ?? []).filter(t => t.path.startsWith('images/ar/'))
    .map(t => t.path.replace('images/ar/', '').replace(/\.png$/, '')));
} catch { P('расм', 'рӯйхати файлҳои CDN гирифта нашуд'); }
// Рӯйхати холӣ = GitHub API маҳдудияти дархост дод, на он ки расм нест.
if (cdnFiles && !cdnFiles.size) { console.log('⚠ GitHub API рӯйхати холӣ дод (rate limit) — санҷиши расм гузаронда шуд'); cdnFiles = null; }
if (cdnFiles) {
  const pic = live.filter(w => (w.partOfSpeech ?? '').trim().toLowerCase() === 'noun' && (w.emoji ?? '').trim());
  let ok = 0, none = 0;
  const missByMod = new Map();
  for (const w of pic) {
    if (cdnFiles.has(normImageKey(w.word))) ok++;
    else { none++; missByMod.set(w.mtitle, (missByMod.get(w.mtitle) ?? 0) + 1); }
  }
  console.log(`файлҳои расми арабӣ дар CDN: ${cdnFiles.size}`);
  console.log(`исмҳои эмоҷидор: ${pic.length} · расм дорад: ${ok} · расм надорад: ${none}`);
  if (none) P('расм', `${none} исм расм надорад → ${[...missByMod].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([m, n]) => `${m}:${n}`).join(' · ')}`);
  // Файли ятим = расми ба ҳеҷ калима тааллуқнадошта.
  const used = new Set(pic.map(w => normImageKey(w.word)));
  const orphan = [...cdnFiles].filter(f => !used.has(f));
  if (orphan.length) console.log(`файли ятим (ба калима намерасад): ${orphan.length}`);
}

// ── 11. Он чи хонанда воқеан мегирад ────────────────────────────────────────
head('11. API-и мобилӣ');
try {
  const tg = await (await fetch(`${BASE}/api/mobile/languages/target?nativeLanguageId=${TG}`)).json();
  const list = tg.languages ?? tg ?? [];
  const ar = (Array.isArray(list) ? list : []).find(l => l.code === 'ar');
  console.log(`забонҳои дастрас: ${(Array.isArray(list) ? list : []).map(l => l.code).join(', ')}`);
  if (!ar) P('API', 'арабӣ дар рӯйхати забонҳои интихоб НЕСТ');
  else console.log(`✓ арабӣ намоён аст: ${ar.name ?? ar.nativeName} · курсҳо=${ar.courseCount ?? '?'}`);
} catch (e) { P('API', `languages/target ҷавоб надод: ${e.message}`); }

// ── ҶАМЪБАСТ ────────────────────────────────────────────────────────────────
head('ҶАМЪБАСТ');
if (!problems.length) console.log('✓ Ҳеҷ мушкил ёфт нашуд.');
else {
  const byArea = problems.reduce((a, p) => { const k = p.slice(1, p.indexOf(']')); a[k] = (a[k] ?? 0) + 1; return a; }, {});
  console.log(`${problems.length} мушкил: ${JSON.stringify(byArea)}\n`);
  for (const p of problems) console.log(`  • ${p}`);
}
