// Билдери B1 тавассути admin API (Neon хомӯш — ин боэътимод, дар Vercel назди DB).
// Ҳамон сохтори контенти b1-module-builder.mjs-ро мегирад. Идемпотент.
import { readFileSync } from 'fs';
import { SignJWT } from 'jose';

const ORIGIN = 'https://admin.ramz.tj';
const env = readFileSync('.env', 'utf8');
const SECRET = (env.match(/^\s*JWT_SECRET\s*=\s*"?([^"\n\r]+)/m) || [])[1];
if (!SECRET) throw new Error('JWT_SECRET нест');
let TOKEN;
const token = async () => (TOKEN ??= await new SignJWT({ username: 'admin', role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('24h').sign(new TextEncoder().encode(SECRET)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function req(method, path, body) {
  const t = await token();
  for (let a = 0; a < 5; a++) {
    try {
      const r = await fetch(ORIGIN + path, { method, headers: { 'Content-Type': 'application/json', Cookie: 'admin_token=' + t }, body: body ? JSON.stringify(body) : undefined });
      if (r.ok) return r.json().catch(() => ({}));
      if (r.status >= 500 || r.status === 429) { await sleep(1500 * (a + 1)); continue; }
      throw new Error(`${method} ${path} → ${r.status} ${(await r.text()).slice(0, 140)}`);
    } catch (e) { if (a === 4) throw e; await sleep(1500); }
  }
}
const mob = async (p) => { const r = await fetch(ORIGIN + '/api/mobile' + p); if (!r.ok) throw new Error('mob ' + p + ' ' + r.status); return r.json(); };

export const W = (word, ipa, ipaTajik, translation, emoji, example, exampleTrans, pos = 'noun') => ({ word, ipa, ipaTajik, translation, emoji, example, exampleTrans, pos });
const XP = { vocabulary: 15, grammar: 20, listening: 20, speaking: 20, reading: 20, writing: 15, review: 30, test: 50 };

export async function getCtx() {
  const nat = (await mob('/languages/native')).languages; const tg = nat.find((l) => l.code === 'tg');
  const tgt = (await mob('/languages/target?nativeLanguageId=' + tg.id)).languages; const en = tgt.find((l) => l.code === 'en');
  const courses = (await mob(`/courses?targetLanguageId=${en.id}&nativeLanguageId=${tg.id}`)).courses;
  const b1 = courses.find((c) => c.level === 'B1');
  if (!b1) throw new Error('B1 course нест');
  return { courseId: b1.id, b1 };
}

async function wipeModule(b1, title) {
  const m = b1.modules.find((x) => x.title === title);
  if (!m) return false;
  for (const stub of m.lessons) {
    let L; try { L = await mob('/lessons/' + stub.id); } catch { continue; }
    const c = (L.lesson || L).component;
    if (c && c.id) {
      if (c.type === 'grammar') await req('DELETE', `/api/admin/grammar/${c.id}`).catch(() => {});
      else if (c.type === 'dialogue') await req('DELETE', `/api/admin/dialogues/${c.id}`).catch(() => {});
      else if (c.type === 'comprehension') await req('DELETE', `/api/admin/comprehensions/${c.id}`).catch(() => {});
    }
  }
  await req('DELETE', `/api/admin/modules/${m.id}`).catch(() => {});
  return true;
}

async function makeWords(lessonId, words, rankStart) {
  let i = 0;
  for (const w of words) {
    await req('POST', '/api/admin/words', { lessonId, word: w.word, translation: w.translation, ipa: w.ipa, ipaTajik: w.ipaTajik, emoji: w.emoji, example: w.example, exampleTrans: w.exampleTrans, partOfSpeech: w.pos, frequencyRank: rankStart + i, order: i });
    i++;
  }
}

// order0 = 0-based module order (роадмап бефосила)
export async function buildViaApi(M, ctx) {
  const { courseId, b1 } = ctx;
  await wipeModule(b1, M.title);
  const { module } = await req('POST', '/api/admin/modules', { courseId, title: M.title, titleTranslated: M.titleTranslated, emoji: M.emoji, color: M.color, order: M.order0 });
  const moduleId = module.id;
  let order = 0; let rank = 6000 + M.order0 * 100;

  for (const d of M.vocab) {
    const { lesson } = await req('POST', '/api/admin/lessons', { moduleId, title: d.title, titleTranslated: d.tt, type: 'vocab', skillType: 'vocabulary', cefrLevel: 'B1', emoji: d.emoji, xpReward: XP.vocabulary, duration: 5, order: order++ });
    await makeWords(lesson.id, d.words, rank); rank += d.words.length;
  }
  for (const g of M.grammar) {
    const { topic } = await req('POST', '/api/admin/grammar', { courseId, cefrLevel: 'B1', title: g.title, titleTranslated: g.titleTranslated, explanation: g.explanation, emoji: g.emoji });
    if (g.rules?.length) await req('POST', '/api/admin/import', { type: 'grammar_rules', parentId: topic.id, mode: 'replace', items: g.rules });
    if (g.examples?.length) await req('POST', '/api/admin/import', { type: 'grammar_examples', parentId: topic.id, mode: 'replace', items: g.examples });
    if (g.exercises?.length) await req('POST', '/api/admin/import', { type: 'grammar_exercises', parentId: topic.id, mode: 'replace', items: g.exercises });
    await req('POST', '/api/admin/lessons', { moduleId, title: g.lessonTitle, titleTranslated: g.lessonTitleTg, type: 'grammar', skillType: 'grammar', cefrLevel: 'B1', emoji: g.emoji, xpReward: XP.grammar, duration: 5, order: order++, linkType: 'grammar', linkId: topic.id });
  }
  const comp = async (d, kind, skill, emoji, lt, ltg) => {
    const { comprehension } = await req('POST', '/api/admin/comprehensions', { courseId, cefrLevel: 'B1', kind, title: d.title, titleTranslated: d.titleTranslated, passage: d.passage, passageTranslated: d.passageTranslated, emoji });
    if (d.questions?.length) await req('POST', '/api/admin/import', { type: 'comprehension_questions', parentId: comprehension.id, mode: 'replace', items: d.questions });
    await req('POST', '/api/admin/lessons', { moduleId, title: lt, titleTranslated: ltg, type: 'quiz', skillType: skill, cefrLevel: 'B1', emoji, xpReward: XP[skill] || 20, duration: 5, order: order++, linkType: 'comprehension', linkId: comprehension.id });
  };
  await comp(M.listening, 'listening', 'listening', '🎧', M.listening.lessonTitle, M.listening.lessonTitleTg);

  const { dialogue } = await req('POST', '/api/admin/dialogues', { courseId, cefrLevel: 'B1', title: M.dialogue.title, titleTranslated: M.dialogue.titleTranslated, scenario: M.dialogue.scenario, emoji: M.dialogue.emoji });
  await req('POST', '/api/admin/import', { type: 'dialogue_lines', parentId: dialogue.id, mode: 'replace', items: M.dialogue.lines });
  await req('POST', '/api/admin/lessons', { moduleId, title: M.dialogue.lessonTitle, titleTranslated: M.dialogue.lessonTitleTg, type: 'vocab', skillType: 'speaking', cefrLevel: 'B1', emoji: '🗣️', xpReward: XP.speaking, duration: 5, order: order++, linkType: 'dialogue', linkId: dialogue.id });

  await comp(M.reading, 'reading', 'reading', '📖', M.reading.lessonTitle, M.reading.lessonTitleTg);

  // writing — reuse 8 words of the module (auto-synthesize if not authored)
  const writing = M.writing || { title: 'Lesson 10: Writing Practice', tt: 'Дарси 10: Машқи навиштан', words: M.vocab.flatMap((v) => v.words).slice(0, 8) };
  {
    const { lesson } = await req('POST', '/api/admin/lessons', { moduleId, title: writing.title, titleTranslated: writing.tt, type: 'vocab', skillType: 'writing', cefrLevel: 'B1', emoji: '✍️', xpReward: XP.writing, duration: 5, order: order++ });
    await makeWords(lesson.id, writing.words, rank); rank += writing.words.length;
  }

  await comp({ ...M.review, title: 'Module Review', titleTranslated: 'Такрори модул' }, 'reading', 'review', '📝', 'Дарси 11: Такрори модул', 'Дарси 11: Такрори модул');
  await comp({ ...M.exam, title: 'Final Exam', titleTranslated: 'Имтиҳони ниҳоӣ' }, 'reading', 'test', '🏆', 'Дарси 12: Имтиҳони ниҳоӣ', 'Дарси 12: Имтиҳони ниҳоӣ');

  console.log(`  ✅ M${M.order0} "${M.titleTranslated}": ${order} дарс`);
  return { moduleId, lessons: order };
}
