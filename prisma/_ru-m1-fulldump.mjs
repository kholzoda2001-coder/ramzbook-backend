// Пурра рехтани мазмуни МОДУЛИ 1-и курси русӣ (A1) барои симулятсияи 20 донишҷӯ.
import { connect, COURSE_RU_A1 } from './_ru-fix-lib.mjs';
const sql = connect();

const mods = await sql`SELECT id,title,"titleTranslated" tt,emoji,"order",("isPremium")::text prem,("isActive")::text act
  FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
console.log('MODULES:', mods.map(m=>`#${m.order} ${m.tt} (${m.id}) act=${m.act} prem=${m.prem}`).join('\n  '));
const M1 = mods[0];
console.log(`\n████ MODULE 1: "${M1.title}" / "${M1.tt}" ${M1.emoji}\n`);

const lessons = await sql`SELECT id,title,"titleTranslated" tt,type,"skillType" st,emoji,"xpReward" xp,duration,"order",
  ("isPremium")::text prem,("isActive")::text act,"grammarTopicId" gid,"phraseCollectionId" pid,"dialogueId" did,"comprehensionId" cid
  FROM "Lesson" WHERE "moduleId"=${M1.id} ORDER BY "order"`;
console.log(`ДАРСҲО: ${lessons.length}\n`);

for (const l of lessons) {
  console.log('\n' + '═'.repeat(78));
  console.log(`ДАРС #${l.order} [${l.st}] ${l.emoji} "${l.title}" / "${l.tt}"  xp=${l.xp} min=${l.duration} act=${l.act} prem=${l.prem}`);
  console.log('═'.repeat(78));

  const ws = await sql`SELECT word,translation,emoji,ipa,"ipaTajik" ipt,example,"exampleTrans" ext,"audioUrl" au,difficulty,"partOfSpeech" pos,"order"
    FROM "Word" WHERE "lessonId"=${l.id} ORDER BY "order"`;
  if (ws.length) {
    console.log(`\n  ── КАЛИМАҲО (${ws.length}) ──`);
    for (const w of ws) console.log(`  ${w.order}. ${w.emoji||''} "${w.word}" = "${w.translation}" | ipa=${w.ipa||'—'} | tg-ipa=${w.ipt||'—'} | pos=${w.pos||'—'} | diff=${w.difficulty} | audio=${w.au?'✔':'✘'}\n      ex: ${w.example||'—'} / ${w.ext||'—'}`);
  }

  if (l.gid) {
    const [g] = await sql`SELECT title,"titleTranslated" tt,explanation,emoji FROM "GrammarTopic" WHERE id=${l.gid}`;
    console.log(`\n  ── ГРАММАТИКА: "${g.title}" / "${g.tt}" ──`);
    console.log('  EXPLANATION:\n' + g.explanation.split('\n').map(s=>'    |'+s).join('\n'));
    const rs = await sql`SELECT pattern,note FROM "GrammarRule" WHERE "topicId"=${l.gid} ORDER BY "order"`;
    for (const r of rs) console.log(`  RULE: ${r.pattern}\n        note: ${r.note||'—'}`);
    const ex = await sql`SELECT sentence,translation,highlight,"audioUrl" au FROM "GrammarExample" WHERE "topicId"=${l.gid} ORDER BY "order"`;
    for (const e of ex) console.log(`  EX: "${e.sentence}" = "${e.translation}" hl=${e.highlight||'—'} audio=${e.au?'✔':'✘'}`);
    const gx = await sql`SELECT type,prompt,"promptTranslated" pt,answer,options,explanation FROM "GrammarExercise" WHERE "topicId"=${l.gid} ORDER BY "order"`;
    console.log(`  МАШҚҲОИ ГРАММАТИКӢ (${gx.length}):`);
    for (const x of gx) console.log(`   [${x.type}] ${x.prompt}\n        tg: ${x.pt||'—'}\n        ans="${x.answer}" opts=${JSON.stringify(x.options)}\n        expl: ${x.explanation||'❌ НЕСТ'}`);
  }

  if (l.pid) {
    const [p] = await sql`SELECT title,"titleTranslated" tt,category FROM "PhraseCollection" WHERE id=${l.pid}`;
    console.log(`\n  ── ИБОРАҲО: "${p.title}" / "${p.tt}" (${p.category||'—'}) ──`);
    const ph = await sql`SELECT * FROM "Phrase" WHERE "collectionId"=${l.pid} ORDER BY "order"`;
    for (const x of ph) console.log(`   "${x.text}" = "${x.translation}" | lit=${x.literal||'—'} | audio=${x.audioUrl?'✔':'✘'}`);
  }

  if (l.did) {
    const [d] = await sql`SELECT title,"titleTranslated" tt,scenario FROM "Dialogue" WHERE id=${l.did}`;
    console.log(`\n  ── МУКОЛАМА: "${d.title}" / "${d.tt}" ──\n     scenario: ${d.scenario||'—'}`);
    const ln = await sql`SELECT speaker,text,translation,"isUser" iu,"audioUrl" au FROM "DialogueLine" WHERE "dialogueId"=${l.did} ORDER BY "order"`;
    for (const x of ln) console.log(`   ${x.iu?'[МАН]':'[   ]'} ${x.speaker}: "${x.text}" = "${x.translation}" audio=${x.au?'✔':'✘'}`);
  }

  if (l.cid) {
    const [c] = await sql`SELECT kind,title,"titleTranslated" tt,passage,"passageTranslated" pt,"audioUrl" au FROM "ComprehensionExercise" WHERE id=${l.cid}`;
    console.log(`\n  ── ФАҲМИШ [${c.kind}]: "${c.title}" / "${c.tt}" audio=${c.au?'✔':'✘'} ──`);
    console.log('   PASSAGE: ' + (c.passage||'—'));
    console.log('   PASS_TG: ' + (c.pt||'—'));
    const qs = await sql`SELECT question,"questionTranslated" qt,options,"correctIndex" ci,explanation FROM "ComprehensionQuestion" WHERE "exerciseId"=${l.cid} ORDER BY "order"`;
    for (const q of qs) {
      const o = Array.isArray(q.options)?q.options:JSON.parse(q.options);
      console.log(`   Q: ${q.question} | ${q.qt||'—'}\n      opts=${JSON.stringify(o)} ci=${q.ci} → "${o[q.ci]}"\n      expl: ${q.explanation||'❌ НЕСТ'}`);
    }
  }
}
