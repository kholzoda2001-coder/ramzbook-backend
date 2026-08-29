import { q } from './db.mjs';
const MOD = 'cmqngcvui0001ee513prbg336';
const ls = await q(`select * from "Lesson" where "moduleId"=$1 order by "order"`, [MOD]);
console.log('lessons:', ls.length);
for (const l of ls) {
  const w = await q(`select count(*)::int n from "Word" where "lessonId"=$1`, [l.id]);
  let extra = [];
  if (l.grammarTopicId) {
    const r = await q(`select (select count(*)::int from "GrammarRule" where "topicId"=$1) rules, (select count(*)::int from "GrammarExample" where "topicId"=$1) ex, (select count(*)::int from "GrammarExercise" where "topicId"=$1) exr`, [l.grammarTopicId]);
    extra.push(`grammar(rules=${r[0].rules},ex=${r[0].ex},exercises=${r[0].exr})`);
  }
  if (l.dialogueId) { const d = await q(`select count(*)::int n from "DialogueLine" where "dialogueId"=$1`,[l.dialogueId]); extra.push(`dialogue(lines=${d[0].n})`); }
  if (l.comprehensionId) { const c = await q(`select count(*)::int n from "ComprehensionQuestion" where "exerciseId"=$1`,[l.comprehensionId]); extra.push(`comprehension(q=${c[0].n})`); }
  if (l.phraseCollectionId) { const p = await q(`select count(*)::int n from "Phrase" where "collectionId"=$1`,[l.phraseCollectionId]); extra.push(`phrases(${p[0].n})`); }
  console.log(`#${l.order} [${l.type}/${l.skillType}] cefr=${l.cefrLevel} "${l.title}" | "${l.titleTranslated}" words=${w[0].n} ${extra.join(' ')} active=${l.isActive} id=${l.id}`);
}
const types = await q(`select type, count(*)::int n from "GrammarExercise" ge join "GrammarTopic" gt on gt.id=ge."topicId" where gt."courseId"='cmqkvhu8p0001o5r7nkbeo4jm' group by type order by n desc`);
console.log('\nGrammarExercise types (A1 course):', types.map(t=>`${t.type}=${t.n}`).join(', '));
