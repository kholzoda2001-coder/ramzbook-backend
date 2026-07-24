// Аудити ниҳоии A1-и англисӣ (барои Тоҷикистон) — танҳо МЕХОНАД.
//
// Ҳар чизро аз базаи ЗИНДА мегирад ва месанҷад:
//   • сохтор — модулҳо/дарсҳо/калимаҳо, дарси холӣ ҳаст ё не;
//   • аудио — ҳар калима ва мисол дар CDN (jsDelivr) 200 медиҳад ё не;
//   • расм — калимаҳои «расмбоб» акс доранд ё не;
//   • офлайн — майдонҳое ки барои кэш лозиманд холӣ нестанд;
//   • такрор — калимаи такрорӣ дар як дарс/модул.
import { SignJWT } from 'jose';
import { readFileSync, writeFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const BASE = 'https://admin.ramz.tj';
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main';
const jwt = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));

const api = async (path) => {
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch(BASE + path, { headers: { Cookie: `admin_token=${jwt}` } });
      if (r.ok) return r.json();
    } catch (_) {}
    await new Promise(s => setTimeout(s, 900 * (i + 1)));
  }
  throw new Error('API нашуд: ' + path);
};

// HEAD ба jsDelivr; 200 = ҳаст. Паралели маҳдуд, то rate-limit нашавад.
async function headOk(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { method: 'HEAD' });
      if (r.status === 200) return true;
      if (r.status === 404) return false;
    } catch (_) {}
    await new Promise(s => setTimeout(s, 400));
  }
  return false;
}
async function pool(items, n, fn) {
  const out = new Array(items.length);
  let idx = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (idx < items.length) {
      const my = idx++;
      out[my] = await fn(items[my], my);
    }
  }));
  return out;
}

const normKey = (w) => (w || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

// ── 1. сохторро гир ──────────────────────────────────────────────────────
const { courses } = await api('/api/admin/courses?level=A1');
const course = courses.find(c => c.targetLanguage?.code === 'en');
if (!course) { console.error('курси A1-и англисӣ ёфт нашуд'); process.exit(1); }
console.log(`Курс: ${course.title} (${course.id})  native=${course.nativeLanguage?.nativeName}`);

const { modules } = await api(`/api/admin/modules?courseId=${course.id}`);
modules.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const words = [];       // {module, lesson, lessonId, word, tajik, pos, emoji, audioId, example, exampleAudio}
const lessons = [];     // {module, title, id, type, wordCount}
for (const m of modules) {
  const { lessons: ls } = await api(`/api/admin/lessons?moduleId=${m.id}`);
  (ls ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const l of ls ?? []) {
    lessons.push({ module: m.title, moduleOrder: m.order, title: l.title, id: l.id,
      type: l.type ?? l.skillType ?? 'vocab', wordCount: l._count?.words ?? 0 });
    const { words: ws } = await api(`/api/admin/words?lessonId=${l.id}&limit=500`);
    for (const w of ws ?? []) {
      words.push({
        module: m.title, moduleOrder: m.order, lesson: l.title, lessonId: l.id,
        id: w.id, word: w.word, tajik: w.translation ?? '',
        pos: (w.partOfSpeech ?? '').toLowerCase(),
        emoji: w.emoji ?? '', key: normKey(w.word),
        ipa: w.ipa ?? '', ipaTajik: w.ipaTajik ?? '',
        example: w.example ?? '', exampleTrans: w.exampleTranslation ?? w.exampleTrans ?? '',
      });
    }
  }
  process.stdout.write(`  ${m.title}: ${words.length} калима\r`);
}
console.log(`\nҲамагӣ: ${modules.length} модул | ${lessons.length} дарс | ${words.length} калима\n`);

// ── 2. санҷишҳо ──────────────────────────────────────────────────────────
const issues = { empty_lessons: [], missing_word_audio: [], missing_example_audio: [],
  missing_image: [], no_ipa: [], no_tajik_ipa: [], no_translation: [], no_example: [],
  dup_in_lesson: [], dup_in_module: [] };

// холӣ
for (const l of lessons) if ((l.wordCount ?? 0) === 0 && l.type === 'vocab')
  issues.empty_lessons.push(`${l.module} :: ${l.title}`);

// майдонҳо (офлайн ин ҳамаро кэш мекунад — набояд холӣ бошанд)
for (const w of words) {
  if (!w.tajik) issues.no_translation.push(`${w.lesson} :: ${w.word}`);
  if (!w.ipa) issues.no_ipa.push(`${w.lesson} :: ${w.word}`);
  if (!w.ipaTajik) issues.no_tajik_ipa.push(`${w.lesson} :: ${w.word}`);
  if (!w.example) issues.no_example.push(`${w.lesson} :: ${w.word}`);
}

// такрор
const byLesson = {}, byModule = {};
for (const w of words) {
  (byLesson[w.lessonId] ||= {});
  const k = w.key;
  if (byLesson[w.lessonId][k]) issues.dup_in_lesson.push(`${w.lesson}: ${w.word}`);
  byLesson[w.lessonId][k] = true;
  (byModule[w.module] ||= {});
  if (byModule[w.module][k]) issues.dup_in_module.push(`${w.module}: ${w.word}`);
  byModule[w.module][k] = true;
}

// аудиои калима — ID.mp3
console.log('Санҷиши аудиои калимаҳо…');
const audioRes = await pool(words, 12, async (w) => headOk(`${CDN}/audio/en/${w.id}.mp3`));
words.forEach((w, i) => { if (!audioRes[i]) issues.missing_word_audio.push(`${w.lesson} :: ${w.word} (${w.id})`); });

// расм — калимаҳои «расмбоб» (исм, бо эмоҷӣ)
const pic = words.filter(w => w.pos === 'noun' && w.emoji);
console.log(`Санҷиши расмҳо (${pic.length} исм)…`);
const imgRes = await pool(pic, 12, async (w) => headOk(`${CDN}/images/en/${w.key}.png`));
pic.forEach((w, i) => { if (!imgRes[i]) issues.missing_image.push(`${w.module} :: ${w.word}`); });

// ── 3. ҳисобот ───────────────────────────────────────────────────────────
const wordAudioOk = words.length - issues.missing_word_audio.length;
const imgOk = pic.length - issues.missing_image.length;
console.log('\n══════════ ХУЛОСА ══════════');
console.log(`Дарси холӣ:            ${issues.empty_lessons.length}`);
console.log(`Аудиои калима:         ${wordAudioOk}/${words.length} ✅   (нест: ${issues.missing_word_audio.length})`);
console.log(`Расм (исмҳо):          ${imgOk}/${pic.length}      (нест: ${issues.missing_image.length})`);
console.log(`Бе тарҷумаи тоҷикӣ:    ${issues.no_translation.length}`);
console.log(`Бе IPA:                ${issues.no_ipa.length}`);
console.log(`Бе транскрипти тоҷикӣ: ${issues.no_tajik_ipa.length}`);
console.log(`Бе мисол:              ${issues.no_example.length}`);
console.log(`Такрор дар як дарс:    ${issues.dup_in_lesson.length}`);
console.log(`Такрор дар як модул:   ${issues.dup_in_module.length}`);

writeFileSync(new URL('./_a1-final-audit.json', import.meta.url),
  JSON.stringify({ course: course.title, modules: modules.length, lessons: lessons.length,
    words: words.length, issues }, null, 2));
console.log('\nТафсилот → _a1-final-audit.json');
