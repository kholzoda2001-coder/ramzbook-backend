import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Створює курси A2 (агар набошад) + Модули 1 «Past Events And Stories» + ЯК дарси
// луғат «Lesson 1: Life Events». Идемпотент — такрор кор карда, дубора намесозад.

const W = (word, ipa, ipaTajik, translation, emoji, example, exampleTrans, pos = 'verb') =>
  ({ word, ipa, ipaTajik, translation, emoji, example, exampleTrans, pos });

const LESSON = {
  title: 'Lesson 1: Life Events',
  titleTranslated: 'Дарси 1: Ҳодисаҳои зиндагӣ',
  emoji: '📖',
  words: [
    W('Born','/bɔːn/','борн','Таваллуд шудан','👶','I was born in Dushanbe.','Ман дар Душанбе таваллуд шудам.'),
    W('Grow up','/ɡrəʊ ʌp/','гроу ап','Калон шудан','🧒','She grew up in a village.','Ӯ дар деҳа калон шуд.'),
    W('Move','/muːv/','мув','Кӯчидан','📦','We moved to a new house.','Мо ба хонаи нав кӯчидем.'),
    W('Graduate','/ˈɡrædʒueɪt/','грэдюейт','Хатм кардан','🎓','He graduated last year.','Ӯ соли гузашта хатм кард.'),
    W('Meet','/miːt/','мит','Вохӯрдан','🤝','I met my best friend at school.','Ман бо дӯсти беҳтаринам дар мактаб вохӯрдам.'),
    W('Marry','/ˈmæri/','мэри','Издивоҷ кардан','💍','They married in 2015.','Онҳо соли 2015 издивоҷ карданд.'),
    W('Travel','/ˈtrævəl/','трэвел','Сафар кардан','✈️','We travelled to Turkey.','Мо ба Туркия сафар кардем.'),
    W('Change','/tʃeɪndʒ/','чейнҷ','Тағйир додан','🔄','My life changed a lot.','Зиндагии ман хеле тағйир ёфт.'),
    W('Become','/bɪˈkʌm/','биком','Шудан','🌟','She became a doctor.','Ӯ духтур шуд.'),
    W('Retire','/rɪˈtaɪə/','ритайер','Ба нафақа баромадан','👴','My grandfather retired at 60.','Бобоям дар 60-солагӣ ба нафақа баромад.'),
    W('Start','/stɑːt/','старт','Сар кардан','▶️','I started a new job.','Ман кори нав сар кардам.'),
    W('Finish','/ˈfɪnɪʃ/','финиш','Тамом кардан','🏁','He finished university.','Ӯ донишгоҳро тамом кард.'),
  ],
};

async function main() {
  const en = await prisma.language.findFirst({ where: { code: 'en' } });
  const tg = await prisma.language.findFirst({ where: { code: 'tg' } });

  // 1. Course A2 (find or create)
  let course = await prisma.course.findFirst({
    where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'A2' },
  });
  if (!course) {
    course = await prisma.course.create({
      data: {
        targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'A2',
        title: 'Англисӣ — A2', description: 'Elementary',
        emoji: '🇬🇧', color: '#3B82F6', order: 1, isActive: true,
      },
    });
    console.log('✅ Курси A2 сохта шуд:', course.id);
  } else {
    console.log('↷ Курси A2 аллакай ҳаст:', course.id);
  }

  // 2. Module 1 (find or create)
  let mod = await prisma.module.findFirst({
    where: { courseId: course.id, title: 'Module 1: Past Events And Stories' },
  });
  if (!mod) {
    mod = await prisma.module.create({
      data: {
        courseId: course.id,
        title: 'Module 1: Past Events And Stories',
        titleTranslated: 'Модули 1: Ҳодисаҳои гузашта ва Ҳикоятҳо',
        emoji: '📖', color: '#3B82F6', order: 0, isActive: true,
      },
    });
    console.log('✅ Модули 1 сохта шуд:', mod.id);
  } else {
    console.log('↷ Модули 1 аллакай ҳаст:', mod.id);
  }

  // 3. ONE vocabulary lesson (skip if it already exists)
  const exists = await prisma.lesson.findFirst({ where: { moduleId: mod.id, title: LESSON.title } });
  if (exists) {
    console.log('↷ Дарс аллакай ҳаст — дубора сохта намешавад:', exists.id);
    await prisma.$disconnect();
    return;
  }

  const lesson = await prisma.lesson.create({
    data: {
      moduleId: mod.id, title: LESSON.title, titleTranslated: LESSON.titleTranslated,
      type: 'vocab', skillType: 'vocabulary', cefrLevel: 'A2',
      emoji: LESSON.emoji, xpReward: 15, duration: 5, order: 0, isActive: true,
    },
  });
  let wo = 0;
  for (const w of LESSON.words) {
    await prisma.word.create({
      data: {
        lessonId: lesson.id, word: w.word, translation: w.translation, emoji: w.emoji,
        ipa: w.ipa, ipaTajik: w.ipaTajik, example: w.example, exampleTrans: w.exampleTrans,
        partOfSpeech: w.pos, frequencyRank: 3000 + wo, order: wo++,
      },
    });
  }
  console.log(`✅ Дарс сохта шуд: "${LESSON.title}" (${LESSON.words.length} калима) — id=${lesson.id}`);

  // bump content version so app + admin see it
  await prisma.appSetting.update({ where: { key: 'content_version' }, data: { valueJson: '"1"' } });
  console.log('✅ content_version нав шуд (барнома фавран мебинад)');

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
