// Мазмуни ПУРРАИ Модули 1-и арабии A1 — барои симулятсияи «студентҳои рақамӣ».
//
// Компонентҳо (грамматика/муколама/ибора/хониш) маҳз аз рӯи ПАЙВАСТИ дарс
// гирифта мешаванд (`Lesson.grammarTopicId` ва ғ.), на аз рӯи курс — вагарна
// гузориш мазмунеро месанҷид, ки хонанда дар ин модул умуман намебинад.
//
//   node prisma/_dump-ar-m1.mjs > tmp/ar-a1-m1.json
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);

const [course] = await sql.query(`
  SELECT c.id, c.level, c.title, c.description
    FROM "Course" c
    JOIN "Language" t ON t.id = c."targetLanguageId"
    JOIN "Language" n ON n.id = c."nativeLanguageId"
   WHERE t.code = 'ar' AND n.code = 'tg' AND c.level = 'A1'`);

const [mod] = await sql.query(
  `SELECT id, "order", title, "titleTranslated", emoji, "canDoStatement", "isActive", "isPremium"
     FROM "Module" WHERE "courseId" = $1 ORDER BY "order" LIMIT 1`, [course.id]);

const lessons = await sql.query(
  `SELECT id, "order", type, "skillType", title, "titleTranslated", emoji,
          "xpReward", duration, "isActive", "isPremium",
          "grammarTopicId", "phraseCollectionId", "dialogueId", "comprehensionId"
     FROM "Lesson" WHERE "moduleId" = $1 ORDER BY "order"`, [mod.id]);

for (const l of lessons) {
  l.words = await sql.query(
    `SELECT "order", word, translation, emoji, ipa, "ipaTajik", example,
            "exampleTrans", "audioUrl", "partOfSpeech", difficulty
       FROM "Word" WHERE "lessonId" = $1 ORDER BY "order"`, [l.id]);

  if (l.grammarTopicId) {
    const [g] = await sql.query(
      `SELECT id, title, "titleTranslated", explanation, emoji
         FROM "GrammarTopic" WHERE id = $1`, [l.grammarTopicId]);
    if (g) {
      g.examples = await sql.query(
        `SELECT "order", sentence, translation, highlight FROM "GrammarExample"
          WHERE "topicId" = $1 ORDER BY "order"`, [g.id]);
      g.rules = await sql.query(
        `SELECT "order", pattern, note FROM "GrammarRule"
          WHERE "topicId" = $1 ORDER BY "order"`, [g.id]);
      g.exercises = await sql.query(
        `SELECT "order", type, prompt, "promptTranslated", options, answer, explanation
           FROM "GrammarExercise" WHERE "topicId" = $1 ORDER BY "order"`, [g.id]);
      l.grammar = g;
    }
  }
  if (l.dialogueId) {
    const [d] = await sql.query(
      `SELECT id, title, "titleTranslated" FROM "Dialogue" WHERE id = $1`, [l.dialogueId]);
    if (d) {
      d.lines = await sql.query(
        `SELECT "order", speaker, text, translation, "isUser", "audioUrl"
           FROM "DialogueLine" WHERE "dialogueId" = $1 ORDER BY "order"`, [d.id]);
      l.dialogue = d;
    }
  }
  if (l.phraseCollectionId) {
    const [p] = await sql.query(
      `SELECT id, title, "titleTranslated" FROM "PhraseCollection" WHERE id = $1`, [l.phraseCollectionId]);
    if (p) {
      p.items = await sql.query(
        `SELECT "order", phrase, translation, transcription FROM "Phrase"
          WHERE "collectionId" = $1 ORDER BY "order"`, [p.id]);
      l.phrases = p;
    }
  }
  if (l.comprehensionId) {
    const [c2] = await sql.query(
      `SELECT id, kind, title, "titleTranslated", passage, "passageTranslated"
         FROM "ComprehensionExercise" WHERE id = $1`, [l.comprehensionId]);
    if (c2) {
      c2.questions = await sql.query(
        `SELECT "order", question, "questionTranslated", options, "correctIndex", explanation
           FROM "ComprehensionQuestion" WHERE "exerciseId" = $1 ORDER BY "order"`, [c2.id]);
      l.comprehension = c2;
    }
  }
}

const alphabet = await sql.query(`
  SELECT a.uppercase, a.lowercase, a.ipa, a."tajikTranscription", a.category, a."order",
         coalesce(a."audioUrl",'') <> '' AS has_audio
    FROM "AlphabetLetter" a JOIN "Language" t ON t.id = a."targetLanguageId"
   WHERE t.code = 'ar' ORDER BY a."order"`);

const rules = await sql.query(`
  SELECT r.category, r.title, r.body, r."order"
    FROM "AlphabetRule" r JOIN "Language" t ON t.id = r."targetLanguageId"
   WHERE t.code = 'ar' ORDER BY r."order"`);

const n = (k) => lessons.reduce((a, l) => a + (l[k] ? 1 : 0), 0);
console.error(`Курс: ${course.title}`);
console.error(`Модул ${mod.order}: ${mod.titleTranslated} (${mod.title}) ${mod.emoji}`);
console.error(`  canDo: ${mod.canDoStatement ?? '(НЕСТ)'}`);
console.error(`Дарсҳо: ${lessons.length}`);
for (const l of lessons) {
  console.error(`  ${l.order}. [${l.skillType}] ${l.titleTranslated} — ${l.words.length} калима` +
    `${l.grammar ? ' +грамматика' : ''}${l.dialogue ? ' +муколама' : ''}` +
    `${l.phrases ? ' +ибора' : ''}${l.comprehension ? ' +хониш' : ''}`);
}
console.error(`Калимаҳо: ${lessons.reduce((a, l) => a + l.words.length, 0)} · ` +
  `бе аудио: ${lessons.reduce((a, l) => a + l.words.filter((w) => !w.audioUrl).length, 0)} · ` +
  `бе ipaTajik: ${lessons.reduce((a, l) => a + l.words.filter((w) => !w.ipaTajik).length, 0)}`);
console.error(`Алифбо: ${alphabet.length} ҳарф · ${rules.length} қоида`);

process.stdout.write(JSON.stringify({ course, module: mod, lessons, alphabet, rules }, null, 2));
