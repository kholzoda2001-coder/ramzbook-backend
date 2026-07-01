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

  // ---------- G. TITLE-CASE on dialogue lines & comprehension passages ----------
  const dls = await prisma.dialogueLine.findMany({ where:{dialogue:{courseId:course.id}} });
  let dlFix=0;
  for(const d of dls){ const data={}; const ne=fixEnglish(d.text); if(ne!==d.text){data.text=ne;dlFix++;} const nt=fixTajik(d.translation); if(nt!==d.translation)data.translation=nt; if(Object.keys(data).length&&!dry) await prisma.dialogueLine.update({where:{id:d.id},data}); }
  console.log(`  Dialogue line fixes: ${dlFix}`);

  console.log('\n=== PHASE 3 SUMMARY ===');
  console.log(JSON.stringify({ grammarDuplicatesRemoved:grammarDeleted, vocabDuplicatesRemoved:vocabDeleted, duplicateModulesRemoved:dupMods, xpChanged, exampleFixes:exFix, ipaFixes:ipaFix },null,2));
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
