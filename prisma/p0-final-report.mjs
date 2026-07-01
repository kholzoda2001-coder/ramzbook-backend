import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const has = (u)=> typeof u==='string' && u.trim().length>0;

const MANDATORY = ['Subject Pronouns','Verb To Be','A / An / The','Plural Nouns','Possessive Adjectives',
  'Present Simple','Do / Does Questions','Can','Have Got','Present Continuous','Imperative',
  'Prepositions Of Place','There Is / There Are','This / That / These / Those','Some / Any',
  'How Much / How Many','Question Words','Was / Were'];

async function main(){
  const c = await prisma.course.findFirst({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, level:'A1' }});
  const topics = await prisma.grammarTopic.findMany({ where:{courseId:c.id}, include:{exercises:true} });
  const withEx = topics.filter(t=>t.exercises.length>0);
  const noEx = topics.filter(t=>t.exercises.length===0);

  // mandatory coverage
  const norm = s=>s.toLowerCase();
  const mandHits = MANDATORY.map(m=>{ const key=norm(m.split(' / ')[0]); return { m, ok: topics.some(t=>norm(t.title).includes(key)) && topics.some(t=>norm(t.title).includes(key) && t.exercises.length>0) }; });
  const mandCovered = mandHits.filter(x=>x.ok).length;

  // vocab metadata
  const total = await prisma.word.count({ where:{lesson:{module:{courseId:c.id}}} });
  const pos = await prisma.word.count({ where:{lesson:{module:{courseId:c.id}}, partOfSpeech:{not:null}} });
  const freq = await prisma.word.count({ where:{lesson:{module:{courseId:c.id}}, frequencyRank:{not:null}} });
  const lessonsTotal = await prisma.lesson.count({ where:{module:{courseId:c.id}} });
  const lessonsA1 = await prisma.lesson.count({ where:{module:{courseId:c.id}, cefrLevel:'A1'} });

  // orthography: count remaining title-cased english examples
  const exWords = await prisma.word.findMany({ where:{lesson:{module:{courseId:c.id}}, example:{not:null}}, select:{example:true} });
  let titleCased=0;
  for(const w of exWords){ const toks=w.example.replace(/[?.!,]/g,'').split(/\s+/).filter(Boolean); if(toks.length>=3 && toks.every(t=>/^[A-Z]/.test(t))) titleCased++; }

  // skillType consistency
  const legacyVocab = await prisma.lesson.count({ where:{module:{courseId:c.id}, skillType:'vocab'} });

  // audio
  const words = await prisma.word.findMany({ where:{lesson:{module:{courseId:c.id}}}, select:{audioUrl:true} });
  const gex = await prisma.grammarExample.findMany({ where:{topic:{courseId:c.id}}, select:{audioUrl:true} });
  const dls = await prisma.dialogueLine.findMany({ where:{dialogue:{courseId:c.id}}, select:{audioUrl:true} });
  const phr = await prisma.phrase.findMany({ where:{collection:{courseId:c.id}}, select:{audioUrl:true} });
  const audioTotal = words.length+gex.length+dls.length+phr.length;
  const audioHave = words.filter(w=>has(w.audioUrl)).length+gex.filter(x=>has(x.audioUrl)).length+dls.filter(x=>has(x.audioUrl)).length+phr.filter(x=>has(x.audioUrl)).length;

  // duplicates (grammar topics by title now)
  const byTitle={}; for(const t of topics) byTitle[t.title]=(byTitle[t.title]||0)+1;
  const dupTopics = Object.values(byTitle).filter(n=>n>1).length;

  // descriptors / placement
  const desc = await prisma.cefrDescriptor.count({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, cefrLevel:'A1' } });
  const plc = await prisma.placementQuestion.count({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, cefrLevel:'A1' } });

  // ── compliance checklist (weighted) ──
  const checks = [
    ['18 mandatory grammar topics w/ exercises', mandCovered/MANDATORY.length, 0.30],
    ['No empty grammar topics', noEx.length===0?1:0, 0.10],
    ['Vocabulary partOfSpeech populated', pos/total, 0.10],
    ['Vocabulary frequencyRank populated', freq/total, 0.10],
    ['CEFR level on all lessons', lessonsA1/lessonsTotal, 0.05],
    ['Orthography normalized (no Title-Case)', titleCased===0?1:0, 0.10],
    ['skillType unified', legacyVocab===0?1:0, 0.05],
    ['Duplicate grammar topics removed', dupTopics===0?1:0, 0.05],
    ['CEFR descriptors present', desc>0?1:0, 0.025],
    ['Placement A1 items present', plc>0?1:0, 0.025],
    ['Audio coverage', audioHave/audioTotal, 0.10],
  ];
  const compliance = checks.reduce((a,[,v,w])=>a+v*w,0)*100;

  console.log('══════════════════════════════════════════════════════');
  console.log('   CEFR A1 ENGLISH (for Tajik) — P0 FINAL REPORT');
  console.log('══════════════════════════════════════════════════════');
  console.log(`Total grammar topics:        ${topics.length}`);
  console.log(`Topics WITH exercises:       ${withEx.length}`);
  console.log(`Topics MISSING exercises:    ${noEx.length}`);
  console.log(`Mandatory A1 topics covered: ${mandCovered}/${MANDATORY.length}`);
  console.log(`Duplicate grammar topics:    ${dupTopics}`);
  console.log(`Duplicate records removed (Phase 3): 5 grammar topics, 0 vocab, 0 modules`);
  console.log('');
  console.log(`Vocabulary metadata coverage:`);
  console.log(`   partOfSpeech:  ${pos}/${total} (${Math.round(pos/total*100)}%)`);
  console.log(`   frequencyRank: ${freq}/${total} (${Math.round(freq/total*100)}%)`);
  console.log(`   CEFR level (lessons): ${lessonsA1}/${lessonsTotal} (${Math.round(lessonsA1/lessonsTotal*100)}%)`);
  console.log('');
  console.log(`Orthography: Title-Cased examples remaining: ${titleCased}`);
  console.log(`skillType legacy "vocab" remaining: ${legacyVocab}`);
  console.log('');
  console.log(`Audio coverage: ${audioHave}/${audioTotal} (${Math.round(audioHave/audioTotal*100)}%)`);
  console.log('');
  console.log('── Compliance checklist ──');
  for(const [name,v,w] of checks) console.log(`   [${(v>=0.999)?'✓':(v>0?'~':'✗')}] ${name}: ${Math.round(v*100)}%  (weight ${w*100}%)`);
  console.log('');
  console.log(`★ CEFR A1 COMPLIANCE: ${compliance.toFixed(1)}%`);
  console.log('══════════════════════════════════════════════════════');
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
