import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ── Ислоҳи 1: 6 муколама сатри корбар (isUser) надоранд ──
// Дар Машқи гуфтугӯ (roleplay) хонанда танҳо сатрҳои isUser-ро мегӯяд (микрофон).
// Нақши омӯзандаро ба гӯяндаи мувофиқ медиҳем (мизоҷ/сайёҳ/ҷавобдиҳанда).
const USER_SPEAKERS = {
  'cmqphzerx002mvk0v3d0w4b93': 'Umar',            // My Daily Routine — ҷавоб медиҳад
  'cmqpqk94p003fqfo8k7pmp0ag': 'Customer',        // At the Restaurant
  'cmqpqrs8d003f129aeuy5ajx4': 'B',               // Home Conversation — ҷавоб медиҳад
  'cmqqbem180043ftiiglc5pb4z': 'Customer',        // Store Conversation
  'cmqqch2gb003jrhonrz7nf8hy': 'Tourist',         // Asking For Directions — роҳ мепурсад
  'cmqqhhhej004blnt2ref3sgfq': 'Customer',        // Clothes Shopping Conversation
};

// ── Ислоҳи 2: имтиҳонҳои <5 савол → 5 савол ──
// Дарвозаи 80%: бо 5 савол 1 хато ҷоиз мешавад (4/5=80%), бо 3-4 савол бояд 100% мезад.
const Q = (question, questionTranslated, options, correctIndex, explanation) =>
  ({ question, questionTranslated, options, correctIndex, explanation });

const EXTRA_QUESTIONS = {
  // M3 — Numbers And Time (3Q → 5Q)
  'cmqpfwhkp0011pxxb5r8skfhy': [
    Q("Translate 'Понздаҳ':", 'Тарҷума кунед.', ['Fifteen','Fifty','Five','Fourteen'], 0, 'Понздаҳ = Fifteen.'),
    Q("Translate 'Ҷумъа':", 'Тарҷума кунед.', ['Friday','Monday','Sunday','Saturday'], 0, 'Ҷумъа = Friday.'),
  ],
  // M4 — Daily Routines (3Q → 5Q)
  'cmqphzc7n002hvk0v5ekc1u4m': [
    Q('Choose the correct verb: She ___ TV in the evening.', 'Феъли дурустро интихоб кунед.', ['watches','watch','watching','is watch'], 0, 'Бо He/She/It → watches.'),
    Q("Translate 'Хоб рафтан':", 'Тарҷума кунед.', ['Go to bed','Wake up','Have lunch','Go to work'], 0, 'Хоб рафтан = Go to bed.'),
  ],
  // M5 — Food And Drinks (4Q → 5Q)
  'cmqpqkbrj003qqfo8m6pssg2o': [
    Q("Choose correct: I don't have ___ apples.", 'Дурусташро интихоб кунед.', ['any','some','a','an'], 0, 'Дар ҷумлаи инкорӣ → any.'),
  ],
  // M6 — Home And Objects (4Q → 5Q)
  'cmqpqrv6o003p129asvugc9dh': [
    Q('Choose correct: ___ a lamp in the bedroom.', 'Дурусташро интихоб кунед.', ['There is','There are','It is','They are'], 0, 'Исми танҳо → There is.'),
  ],
  // M7 — Shopping (4Q → 5Q)
  'cmqqbeob0004hftiiomorllif': [
    Q("What is 'Арзон' in English?", 'Тарҷума кунед.', ['Cheap','Expensive','Money','Price'], 0, 'Арзон = Cheap.'),
  ],
  // M8 — Places And Directions (4Q → 5Q)
  'cmqqch8u4003xrhond5gtjqus': [
    Q("Translate 'Рост Равед':", 'Тарҷума кунед.', ['Go Straight','Turn Left','Turn Right','Stop'], 0, 'Рост равед = Go straight.'),
  ],
  // M9 — Clothes And Colors (4Q → 5Q)
  'cmqqhhlcw004olnt2b1x2t93y': [
    Q("What Is 'Сиёҳ' In English?", 'Тарҷума кунед.', ['Black','White','Blue','Green'], 0, 'Сиёҳ = Black.'),
  ],
  // M10 — Health (матни Sara, 4Q → 5Q)
  'cmqqm4ibr0053wtt8fgol5xap': [
    Q('Where does Sara call?', 'Сара ба куҷо занг мезанад?', ['The clinic','The school','The shop','The pharmacy'], 0, 'Матн: She calls the clinic.'),
  ],
  // M11 — Nature/School (матни Madina, 4Q → 5Q)
  'cmr4wei5v006r1394moor2s00': [
    Q('What is the lesson like?', 'Дарс чӣ гуна аст?', ['Fun','Boring','Long','Difficult'], 0, 'Матн: The lesson is fun.'),
  ],
};

async function main() {
  // 1) isUser
  console.log('── Ислоҳи муколамаҳо (isUser) ──');
  for (const [dialogueId, speaker] of Object.entries(USER_SPEAKERS)) {
    const d = await prisma.dialogue.findUnique({ where: { id: dialogueId }, include: { lines: true } });
    if (!d) { console.log(`⚠️ Муколама ${dialogueId} ёфт нашуд`); continue; }
    if (d.lines.some(l => l.isUser)) { console.log(`↷ "${d.title}" аллакай сатри корбар дорад`); continue; }
    const r = await prisma.dialogueLine.updateMany({
      where: { dialogueId, speaker },
      data: { isUser: true },
    });
    console.log(`✅ "${d.title}": ${r.count} сатри "${speaker}" → нақши хонанда`);
  }

  // 2) exam questions
  console.log('\n── Ислоҳи имтиҳонҳо (то 5 савол) ──');
  for (const [exerciseId, questions] of Object.entries(EXTRA_QUESTIONS)) {
    const ex = await prisma.comprehensionExercise.findUnique({ where: { id: exerciseId }, include: { questions: true } });
    if (!ex) { console.log(`⚠️ Имтиҳон ${exerciseId} ёфт нашуд`); continue; }
    if (ex.questions.length >= 5) { console.log(`↷ "${ex.title}" аллакай ${ex.questions.length} савол дорад`); continue; }
    let order = Math.max(...ex.questions.map(q => q.order)) + 1;
    for (const q of questions) {
      await prisma.comprehensionQuestion.create({ data: { exerciseId, ...q, order: order++ } });
    }
    const total = ex.questions.length + questions.length;
    console.log(`✅ "${ex.title}": +${questions.length} савол → ${total} (хатои ҷоиз: ${Math.floor(total - 0.8 * total)})`);
  }

  console.log('\nТамом.');
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
