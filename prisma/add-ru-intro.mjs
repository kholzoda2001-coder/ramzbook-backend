import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Ҷустуҷӯи забонҳои русӣ ва тоҷикӣ...');
  const target = await prisma.language.findUnique({ where: { code: 'ru' } });
  const native = await prisma.language.findUnique({ where: { code: 'tg' } });
  
  if (!target || !native) {
    throw new Error("Хатогӣ: Забонҳои 'ru' ё 'tg' дар база ёфт нашуданд.");
  }

  console.log('Сохтан ё пайдо кардани курси русӣ барои тоҷикон (A1)...');
  const course = await prisma.course.upsert({
    where: {
      targetLanguageId_nativeLanguageId_level: {
        targetLanguageId: target.id,
        nativeLanguageId: native.id,
        level: 'A1'
      }
    },
    update: {},
    create: {
      targetLanguageId: target.id,
      nativeLanguageId: native.id,
      level: 'A1',
      title: 'Забони русӣ — A1',
      description: 'Курси асосӣ барои омӯзиши забони русӣ',
      emoji: '🇷🇺',
      color: '#3B82F6',
      isActive: true,
      isPremium: false
    }
  });

  console.log('Илова кардани модули "Шиносоӣ" ва 3 калима...');
  const newModule = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Введение',
      titleTranslated: 'Шиносоӣ',
      emoji: '👋',
      order: 1,
      isActive: true,
      lessons: {
        create: [
          {
            title: 'Асосҳо',
            titleTranslated: 'Асосҳо',
            type: 'vocab',
            emoji: '🌟',
            order: 1,
            words: {
              create: [
                {
                  word: 'Привет',
                  translation: 'Салом',
                  emoji: '👋',
                  ipa: '[prʲɪˈvʲet]',
                  ipaTajik: 'привет',
                  example: 'Привет! Как дела?',
                  exampleTrans: 'Салом! Чӣ ҳол дорӣ?',
                  partOfSpeech: 'greeting',
                  frequencyRank: 1
                },
                {
                  word: 'Пока',
                  translation: 'Хайр',
                  emoji: '👋',
                  ipa: '[pɐˈka]',
                  ipaTajik: 'пака',
                  example: 'Пока, до завтра!',
                  exampleTrans: 'Хайр, то пагоҳ!',
                  partOfSpeech: 'greeting',
                  frequencyRank: 2
                },
                {
                  word: 'Спасибо',
                  translation: 'Раҳмат / Ташаккур',
                  emoji: '🙏',
                  ipa: '[spɐˈsʲibə]',
                  ipaTajik: 'спасибо',
                  example: 'Спасибо большое!',
                  exampleTrans: 'Раҳмати калон!',
                  partOfSpeech: 'expression',
                  frequencyRank: 3
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('✅ Модул ва дарси Шиносоӣ бо 3 калимаи асосӣ бо муваффақият илова шуд!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
