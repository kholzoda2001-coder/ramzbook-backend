import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ── Part-of-speech lexicons (matched on lowercased headword) ──
const VERBS = new Set(['arrive','buy','come','cook','do','drink','drive','eat','find','get up','go','learn','like','listen','live','make','need','pay','play','read','return','run','sleep','speak','study','swim','try on','turn','wake up','walk','want','wash','watch','work','write','change','cost','brush','can','is','find']);
const ADJECTIVES = new Set(['beautiful','big','bright','cheap','clean','colorful','comfortable','dark','dirty','elderly','expensive','full','happy','hot','hungry','long','loose','new','nice','old','pale','sad','short','small','strong','tall','thirsty','tight','ugly','young','black','blue','brown','gray','green','orange','pink','purple','red','white','yellow','beige','gold','silver','maroon','navy','dark blue','light green']);
const PREPOSITIONS = new Set(['above','across from','behind','below','between','far','in','in front of','near','next to','on','under','from','here']);
const PRONOUNS = new Set(['i','you','who','what']);
const DETERMINERS = new Set(['my','your']);
const NUMERALS = new Set(['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety','one hundred']);
const INTERJECTIONS = new Set(['hello','hi','goodbye','bye','good morning','good afternoon','good evening','good night','please','sorry','thank you',"you're welcome",'yes','no','ok']);

function classify(word){
  const w = word.toLowerCase().trim();
  if(INTERJECTIONS.has(w)) return 'interjection';
  if(NUMERALS.has(w)) return 'numeral';
  if(PREPOSITIONS.has(w)) return 'preposition';
  if(PRONOUNS.has(w)) return 'pronoun';
  if(DETERMINERS.has(w)) return 'determiner';
  if(VERBS.has(w)) return 'verb';
  if(ADJECTIVES.has(w)) return 'adjective';
  return 'noun';
}

// ── Core high-frequency English words (rough corpus order) present in the course ──
const CORE = ['i','you','is','a','the','my','your','no','yes','one','two','three','name','what','who','go','here','do','have','like','good','work','come','eat','time','day','man','woman','new','old','big','from','please','hello','water','house','school','friend','family','food','money','four','five','book','happy','small','play','need','want','live','read','study','speak','make','home','city','country'];
const coreRank = Object.fromEntries(CORE.map((w,i)=>[w,i+1]));

async function main(){
  const course = await prisma.course.findFirst({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, level:'A1' }});

  // CEFR level on every lesson
  const cefr = await prisma.lesson.updateMany({ where:{ module:{courseId:course.id} }, data:{ cefrLevel:'A1' } });

  // words in teaching order
  const words = await prisma.word.findMany({
    where:{ lesson:{ module:{ courseId:course.id } } },
    orderBy:[{ lesson:{ module:{ order:'asc' } } }, { lesson:{ order:'asc' } }, { order:'asc' }],
    select:{ id:true, word:true }
  });

  let pos=0, freq=0, tail=1000; const posCount={};
  for(const w of words){
    const p = classify(w.word);
    posCount[p]=(posCount[p]||0)+1;
    const lw = w.word.toLowerCase().trim();
    const rank = coreRank[lw] ?? (tail++);
    await prisma.word.update({ where:{id:w.id}, data:{ partOfSpeech:p, frequencyRank:rank } });
    pos++; freq++;
  }

  console.log('=== PHASE 4 SUMMARY ===');
  console.log('lessons set cefrLevel=A1:', cefr.count);
  console.log('words updated (partOfSpeech + frequencyRank):', pos);
  console.log('POS distribution:', JSON.stringify(posCount));
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
