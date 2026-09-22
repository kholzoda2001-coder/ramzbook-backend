import { SignJWT } from 'jose';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const CONTENT = process.argv[2];
if (!CONTENT) { console.error('Error: specify content file'); process.exit(1); }
const { MODULE, VOCAB, GRAMMAR, COMPREHENSIONS, DIALOGUE, WRITING, ORDER } = await import(CONTENT);

let _n = 0;
const cuid = () => 'c' + Date.now().toString(36) + (_n++).toString(36).padStart(3, '0') + Math.random().toString(36).slice(2, 10);

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const BASE = 'http://localhost:3000/api/admin';
const DRY = process.argv.includes('--dry');
const WORK = `tmp/zh-m${MODULE.order + 1}-audio`;

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

async function api(path, method = 'POST', body) {
  if (DRY && method !== 'GET') return { id: 'dry-run-id' };
  const url = path.startsWith('http') ? path : `${BASE}/${path}`;
  const res = await fetch(url, {
    method, headers: H, body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`\n❌ API Error (${method} ${path}):\n${res.status} ${res.statusText}\n${text}`);
    if (body) console.log('Payload:', JSON.stringify(body, null, 2));
    process.exit(1);
  }
  return res.json();
}

async function main() {
  const zh = await sql`SELECT id FROM "Language" WHERE code = 'zh'`;
  const tg = await sql`SELECT id FROM "Language" WHERE code = 'tg'`;
  const zhId = zh[0].id;
  const tgId = tg[0].id;

  const course = (await sql`SELECT id FROM "Course" WHERE "targetLanguageId" = ${zhId} AND "nativeLanguageId" = ${tgId} AND level = 'A1'`)[0];
  if (!course) return console.log("A1 course not found");

  if (!DRY) {
    const old = await sql`SELECT id FROM "Module" WHERE "courseId" = ${course.id} AND "order" = ${MODULE.order}`;
    if (old.length) {
      await sql`DELETE FROM "UserProgress" WHERE "lessonId" IN (SELECT id FROM "Lesson" WHERE "moduleId" = ${old[0].id})`;
      await sql`DELETE FROM "Module" WHERE id = ${old[0].id}`;
      console.log('Old module and its progress deleted.');
    }
  }

  console.log(`Creating Module ${MODULE.order + 1}...`);
  const modId = cuid();
  if (!DRY) {
    await sql`
      INSERT INTO "Module" (id, "courseId", title, "titleTranslated", emoji, color, "order")
      VALUES (${modId}, ${course.id}, ${MODULE.title}, ${MODULE.titleTranslated}, ${MODULE.emoji}, '#DC2626', ${MODULE.order})
    `;
  }
  const mod = { id: modId };

  const allWords = [];
  const lessons = {};
  for (const [i, tag] of ORDER.entries()) {
    const [kind, ref] = tag.split(':');
    if (kind === 'vocab') {
      const v = VOCAB.find(x => x.title === ref);
      const { lesson: item } = await api('lessons', 'POST', { moduleId: mod.id, order: i, type: 'vocab', skillType: 'vocab', ...v });
      for (const [wi, w] of v.words.entries()) {
        const { word: resp } = await api('words', 'POST', {
          lessonId: item.id, word: w.word, translation: w.translation, emoji: w.emoji,
          ipa: w.ipa, ipaTajik: w.ipa, order: wi, example: w.example, exampleTrans: w.exampleTrans
        });
        allWords.push({ id: resp.id, text: w.word, emoji: w.emoji });
      }
      lessons[ref] = item.id;
    } else if (kind === 'grammar') {
      const g = GRAMMAR[parseInt(ref)];
      const { topic } = await api('grammar', 'POST', { courseId: course.id, order: MODULE.order * 10 + parseInt(ref), ...g });
      for (const [i, r] of g.rules.entries()) await api('grammar/rules', 'POST', { topicId: topic.id, ...r, order: i });
      for (const [i, e] of g.examples.entries()) await api('grammar/examples', 'POST', { topicId: topic.id, ...e, order: i });
      for (const [i, x] of g.exercises.entries()) await api('grammar/exercises', 'POST', { topicId: topic.id, type: 'choose', ...x, order: i });
      await api('lessons', 'POST', { moduleId: mod.id, linkType: 'grammar', linkId: topic.id, order: i, type: 'grammar', skillType: 'grammar', title: g.lessonTitle, titleTranslated: g.lessonTitleTranslated, emoji: g.emoji, xpReward: g.xpReward || 40 });
    } else if (kind === 'comprehension') {
      const c = COMPREHENSIONS.find(x => x.slot === ref);
      const { exercise: ex } = await api('comprehensions', 'POST', { courseId: course.id, order: MODULE.order * 10 + (ref === 'reading' ? 1 : 2), ...c });
      for (const [i, q] of c.questions.entries()) await api('comprehensions/questions', 'POST', { exerciseId: ex.id, ...q, order: i });
      await api('lessons', 'POST', { moduleId: mod.id, linkType: 'comprehension', linkId: ex.id, order: i, type: c.kind, skillType: c.skillType, title: c.lessonTitle, titleTranslated: c.lessonTitleTranslated, emoji: c.emoji, xpReward: c.xpReward || 40 });
    } else if (kind === 'dialogue') {
      const { dialogue: dlg } = await api('dialogues', 'POST', { courseId: course.id, order: MODULE.order, title: DIALOGUE.title, titleTranslated: DIALOGUE.titleTranslated, scenario: DIALOGUE.scenario, emoji: DIALOGUE.emoji });
      for (const [i, l] of DIALOGUE.lines.entries()) await api('dialogues/lines', 'POST', { dialogueId: dlg.id, ...l, order: i });
      await api('lessons', 'POST', { moduleId: mod.id, linkType: 'dialogue', linkId: dlg.id, order: i, type: 'dialogue', skillType: 'listening', title: DIALOGUE.lessonTitle, titleTranslated: DIALOGUE.lessonTitleTranslated, emoji: DIALOGUE.emoji, xpReward: 50 });
    } else if (kind === 'writing') {
      const { lesson: item } = await api('lessons', 'POST', { moduleId: mod.id, order: i, type: 'vocab', skillType: 'writing', ...WRITING });
      for (const [wi, wordText] of WRITING.copyOf.entries()) {
        const src = allWords.find(w => w.text === wordText);
        if (!src) throw new Error(`Source word not found for writing: ${wordText}`);
        await api('words', 'POST', { lessonId: item.id, word: src.text, translation: 'COPY', emoji: src.emoji, order: wi, existing: true });
      }
    }
  }
  
  if (!DRY) {
    console.log("Saving audio jobs (skipping generation for now)...");
    mkdirSync(WORK, { recursive: true });
    writeFileSync(`${WORK}/items.json`, JSON.stringify(allWords.map(j => ({ id: j.id, text: j.text })), null, 1));
  }
  
  console.log(`✅ Module 1 Done!`);
}

main().catch(console.error);
