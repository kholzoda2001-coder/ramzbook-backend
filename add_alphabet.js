const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const vowels = [
  { word: 'A a', translation: 'А а', ipa: '/eɪ/', ipaTajik: '[Эй]', emoji: '🅰️', example: 'Apple', exampleTrans: 'Себ' },
  { word: 'E e', translation: 'Е е', ipa: '/iː/', ipaTajik: '[И]', emoji: '🇪', example: 'Elephant', exampleTrans: 'Фил' },
  { word: 'I i', translation: 'И и', ipa: '/aɪ/', ipaTajik: '[Ай]', emoji: 'ℹ️', example: 'Ice', exampleTrans: 'Ях' },
  { word: 'O o', translation: 'О о', ipa: '/oʊ/', ipaTajik: '[Оу]', emoji: '🅾️', example: 'Orange', exampleTrans: 'Афлесун' },
  { word: 'U u', translation: 'У у', ipa: '/juː/', ipaTajik: '[Ю]', emoji: '⛎', example: 'Umbrella', exampleTrans: 'Чатр' },
  { word: 'Y y', translation: 'Й й', ipa: '/waɪ/', ipaTajik: '[Вай]', emoji: '✌️', example: 'Yellow', exampleTrans: 'Зард' },
];

const consonants = [
  { word: 'B b', translation: 'Б б', ipa: '/biː/', ipaTajik: '[Би]', emoji: '🅱️', example: 'Ball', exampleTrans: 'Тӯб' },
  { word: 'C c', translation: 'С с / К к', ipa: '/siː/', ipaTajik: '[Си]', emoji: '©️', example: 'Cat', exampleTrans: 'Гурба' },
  { word: 'D d', translation: 'Д д', ipa: '/diː/', ipaTajik: '[Ди]', emoji: '🇩', example: 'Dog', exampleTrans: 'Саг' },
  { word: 'F f', translation: 'Ф ф', ipa: '/ɛf/', ipaTajik: '[Эф]', emoji: '🇫', example: 'Fish', exampleTrans: 'Моҳӣ' },
  { word: 'G g', translation: 'Г г / Ҷ ҷ', ipa: '/dʒiː/', ipaTajik: '[Ҷи]', emoji: '🇬', example: 'Goat', exampleTrans: 'Буз' },
  { word: 'H h', translation: 'Ҳ ҳ', ipa: '/eɪtʃ/', ipaTajik: '[Эйч]', emoji: '🇭', example: 'Hat', exampleTrans: 'Кулоҳ' },
  { word: 'J j', translation: 'Ҷ ҷ', ipa: '/dʒeɪ/', ipaTajik: '[Ҷей]', emoji: '🇯', example: 'Juice', exampleTrans: 'Афшура' },
  { word: 'K k', translation: 'К к', ipa: '/keɪ/', ipaTajik: '[Кей]', emoji: '🇰', example: 'Key', exampleTrans: 'Калид' },
  { word: 'L l', translation: 'Л л', ipa: '/ɛl/', ipaTajik: '[Эл]', emoji: '🇱', example: 'Lion', exampleTrans: 'Шер' },
  { word: 'M m', translation: 'М м', ipa: '/ɛm/', ipaTajik: '[Эм]', emoji: '🇲', example: 'Monkey', exampleTrans: 'Маймун' },
  { word: 'N n', translation: 'Н н', ipa: '/ɛn/', ipaTajik: '[Эн]', emoji: '🇳', example: 'Nest', exampleTrans: 'Лона' },
  { word: 'P p', translation: 'П п', ipa: '/piː/', ipaTajik: '[Пи]', emoji: '🅿️', example: 'Pen', exampleTrans: 'Қалам' },
  { word: 'Q q', translation: 'Кв кв', ipa: '/kjuː/', ipaTajik: '[Кю]', emoji: '🇶', example: 'Queen', exampleTrans: 'Малика' },
  { word: 'R r', translation: 'Р р', ipa: '/ɑːr/', ipaTajik: '[Ар]', emoji: '🇷', example: 'Rabbit', exampleTrans: 'Харгӯш' },
  { word: 'S s', translation: 'С с', ipa: '/ɛs/', ipaTajik: '[Эс]', emoji: '🇸', example: 'Sun', exampleTrans: 'Офтоб' },
  { word: 'T t', translation: 'Т т', ipa: '/tiː/', ipaTajik: '[Ти]', emoji: '🇹', example: 'Tree', exampleTrans: 'Дарахт' },
  { word: 'V v', translation: 'В в', ipa: '/viː/', ipaTajik: '[Ви]', emoji: '🇻', example: 'Van', exampleTrans: 'Мулламошин' },
  { word: 'W w', translation: 'В в (лабӣ)', ipa: '/ˈdʌbəl.juː/', ipaTajik: '[Дабл-ю]', emoji: '🇼', example: 'Water', exampleTrans: 'Об' },
  { word: 'X x', translation: 'Кс кс', ipa: '/ɛks/', ipaTajik: '[Экс]', emoji: '❌', example: 'X-ray', exampleTrans: 'Рентген' },
  { word: 'Z z', translation: 'З з', ipa: '/zɛd/ /ziː/', ipaTajik: '[Зед / Зи]', emoji: '💤', example: 'Zoo', exampleTrans: 'Боғи ҳайвонот' },
];

