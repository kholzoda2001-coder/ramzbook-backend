// Мазмуни ПУРРАИ як модули арабии A1 — барои симулятсияи «студентҳои рақамӣ».
//
// Умумӣ шуд: рақами модул аргумент аст, пас ҳамин як файл ба ҳамаи 12 модул
// кор мекунад (`_dump-ar-m1.mjs` танҳо ба якум мезад).
//
//   node prisma/_ar-mod-dump.mjs 1 > tmp/ar-a1-m2.json
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const ORDER = Number(process.argv[2] ?? 0);

const [course] = await sql.query(`
  SELECT c.id, c.level, c.title FROM "Course" c
    JOIN "Language" t ON t.id = c."targetLanguageId"
    JOIN "Language" n ON n.id = c."nativeLanguageId"
   WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);

const [mod] = await sql.query(
  `SELECT id, "order", title, "titleTranslated", emoji, "canDoStatement",
          "isActive", "isPremium", "contentVersion"
     FROM "Module" WHERE "courseId"=$1 AND "order"=$2`, [course.id, ORDER]);
if (!mod) { console.error(`Модули №${ORDER} нест`); process.exit(1); }

const lessons = await sql.query(
  `SELECT id, "order", type, "skillType", title, "titleTranslated", emoji,
          "xpReward", duration, "isActive", "isPremium",
          "grammarTopicId", "phraseCollectionId", "dialogueId", "comprehensionId"
     FROM "Lesson" WHERE "moduleId"=$1 ORDER BY "order"`, [mod.id]);

for (const l of lessons) {
  l.words = await sql.query(
    `SELECT id, "order", word, translation, emoji, ipa, "ipaTajik", example,
            "exampleTrans", "audioUrl", "partOfSpeech", difficulty
       FROM "Word" WHERE "lessonId"=$1 ORDER BY "order"`, [l.id]);

  if (l.grammarTopicId) {
    const [g] = await sql.query(
      `SELECT id, title, "titleTranslated", explanation, emoji
         FROM "GrammarTopic" WHERE id=$1`, [l.grammarTopicId]);
    if (g) {
      g.examples = await sql.query(
        `SELECT "order", sentence, translation, highlight, "audioUrl"
           FROM "GrammarExample" WHERE "topicId"=$1 ORDER BY "order"`, [g.id]);
      g.rules = await sql.query(
        `SELECT "order", pattern, note FROM "GrammarRule" WHERE "topicId"=$1 ORDER BY "order"`, [g.id]);
      g.exercises = await sql.query(
        `SELECT "order", type, prompt, "promptTranslated", options, answer, explanation
           FROM "GrammarExercise" WHERE "topicId"=$1 ORDER BY "order"`, [g.id]);
      l.grammar = g;
    }
  }
  if (l.dialogueId) {
    const [d] = await sql.query(`SELECT id, title, "titleTranslated" FROM "Dialogue" WHERE id=$1`, [l.dialogueId]);
    if (d) {
      d.lines = await sql.query(
        `SELECT "order", speaker, text, translation, "isUser", "audioUrl"
           FROM "DialogueLine" WHERE "dialogueId"=$1 ORDER BY "order"`, [d.id]);
      l.dialogue = d;
    }
  }
  if (l.phraseCollectionId) {
    const [p] = await sql.query(`SELECT id, title, "titleTranslated" FROM "PhraseCollection" WHERE id=$1`, [l.phraseCollectionId]);
    if (p) {
      p.items = await sql.query(
        `SELECT "order", phrase, translation, transcription FROM "Phrase"
          WHERE "collectionId"=$1 ORDER BY "order"`, [p.id]);
      l.phrases = p;
    }
  }
  if (l.comprehensionId) {
    const [c2] = await sql.query(
      `SELECT id, kind, title, "titleTranslated", passage, "passageTranslated", "audioUrl"
         FROM "ComprehensionExercise" WHERE id=$1`, [l.comprehensionId]);
    if (c2) {
      c2.questions = await sql.query(
        `SELECT "order", question, "questionTranslated", options, "correctIndex", explanation
           FROM "ComprehensionQuestion" WHERE "exerciseId"=$1 ORDER BY "order"`, [c2.id]);
      l.comprehension = c2;
    }
  }
}

const words = lessons.flatMap((l) => l.words);
console.error(`Модул ${mod.order}: ${mod.titleTranslated} (${mod.title}) ${mod.emoji} · v${mod.contentVersion}`);
console.error(`  canDo: ${mod.canDoStatement ?? '(НЕСТ)'}`);
console.error(`Дарсҳо: ${lessons.length}`);
for (const l of lessons) {
  console.error(`  ${l.order}. [${l.skillType}] ${l.titleTranslated} — ${l.words.length} калима` +
    `${l.grammar ? ' +грамматика' : ''}${l.dialogue ? ' +муколама' : ''}` +
    `${l.phrases ? ' +ибора' : ''}${l.comprehension ? ' +' + l.comprehension.kind : ''}`);
}
console.error(`Калимаҳо: ${words.length} · бе аудио: ${words.filter((w) => !w.audioUrl).length} · ` +
  `бе ipaTajik: ${words.filter((w) => !w.ipaTajik).length} · бе эмоҷӣ: ${words.filter((w) => !w.emoji).length}`);

process.stdout.write(JSON.stringify({ course, module: mod, lessons }, null, 2));
