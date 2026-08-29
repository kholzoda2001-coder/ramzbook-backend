import { PrismaClient } from '@prisma/client';
import { fixEnglish, fixTajik, fixIpa } from './p0-text-utils.mjs';
const prisma = new PrismaClient();

async function main(){
  const dry = process.argv.includes('--dry');
  console.log(dry? '=== DRY RUN ===':'=== APPLYING ===');
  const course = await prisma.course.findFirst({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, level:'A1' }});

  // ---------- A. DEDUPE GRAMMAR TOPICS (delete empty orphans, keep one canonical) ----------
  const topics = await prisma.grammarTopic.findMany({ where:{courseId:course.id}, include:{rules:true,examples:true,exercises:true,lessons:true}});
  const byTitle = {};
  for(const t of topics){ const k=t.title.trim().toLowerCase(); (byTitle[k]=byTitle[k]||[]).push(t); }
  let grammarDeleted=0;
  for(const [k,list] of Object.entries(byTitle)){
    if(list.length<2) continue;
    // rank: prefer linked, then most content
    list.sort((a,b)=> (b.lessons.length-a.lessons.length) || ((b.rules.length+b.exercises.length+b.examples.length)-(a.rules.length+a.exercises.length+a.examples.length)));
    const keep=list[0];
    for(const dup of list.slice(1)){
      console.log(`  DEDUPE GRAMMAR: drop "${dup.title}" (lessons=${dup.lessons.length}) keep id=${keep.id}`);
      if(!dry){
        // relink any lessons pointing at dup -> keep
        for(const l of dup.lessons) await prisma.lesson.update({where:{id:l.id},data:{grammarTopicId:keep.id}});
        await prisma.grammarTopic.delete({where:{id:dup.id}});
      }
      grammarDeleted++;
    }
  }

  // ---------- B. DEDUPE VOCAB (same word in same lesson) ----------
  const words = await prisma.word.findMany({ where:{lesson:{module:{courseId:course.id}}}, select:{id:true,word:true,lessonId:true,order:true}});
  const seen={}; let vocabDeleted=0;
  for(const w of words){ const key=w.lessonId+'::'+w.word.trim().toLowerCase(); if(seen[key]){ console.log(`  DEDUPE VOCAB: "${w.word}" dup in lesson ${w.lessonId}`); if(!dry) await prisma.word.delete({where:{id:w.id}}); vocabDeleted++; } else seen[key]=w.id; }

  // ---------- C. MODULE ORDER GAP (close gap so orders are contiguous) ----------
  const mods = await prisma.module.findMany({ where:{courseId:course.id}, orderBy:{order:'asc'}});
  let dupMods=0; // none expected
  let idx=0; for(const m of mods){ if(m.order!==idx){ console.log(`  REORDER MODULE "${m.title}" ${m.order} -> ${idx}`); if(!dry) await prisma.module.update({where:{id:m.id},data:{order:idx}}); } idx++; }

  // ---------- D. skillType -> "vocabulary" (only the legacy "vocab" tag) ----------
  const vocabFix = await prisma.lesson.updateMany({ where:{module:{courseId:course.id}, skillType:'vocab'}, data:{skillType:'vocabulary'} });
  if(!dry) console.log(`  skillType vocab->vocabulary: ${vocabFix.count}`);

  // ---------- E. NORMALIZE XP ECONOMY ----------
  // standard A1 XP by skillType
  const XP = { vocabulary:15, grammar:20, reading:20, listening:20, speaking:20, review:30, test:50 };
  const lessons = await prisma.lesson.findMany({ where:{module:{courseId:course.id}}, select:{id:true,skillType:true,xpReward:true} });
  let xpChanged=0;
  for(const l of lessons){ const want = XP[l.skillType] ?? 15; if(l.xpReward!==want){ if(!dry) await prisma.lesson.update({where:{id:l.id},data:{xpReward:want}}); xpChanged++; } }
  console.log(`  XP normalized on ${xpChanged} lessons`);

  // ---------- F. TITLE-CASE + IPA FIXES on Words ----------
  const allW = await prisma.word.findMany({ where:{lesson:{module:{courseId:course.id}}} });
  let exFix=0, ipaFix=0, ipatjFix=0;
  for(const w of allW){
    const data={};
    const ne = fixEnglish(w.example); if(ne!==w.example){ data.example=ne; exFix++; }
    const nt = fixTajik(w.exampleTrans); if(nt!==w.exampleTrans){ data.exampleTrans=nt; }
    const ni = fixIpa(w.ipa); if(ni!==w.ipa){ data.ipa=ni; ipaFix++; }
    const nj = w.ipaTajik? w.ipaTajik.toLowerCase():w.ipaTajik; if(nj!==w.ipaTajik){ data.ipaTajik=nj; ipatjFix++; }
    if(Object.keys(data).length && !dry) await prisma.word.update({where:{id:w.id},data});
  }
  console.log(`  Word fixes: examples=${exFix} ipa=${ipaFix} ipaTajik=${ipatjFix}`);

  // ---------- G. TITLE-CASE on dialogue lines ----------
  const dls = await prisma.dialogueLine.findMany({ where:{dialogue:{courseId:course.id}} });
  let dlFix=0;
  for(const d of dls){ const data={}; const ne=fixEnglish(d.text); if(ne!==d.text){data.text=ne;dlFix++;} const nt=fixTajik(d.translation); if(nt!==d.translation)data.translation=nt; if(Object.keys(data).length&&!dry) await prisma.dialogueLine.update({where:{id:d.id},data}); }
  console.log(`  Dialogue line fixes: ${dlFix}`);

  // ---------- G2. TITLE-CASE on comprehension passages & questions ----------
  // Section G above CLAIMED to cover comprehension but only ever iterated
  // DialogueLine, so the whole reading/listening layer kept its Title-Case text
  // while p0-final-report scored orthography as "normalized" (it samples only
  // Word.example). See System_Bug_Audit.md, item 5.
  //
  // NOT touched: `title` / `titleTranslated`. Those are headings ("Module
  // Review", "Final Exam") where Title Case is correct — running fixEnglish
  // over them would lowercase the tail into "Module review".

  // An option can be EITHER language — e.g. options ["Лутфан","Ташаккур"] sit
  // next to ["Breakfast","Dinner"] — so route each string by its script rather
  // than assuming the column's language.
  const hasCyrillic = (s) => /[Ѐ-ӿ]/.test(s);

  // ⚠️ SHORT FIELDS MUST BE GUARDED. `fixEnglish` is sentence-aware: it
  // capitalises whatever it believes starts a sentence. On a whole passage
  // that is right, but on short strings a dry run over real A1 data showed it
  // actively CORRUPTING correct text:
  //   options  ["has","am","have"]        → ["Has","Am","Have"]   (gap-fillers!)
  //   question "'Хоҳар' in English is:"   → "'Хоҳар' In English is:"
  //   question "Complete: This is ___"    → "Complete: this is ___"
  // So short fields are rewritten ONLY when they are genuinely Title-Cased
  // prose — every alphabetic word capitalised, 2+ words ("How Are You?",
  // "I Am Fine, Thank You."). That is the defect this section exists to fix,
  // and the guard means the pass can never make correct text worse.
  const isTitleCased = (s) => {
    const toks = String(s).replace(/[?.!,;:'"()]/g, '').split(/\s+/)
      .filter(t => /[A-Za-z]/.test(t));
    return toks.length >= 2 && toks.every(t => /^[A-Z]/.test(t));
  };
  const fixShortEnglish = (s) => (isTitleCased(s) ? fixEnglish(s) : s);
  const fixOption = (s) => (hasCyrillic(s) ? fixTajik(s) : fixShortEnglish(s));

  const comps = await prisma.comprehensionExercise.findMany({
    where: { courseId: course.id },
    include: { questions: true },
  });
  // NOT touched either: `explanation` and `questionTranslated`. They are
  // declared native-language but in practice hold MIXED text — "Бо I → have
  // got.", "Хоҳар = Sister." — and fixTajik lowercases every non-first word it
  // does not recognise, so a dry run turned "Бо I" into "Бо i". Their real
  // defect (a missing opening capital) is a different problem from Title Case
  // and needs a mixed-script pass of its own.
  let passFix=0, passTjFix=0, qFix=0, optFix=0;

  for(const cx of comps){
    const data={};
    const np = fixEnglish(cx.passage); if(np!==cx.passage){ data.passage=np; passFix++; }
    if(cx.passageTranslated){ const npt=fixTajik(cx.passageTranslated); if(npt!==cx.passageTranslated){ data.passageTranslated=npt; passTjFix++; } }
    if(Object.keys(data).length && !dry) await prisma.comprehensionExercise.update({where:{id:cx.id},data});

    for(const q of cx.questions){
      const qd={};
      const nq = fixShortEnglish(q.question); if(nq!==q.question){ qd.question=nq; qFix++; }
      // `options` is Json (string[]). Order is NEVER changed — `correctIndex`
      // points into this array, so a reorder would silently break the answer.
      if(Array.isArray(q.options)){
        const no = q.options.map(o => typeof o === 'string' ? fixOption(o) : o);
        if(JSON.stringify(no)!==JSON.stringify(q.options)){ qd.options=no; optFix++; }
      }
      if(Object.keys(qd).length && !dry) await prisma.comprehensionQuestion.update({where:{id:q.id},data:qd});
    }
  }
  const qTotal = comps.reduce((n,c)=>n+c.questions.length,0);
  console.log(`  Comprehension: ${comps.length} exercises / ${qTotal} questions`);
  console.log(`    passages=${passFix} passagesTj=${passTjFix} questions=${qFix} options=${optFix}`);

  console.log('\n=== PHASE 3 SUMMARY ===');
  console.log(JSON.stringify({ grammarDuplicatesRemoved:grammarDeleted, vocabDuplicatesRemoved:vocabDeleted, duplicateModulesRemoved:dupMods, xpChanged, exampleFixes:exFix, ipaFixes:ipaFix, dialogueLineFixes:dlFix, comprehensionPassageFixes:passFix, comprehensionPassageTajikFixes:passTjFix, comprehensionQuestionFixes:qFix, comprehensionOptionFixes:optFix },null,2));
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