async function run() {
  let course = await prisma.course.findFirst({
    where: { level: 'A1', targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' } },
    include: { modules: true }
  });

  if (!course) {
    console.log("English A1 course not found. Creating it now...");
    const enLang = await prisma.language.findUnique({ where: { code: 'en' } });
    const tgLang = await prisma.language.findUnique({ where: { code: 'tg' } });
    
    course = await prisma.course.create({
      data: {
        title: 'Англисӣ — Сатҳи A1',
        description: 'Курси мукаммали забони англисӣ барои шурӯъкунандагон (A1).',
        emoji: '🇬🇧',
        level: 'A1',
        color: '#3B82F6',
        targetLanguageId: enLang.id,
        nativeLanguageId: tgLang.id
      },
      include: { modules: true }
    });
  }

  // Shift existing modules if any
  if (course.modules && course.modules.length > 0) {
    for (const m of course.modules) {
      await prisma.module.update({
        where: { id: m.id },
        data: { order: m.order + 1 }
      });
    }
  }

  console.log("Creating Alphabet module...");
  const newModule = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Alphabet & Sounds',
      titleTranslated: 'Алифбо ва Садоҳо',
      emoji: '🅰️',
      order: 0,
    }
  });

  console.log("Creating Vowels lesson...");
  const vowelsLesson = await prisma.lesson.create({
    data: {
      moduleId: newModule.id,
      title: 'Vowels',
      titleTranslated: 'Садонокҳо',
      emoji: '🅰️',
      order: 0,
      type: 'vocabulary'
    }
  });

  console.log("Creating Consonants lesson...");
  const consLesson = await prisma.lesson.create({
    data: {
      moduleId: newModule.id,
      title: 'Consonants',
      titleTranslated: 'Ҳамсадоҳо',
      emoji: '🅱️',
      order: 1,
      type: 'vocabulary'
    }
  });

  console.log("Adding vowels...");
  for (let i = 0; i < vowels.length; i++) {
    const v = vowels[i];
    await prisma.word.create({
      data: {
        lessonId: vowelsLesson.id,
        word: v.word,
        translation: v.translation,
        ipa: v.ipa,
        ipaTajik: v.ipaTajik,
        emoji: v.emoji,
        example: v.example,
        exampleTrans: v.exampleTrans,
        difficulty: 1,
        order: i
      }
    });
  }

  console.log("Adding consonants...");
  for (let i = 0; i < consonants.length; i++) {
    const c = consonants[i];
    await prisma.word.create({
      data: {
        lessonId: consLesson.id,
        word: c.word,
        translation: c.translation,
        ipa: c.ipa,
        ipaTajik: c.ipaTajik,
        emoji: c.emoji,
        example: c.example,
        exampleTrans: c.exampleTrans,
        difficulty: 1,
        order: i
      }
    });
  }

  console.log("Done! Course, module and lessons created successfully.");
}

run().catch(console.error).finally(() => prisma.$disconnect());
