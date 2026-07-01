import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const has = (u)=> typeof u==='string' && u.trim().length>0;

async function main(){
  const c = await prisma.course.findFirst({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, level:'A1' }});
  const issues = [];

  // ───────────────────────────────────────────────────────────
  // 1 & 2. Grammar topics: linkage + rules/examples/exercises
  // ───────────────────────────────────────────────────────────
  const topics = await prisma.grammarTopic.findMany({ where:{courseId:c.id}, include:{ rules:true, examples:true, exercises:true, lessons:{ include:{ module:true } } } });
  let topicsLinked=0, topicsVisible=0, topicsFullContent=0;
  for(const t of topics){
    const linked = t.lessons.length>0;
    const visible = t.lessons.some(l=>l.isActive && l.module.isActive);
    const full = t.rules.length>0 && t.examples.length>0 && t.exercises.length>0;
    if(linked) topicsLinked++;
    if(visible) topicsVisible++;
    if(full) topicsFullContent++;
    if(!linked) issues.push(`Grammar topic "${t.title}" has NO lesson link (orphan)`);
    else if(!visible) issues.push(`Grammar topic "${t.title}" linked only to inactive lesson/module`);
    if(!full) issues.push(`Grammar topic "${t.title}" incomplete: r${t.rules.length}/e${t.examples.length}/x${t.exercises.length}`);
  }

  // ───────────────────────────────────────────────────────────
  // 3. Exercise render validity (grammar + comprehension)
  // ───────────────────────────────────────────────────────────
  const allEx = topics.flatMap(t=>t.exercises);
  let exValid=0; const exBad=[];
  for(const e of allEx){
    let ok=true;
    const opts = Array.isArray(e.options)? e.options : (typeof e.options==='string'? (()=>{try{return JSON.parse(e.options);}catch{return null;}})() : null);
    if(!has(e.prompt) || !has(e.answer)) ok=false;
    if(e.type==='choose'){ if(!opts || opts.length<2 || !opts.map(String).includes(String(e.answer))) ok=false; }
    if(e.type==='reorder'){ if(!opts || opts.length<2) ok=false; }
    // fill_blank/transform: prompt+answer sufficient
    if(ok) exValid++; else exBad.push(`${e.type}: "${String(e.prompt).slice(0,40)}"`);
  }

  // comprehension questions render validity
  const comps = await prisma.comprehensionExercise.findMany({ where:{courseId:c.id}, include:{ questions:true, lessons:{include:{module:true}} } });
  const compQ = comps.flatMap(x=>x.questions);
  let compQValid=0; const compQBad=[];
  for(const q of compQ){
    const opts = Array.isArray(q.options)? q.options : (typeof q.options==='string'? (()=>{try{return JSON.parse(q.options);}catch{return null;}})() : null);
    const ok = has(q.question) && opts && opts.length>=2 && Number.isInteger(q.correctIndex) && q.correctIndex>=0 && q.correctIndex<opts.length;
    if(ok) compQValid++; else compQBad.push(String(q.question).slice(0,40));
  }
  const totalExercises = allEx.length + compQ.length;
  const totalExValid = exValid + compQValid;

  // ───────────────────────────────────────────────────────────
  // 4. Dialogues connected to lessons
  // ───────────────────────────────────────────────────────────
  const dialogues = await prisma.dialogue.findMany({ where:{courseId:c.id}, include:{ lines:true, lessons:{include:{module:true}} } });
  let dlgLinked=0, dlgVisible=0;
  for(const d of dialogues){
    if(d.lessons.length>0) dlgLinked++; else issues.push(`Dialogue "${d.title}" NOT linked to any lesson (orphan)`);
    if(d.lessons.some(l=>l.isActive && l.module.isActive)) dlgVisible++;
    if(d.lines.length===0) issues.push(`Dialogue "${d.title}" has 0 lines`);
  }

  // ───────────────────────────────────────────────────────────
  // 5. Vocabulary reachability
  // ───────────────────────────────────────────────────────────
  const words = await prisma.word.findMany({ where:{ lesson:{ module:{ courseId:c.id } } }, include:{ lesson:{ include:{ module:true } } } });
  let wordsReachable=0;
  for(const w of words){ if(w.lesson && w.lesson.isActive && w.lesson.module.isActive) wordsReachable++; }
  if(wordsReachable<words.length) issues.push(`${words.length-wordsReachable} words are in inactive lessons/modules (unreachable)`);

  // ───────────────────────────────────────────────────────────
  // 6. Module 12 connectivity
  // ───────────────────────────────────────────────────────────
  const m12 = await prisma.module.findFirst({ where:{courseId:c.id, order:10}, include:{ lessons:{ orderBy:{order:'asc'}, include:{ words:true } } } });
  let m12ok = false;
  if(m12){
    const active = m12.isActive;
    const nLessons = m12.lessons.length;
    const grammarL = m12.lessons.find(l=>l.skillType==='grammar');
    const speakL = m12.lessons.find(l=>l.skillType==='speaking');
    const testL = m12.lessons.find(l=>l.skillType==='test');
    const reviewL = m12.lessons.find(l=>l.skillType==='review');
    m12ok = active && nLessons===9 && grammarL?.grammarTopicId && speakL?.dialogueId && testL?.comprehensionId && reviewL?.comprehensionId;
    if(!active) issues.push('Module 12 is INACTIVE (not visible)');
    if(nLessons!==9) issues.push(`Module 12 has ${nLessons} lessons (expected 9)`);
    if(!grammarL?.grammarTopicId) issues.push('Module 12 grammar lesson not linked to a topic');
    if(!speakL?.dialogueId) issues.push('Module 12 speaking lesson not linked to a dialogue');
    if(!testL?.comprehensionId) issues.push('Module 12 final exam not linked to a comprehension');
  } else issues.push('Module 12 (order 10) NOT FOUND');

  // ───────────────────────────────────────────────────────────
  // 7. Orphan records (course-wide)
  // ───────────────────────────────────────────────────────────
  const orphanTopics = topics.filter(t=>t.lessons.length===0).length;
  const orphanDialogues = dialogues.filter(d=>d.lessons.length===0).length;
  const orphanComps = comps.filter(x=>x.lessons.length===0).length;
  // lessons whose skill demands a link but has none
  const lessons = await prisma.lesson.findMany({ where:{module:{courseId:c.id}}, select:{title:true,skillType:true,grammarTopicId:true,dialogueId:true,comprehensionId:true,phraseCollectionId:true} });
  let danglingLessons=0;
  for(const l of lessons){
    if(l.skillType==='grammar' && !l.grammarTopicId){ danglingLessons++; issues.push(`Lesson "${l.title}" [grammar] missing grammarTopicId`); }
    if(l.skillType==='speaking' && !l.dialogueId){ danglingLessons++; issues.push(`Lesson "${l.title}" [speaking] missing dialogueId`); }
    if((l.skillType==='reading'||l.skillType==='review'||l.skillType==='test') && !l.comprehensionId){ danglingLessons++; issues.push(`Lesson "${l.title}" [${l.skillType}] missing comprehensionId`); }
  }
  if(orphanComps>0) issues.push(`${orphanComps} comprehension exercises not linked to a lesson (orphan)`);

  // ───────────────────────────────────────────────────────────
  // 8. Exams functional
  // ───────────────────────────────────────────────────────────
  const examLessons = await prisma.lesson.findMany({ where:{module:{courseId:c.id}, skillType:{in:['test','review']}}, include:{ comprehension:{include:{questions:true}} } });
  let examsOk=0;
  for(const e of examLessons){
    const q = e.comprehension?.questions||[];
    const valid = e.comprehension && q.length>0 && q.every(x=>{ const o=Array.isArray(x.options)?x.options:[]; return o.length>=2 && x.correctIndex>=0 && x.correctIndex<o.length; });
    if(valid) examsOk++; else issues.push(`Exam/review "${e.title}" not functional (missing/invalid questions)`);
  }

  // ───────────────────────────────────────────────────────────
  // Readiness scores
  // ───────────────────────────────────────────────────────────
  const contentReadiness = ((topicsFullContent/topics.length)*0.5 + (totalExValid/totalExercises)*0.3 + (examsOk/examLessons.length)*0.2)*100;
  const technicalReadiness = ((topicsVisible/topics.length)*0.35 + (dlgVisible/dialogues.length)*0.25 + (wordsReachable/words.length)*0.25 + (m12ok?1:0)*0.15)*100;
  const dataIntegrity = (issues.length===0?100: Math.max(0, 100 - issues.length*2));

  console.log('═══════════════════════════════════════════════════');
  console.log('   A1 FINAL VALIDATION AUDIT (live DB)');
  console.log('═══════════════════════════════════════════════════');
  console.log(`1. Grammar topics: ${topics.length} total | linked=${topicsLinked} | visible(active)=${topicsVisible}`);
  console.log(`2. Topics with rules+examples+exercises: ${topicsFullContent}/${topics.length}`);
  console.log(`3. Exercises render-valid: grammar ${exValid}/${allEx.length}, comprehension ${compQValid}/${compQ.length} → ${totalExValid}/${totalExercises}`);
  console.log(`4. Dialogues: ${dialogues.length} | linked=${dlgLinked} | visible=${dlgVisible}`);
  console.log(`5. Vocabulary reachable: ${wordsReachable}/${words.length}`);
  console.log(`6. Module 12 fully connected & visible: ${m12ok?'YES':'NO'} (${m12? m12.lessons.length:'-'} lessons, active=${m12?.isActive})`);
  console.log(`7. Orphans → grammarTopics:${orphanTopics} dialogues:${orphanDialogues} comprehensions:${orphanComps} danglingLessons:${danglingLessons}`);
  console.log(`8. Exams/reviews functional: ${examsOk}/${examLessons.length}`);
  console.log('');
  console.log(`Exercise render failures: ${exBad.length}${exBad.length? ' → '+exBad.slice(0,5).join(' | '):''}`);
  console.log(`Comprehension Q failures: ${compQBad.length}${compQBad.length? ' → '+compQBad.slice(0,5).join(' | '):''}`);
  console.log('');
  console.log('── READINESS ──');
  console.log(`Content Readiness:   ${contentReadiness.toFixed(1)}%`);
  console.log(`Technical Readiness: ${technicalReadiness.toFixed(1)}%`);
  console.log(`Data Integrity:      ${dataIntegrity.toFixed(1)}%`);
  console.log('');
  console.log(`MISSING / ISSUES (${issues.length}):`);
  if(issues.length===0) console.log('   ✓ none — no orphans, all linked, all valid');
  else issues.slice(0,40).forEach(i=>console.log('   ✗ '+i));
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
