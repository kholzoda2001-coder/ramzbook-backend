// Мазмуни ЯК модули курси русӣ (A1) ҳамчун JSON — барои детекторҳои Python.
// Умумии `_ru-m1-json.mjs`: индекси модул (0-асос) ҳамчун аргумент.
//
//   node prisma/_ru-mod-json.mjs 1 > ../tmp/ru-m2.json
import { connect, COURSE_RU_A1 } from './_ru-fix-lib.mjs';
const sql = connect();
const idx = Number(process.argv[2] ?? 0);
const mods = await sql`SELECT id,title,"titleTranslated" tt,"contentVersion" cv,"order" FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const M = mods[idx];
if (!M) throw new Error(`модули ${idx} нест`);
const L = await sql`SELECT id,"order",title,"titleTranslated" tt,type,"skillType" st,emoji,"xpReward" xp,"grammarTopicId" gid,"dialogueId" did,"comprehensionId" cid,"phraseCollectionId" pid,("isActive")::text act
  FROM "Lesson" WHERE "moduleId"=${M.id} ORDER BY "order"`;
const data = { module: M, lessons: [] };
for (const l of L) {
  const o = { ...l, words: [], grammar: null, dialogue: null, comp: null, phrases: null };
  o.words = await sql`SELECT id,word,translation,emoji,ipa,"ipaTajik" ipt,example,"exampleTrans" ext,"audioUrl" au,"partOfSpeech" pos,"order"
    FROM "Word" WHERE "lessonId"=${l.id} ORDER BY "order"`;
  if (l.gid) {
    const [g] = await sql`SELECT id,title,"titleTranslated" tt,explanation FROM "GrammarTopic" WHERE id=${l.gid}`;
    g.rules = await sql`SELECT pattern,note FROM "GrammarRule" WHERE "topicId"=${l.gid} ORDER BY "order"`;
    g.examples = await sql`SELECT id,sentence,translation,highlight,"audioUrl" au FROM "GrammarExample" WHERE "topicId"=${l.gid} ORDER BY "order"`;
    g.exercises = await sql`SELECT id,type,prompt,"promptTranslated" pt,answer,options,explanation FROM "GrammarExercise" WHERE "topicId"=${l.gid} ORDER BY "order"`;
    o.grammar = g;
  }
  if (l.did) {
    const [d] = await sql`SELECT id,title,"titleTranslated" tt,scenario FROM "Dialogue" WHERE id=${l.did}`;
    d.lines = await sql`SELECT id,speaker,text,translation,"isUser" iu,"audioUrl" au,"order" FROM "DialogueLine" WHERE "dialogueId"=${l.did} ORDER BY "order"`;
    o.dialogue = d;
  }
  if (l.cid) {
    const [c] = await sql`SELECT id,kind,title,"titleTranslated" tt,passage,"passageTranslated" pt,"audioUrl" au FROM "ComprehensionExercise" WHERE id=${l.cid}`;
    c.questions = await sql`SELECT id,question,"questionTranslated" qt,options,"correctIndex" ci,explanation,"order" FROM "ComprehensionQuestion" WHERE "exerciseId"=${l.cid} ORDER BY "order"`;
    o.comp = c;
  }
  if (l.pid) {
    const [p] = await sql`SELECT id,title,"titleTranslated" tt FROM "PhraseCollection" WHERE id=${l.pid}`;
    p.items = await sql`SELECT text,translation,"audioUrl" au FROM "Phrase" WHERE "collectionId"=${l.pid} ORDER BY "order"`;
    o.phrases = p;
  }
  data.lessons.push(o);
}
console.log(JSON.stringify(data));
