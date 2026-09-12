// Мазмуни Модули 1-и русӣ ҳамчун JSON (барои детекторҳои Python).
import { connect, COURSE_RU_A1 } from './_ru-fix-lib.mjs';
const sql = connect();
const [M1] = await sql`SELECT id,title,"titleTranslated" tt,"contentVersion" cv FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order" LIMIT 1`;
const L = await sql`SELECT id,"order",title,"titleTranslated" tt,type,"skillType" st,emoji,"xpReward" xp,"grammarTopicId" gid,"dialogueId" did,"comprehensionId" cid
  FROM "Lesson" WHERE "moduleId"=${M1.id} ORDER BY "order"`;
const data = { module: M1, lessons: [] };
for (const l of L) {
  const o = { ...l, words: [], grammar: null, dialogue: null, comp: null };
  o.words = await sql`SELECT word,translation,emoji,ipa,"ipaTajik" ipt,example,"exampleTrans" ext,"audioUrl" au,"partOfSpeech" pos,"order"
    FROM "Word" WHERE "lessonId"=${l.id} ORDER BY "order"`;
  if (l.gid) {
    const [g] = await sql`SELECT id,title,"titleTranslated" tt,explanation FROM "GrammarTopic" WHERE id=${l.gid}`;
    g.rules = await sql`SELECT pattern,note FROM "GrammarRule" WHERE "topicId"=${l.gid} ORDER BY "order"`;
    g.examples = await sql`SELECT sentence,translation,highlight,"audioUrl" au FROM "GrammarExample" WHERE "topicId"=${l.gid} ORDER BY "order"`;
    g.exercises = await sql`SELECT type,prompt,"promptTranslated" pt,answer,options,explanation FROM "GrammarExercise" WHERE "topicId"=${l.gid} ORDER BY "order"`;
    o.grammar = g;
  }
  if (l.did) {
    const [d] = await sql`SELECT id,title,"titleTranslated" tt,scenario FROM "Dialogue" WHERE id=${l.did}`;
    d.lines = await sql`SELECT speaker,text,translation,"isUser" iu,"audioUrl" au,"order" FROM "DialogueLine" WHERE "dialogueId"=${l.did} ORDER BY "order"`;
    o.dialogue = d;
  }
  if (l.cid) {
    const [c] = await sql`SELECT id,kind,title,"titleTranslated" tt,passage,"passageTranslated" pt,"audioUrl" au FROM "ComprehensionExercise" WHERE id=${l.cid}`;
    c.questions = await sql`SELECT question,"questionTranslated" qt,options,"correctIndex" ci,explanation,"order" FROM "ComprehensionQuestion" WHERE "exerciseId"=${l.cid} ORDER BY "order"`;
    o.comp = c;
  }
  data.lessons.push(o);
}
console.log(JSON.stringify(data));
