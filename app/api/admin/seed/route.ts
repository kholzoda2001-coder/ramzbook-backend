import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const results: string[] = [];
  const url = new URL(req.url);
  const reset = url.searchParams.get('reset') === 'true';

  try {
    // ── Optional reset: clear all course/unit/lesson/word data ─────────────
    if (reset) {
      await prisma.userProgress.deleteMany();
      await prisma.lessonWord.deleteMany();
      await prisma.word.deleteMany();
      await prisma.lesson.deleteMany();
      await prisma.unit.deleteMany();
      await prisma.course.deleteMany();
      await prisma.userLanguage.deleteMany();
      await prisma.language.deleteMany();
      results.push('🧹 Маълумоти кӯҳна нест карда шуд');
    }

    // 1. ── Users (10 users: 5 Free, 5 Premium) ──────────────────────
    const userCount = await prisma.user.count();
    if (userCount < 10) {
      const hash = await bcrypt.hash('password123', 10);
      for (let i = 1; i <= 10; i++) {
        const isPremium = i <= 5;
        const user = await prisma.user.create({
          data: {
            name: `Test User ${i}`,
            email: `user${i}@ramz.tj`,
            passwordHash: hash,
            isPremium,
            premiumPlan: isPremium ? 'yearly' : null,
            premiumStartedAt: isPremium ? new Date() : null,
            premiumExpiresAt: isPremium ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
            totalXp: Math.floor(Math.random() * 20000),
            streak: Math.floor(Math.random() * 100),
            gems: Math.floor(Math.random() * 500),
          }
        });

        if (isPremium) {
          await prisma.subscription.create({
            data: {
              userId: user.id,
              plan: 'yearly',
              status: 'active',
              googleProductId: 'ramz_yearly',
              googlePurchaseToken: `token_test_${i}_${Date.now()}`,
              startedAt: new Date(),
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            }
          });
          await prisma.payment.create({
            data: {
              userId: user.id,
              amount: 29.99,
              currency: 'USD',
              plan: 'yearly',
              status: 'success',
            }
          });
        }
      }
      results.push('✅ 10 корбар (5 Premium, 5 Free), 5 обуна ва 5 пардохт ворид карда шуд');
    } else {
      results.push(`⚠️ Корбарон аллакай мавҷуданд (${userCount})`);
    }

    // 2. ── Languages (3 langs) ──────────────────────────────────────────
    const langCount = await prisma.language.count();
    if (langCount === 0) {
      await prisma.language.createMany({
        data: [
          { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', sortOrder: 1 },
          { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺', sortOrder: 2 },
          { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', sortOrder: 3 },
        ]
      });
      results.push('✅ 3 забон ворид карда шуд');
    } else {
      results.push(`⚠️ Забонҳо аллакай мавҷуданд (${langCount})`);
    }

    // 3. ── Courses, Units, Lessons, Words ──────────────────────────────
    const courseCount = await prisma.course.count();
    if (courseCount === 0) {
      const langEn = await prisma.language.findUnique({ where: { code: 'en' } });
      if (langEn) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
        let lessonIdList: string[] = [];

        // Real vocabulary grouped by level and unit theme
        const vocabData: Record<string, Array<{ title: string; emoji: string; words: Array<{ w: string; t: string; ipa: string; ex: string; exTj: string; emoji: string }> }>> = {
          A1: [
            {
              title: 'Саломутобиат (Greetings)',
              emoji: '👋',
              words: [
                { w: 'Hello',          t: 'Салом',                    ipa: '/həˈloʊ/',       ex: 'Hello! How are you?',           exTj: 'Салом! Шумо чӣ хел?',         emoji: '👋' },
                { w: 'Goodbye',        t: 'Хайр / Худоҳофиз',         ipa: '/ˌɡʊdˈbaɪ/',    ex: 'Goodbye! See you tomorrow.',    exTj: 'Хайр! То фардо.',             emoji: '👋' },
                { w: 'Thank you',      t: 'Ташаккур',                 ipa: '/ˈθæŋk juː/',   ex: 'Thank you very much!',          exTj: 'Хеле зиёд ташаккур!',         emoji: '🙏' },
                { w: 'Please',         t: 'Лутфан',                   ipa: '/pliːz/',        ex: 'Please sit down.',              exTj: 'Лутфан нишинед.',             emoji: '🙏' },
                { w: 'Sorry',          t: 'Бубахшед / Узр',           ipa: '/ˈsɒri/',       ex: 'Sorry, I am late.',             exTj: 'Бубахшед, ман дер кардам.',   emoji: '😔' },
              ]
            },
            {
              title: 'Рақамҳо (Numbers)',
              emoji: '🔢',
              words: [
                { w: 'One',    t: 'Як',    ipa: '/wʌn/',    ex: 'I have one cat.',       exTj: 'Ман як гурба дорам.',    emoji: '1️⃣' },
                { w: 'Two',    t: 'Ду',    ipa: '/tuː/',    ex: 'She has two books.',    exTj: 'Ӯ ду китоб дорад.',      emoji: '2️⃣' },
                { w: 'Three',  t: 'Се',    ipa: '/θriː/',   ex: 'Three plus two is five.', exTj: 'Се ва ду панҷ мешавад.',  emoji: '3️⃣' },
                { w: 'Four',   t: 'Чор',   ipa: '/fɔːr/',   ex: 'Four seasons in a year.', exTj: 'Дар як сол чор фасл аст.', emoji: '4️⃣' },
                { w: 'Five',   t: 'Панҷ',  ipa: '/faɪv/',   ex: 'Five fingers on a hand.', exTj: 'Дар даст панҷ ангушт.',   emoji: '🖐️' },
              ]
            },
            {
              title: 'Рангҳо (Colors)',
              emoji: '🎨',
              words: [
                { w: 'Red',    t: 'Сурх',    ipa: '/rɛd/',    ex: 'The apple is red.',     exTj: 'Себ сурх аст.',       emoji: '🔴' },
                { w: 'Blue',   t: 'Кабуд',   ipa: '/bluː/',   ex: 'The sky is blue.',      exTj: 'Осмон кабуд аст.',    emoji: '🔵' },
                { w: 'Green',  t: 'Сабз',    ipa: '/ɡriːn/',  ex: 'Grass is green.',       exTj: 'Алаф сабз аст.',      emoji: '🟢' },
                { w: 'White',  t: 'Сафед',   ipa: '/waɪt/',   ex: 'Snow is white.',        exTj: 'Барф сафед аст.',     emoji: '⚪' },
                { w: 'Black',  t: 'Сиёҳ',    ipa: '/blæk/',   ex: 'The night is black.',   exTj: 'Шаб сиёҳ аст.',       emoji: '⚫' },
              ]
            },
            {
              title: 'Оила (Family)',
              emoji: '👨‍👩‍👧',
              words: [
                { w: 'Mother',   t: 'Модар / Мама',   ipa: '/ˈmʌðər/',   ex: 'My mother is kind.',    exTj: 'Модарам меҳрубон аст.',   emoji: '👩' },
                { w: 'Father',   t: 'Падар / Бобо',   ipa: '/ˈfɑːðər/',  ex: 'My father works hard.', exTj: 'Падарам сахт кор мекунад.', emoji: '👨' },
                { w: 'Sister',   t: 'Хоҳар',           ipa: '/ˈsɪstər/',  ex: 'My sister is young.',   exTj: 'Хоҳарам ҷавон аст.',      emoji: '👧' },
                { w: 'Brother',  t: 'Бародар',         ipa: '/ˈbrʌðər/', ex: 'My brother plays football.', exTj: 'Бародарам футбол мебозад.', emoji: '👦' },
                { w: 'Family',   t: 'Оила / Хонавода', ipa: '/ˈfæməli/', ex: 'I love my family.',     exTj: 'Ман оиламро дӯст медорам.', emoji: '👨‍👩‍👧' },
              ]
            },
            {
              title: 'Хӯрок ва Нӯшокӣ (Food & Drinks)',
              emoji: '🍎',
              words: [
                { w: 'Water',   t: 'Об',     ipa: '/ˈwɔːtər/',  ex: 'Drink water every day.',  exTj: 'Ҳар рӯз об нӯшед.',      emoji: '💧' },
                { w: 'Bread',   t: 'Нон',    ipa: '/brɛd/',      ex: 'I eat bread for breakfast.', exTj: 'Ман барои нӯштахӯрӣ нон мехӯрам.', emoji: '🍞' },
                { w: 'Apple',   t: 'Себ',    ipa: '/ˈæpəl/',    ex: 'An apple a day.',         exTj: 'Ҳар рӯз як себ.',         emoji: '🍎' },
                { w: 'Milk',    t: 'Шир',    ipa: '/mɪlk/',     ex: 'Milk is healthy.',        exTj: 'Шир барои саломатӣ хуб аст.', emoji: '🥛' },
                { w: 'Tea',     t: 'Чой',    ipa: '/tiː/',       ex: 'I drink tea in the morning.', exTj: 'Ман субҳ чой менӯшам.',  emoji: '🍵' },
              ]
            },
            {
              title: 'Ҳайвонот (Animals)',
              emoji: '🐾',
              words: [
                { w: 'Cat',    t: 'Гурба',  ipa: '/kæt/',   ex: 'The cat is sleeping.',    exTj: 'Гурба хоб аст.',         emoji: '🐱' },
                { w: 'Dog',    t: 'Саг',    ipa: '/dɒɡ/',   ex: 'Dogs are loyal.',         exTj: 'Сагҳо садоқатманданд.',  emoji: '🐶' },
                { w: 'Bird',   t: 'Паранда',ipa: '/bɜːrd/', ex: 'Birds can fly.',          exTj: 'Парандагон парвоз мекунанд.', emoji: '🐦' },
                { w: 'Fish',   t: 'Моҳӣ',  ipa: '/fɪʃ/',   ex: 'Fish live in water.',     exTj: 'Моҳиён дар об зиндагӣ мекунанд.', emoji: '🐟' },
                { w: 'Horse',  t: 'Асп',   ipa: '/hɔːrs/', ex: 'The horse runs fast.',    exTj: 'Асп тез медавад.',        emoji: '🐴' },
              ]
            },
          ],
          A2: [
            {
              title: 'Ҷисм ва Саломатӣ (Body & Health)',
              emoji: '💪',
              words: [
                { w: 'Head',    t: 'Сар',     ipa: '/hɛd/',    ex: 'My head hurts.',          exTj: 'Сарам дард мекунад.',    emoji: '🧠' },
                { w: 'Eye',     t: 'Чашм',    ipa: '/aɪ/',     ex: 'She has blue eyes.',      exTj: 'Чашмонаш кабуданд.',     emoji: '👁️' },
                { w: 'Heart',   t: 'Дил',     ipa: '/hɑːrt/',  ex: 'My heart beats fast.',    exTj: 'Дилам тез мезанад.',     emoji: '❤️' },
                { w: 'Doctor',  t: 'Духтур',  ipa: '/ˈdɒktər/', ex: 'I need a doctor.',      exTj: 'Ман ба духтур ниёз дорам.', emoji: '👨‍⚕️' },
                { w: 'Healthy', t: 'Солим',   ipa: '/ˈhɛlθi/', ex: 'Eat healthy food.',      exTj: 'Хӯроки солим хӯред.',    emoji: '🥗' },
              ]
            },
            {
              title: 'Шаҳр ва Ҷойҳо (City & Places)',
              emoji: '🏙️',
              words: [
                { w: 'School',   t: 'Мактаб',      ipa: '/skuːl/',    ex: 'I go to school.',          exTj: 'Ман ба мактаб мераям.',    emoji: '🏫' },
                { w: 'Market',   t: 'Бозор',       ipa: '/ˈmɑːrkɪt/', ex: 'We buy food at the market.', exTj: 'Мо дар бозор хӯрок мехарем.', emoji: '🛒' },
                { w: 'Hospital', t: 'Беморхона',   ipa: '/ˈhɒspɪtl/', ex: 'He is in the hospital.', exTj: 'Ӯ дар беморхона аст.',   emoji: '🏥' },
                { w: 'Park',     t: 'Боғ / Парк',  ipa: '/pɑːrk/',   ex: 'Children play in the park.', exTj: 'Кӯдакон дар боғ мебозанд.', emoji: '🌳' },
                { w: 'Street',   t: 'Кӯча',        ipa: '/striːt/',   ex: 'The street is busy.',      exTj: 'Кӯча шулуғ аст.',         emoji: '🛣️' },
              ]
            },
            {
              title: 'Вақт ва Рӯзҳо (Time & Days)',
              emoji: '📅',
              words: [
                { w: 'Today',     t: 'Имрӯз',    ipa: '/təˈdeɪ/',    ex: 'Today is Monday.',          exTj: 'Имрӯз душанбе аст.',       emoji: '📅' },
                { w: 'Tomorrow',  t: 'Фардо',    ipa: '/təˈmɒrəʊ/',  ex: 'See you tomorrow.',         exTj: 'То фардо.',                emoji: '🌅' },
                { w: 'Yesterday', t: 'Дирӯз',    ipa: '/ˈjɛstərdeɪ/', ex: 'Yesterday was Sunday.',   exTj: 'Дирӯз якшанбе буд.',       emoji: '🌇' },
                { w: 'Morning',   t: 'Субҳ',     ipa: '/ˈmɔːrnɪŋ/', ex: 'Good morning!',             exTj: 'Субҳ бахайр!',             emoji: '🌄' },
                { w: 'Evening',   t: 'Шом',      ipa: '/ˈiːvnɪŋ/',  ex: 'Good evening!',             exTj: 'Шом бахайр!',              emoji: '🌆' },
              ]
            },
            {
              title: 'Сифатҳо (Adjectives)',
              emoji: '✨',
              words: [
                { w: 'Big',      t: 'Калон / Бузург', ipa: '/bɪɡ/',     ex: 'The house is big.',        exTj: 'Хона калон аст.',         emoji: '🏠' },
                { w: 'Small',    t: 'Хурд / Кичик',  ipa: '/smɔːl/',   ex: 'The ant is small.',        exTj: 'Мӯрча хурд аст.',         emoji: '🐜' },
                { w: 'Beautiful',t: 'Зебо / Гӯзал',  ipa: '/ˈbjuːtɪfl/', ex: 'She is beautiful.',     exTj: 'Ӯ зебост.',               emoji: '💫' },
                { w: 'Strong',   t: 'Қавӣ / Пурзӯр', ipa: '/strɒŋ/',   ex: 'He is very strong.',      exTj: 'Ӯ хеле қавист.',          emoji: '💪' },
                { w: 'Happy',    t: 'Хурсанд / Шод',  ipa: '/ˈhæpi/',   ex: 'I am happy today.',       exTj: 'Ман имрӯз хурсандам.',    emoji: '😊' },
              ]
            },
            {
              title: 'Ҳаракатҳо (Verbs)',
              emoji: '🏃',
              words: [
                { w: 'Run',    t: 'Давидан',   ipa: '/rʌn/',    ex: 'I run every morning.',    exTj: 'Ман ҳар субҳ медавам.',   emoji: '🏃' },
                { w: 'Eat',    t: 'Хӯрдан',    ipa: '/iːt/',    ex: 'We eat lunch together.',  exTj: 'Мо ҳамроҳ нӯшталӯнӣ мехӯрем.', emoji: '🍽️' },
                { w: 'Sleep',  t: 'Хобидан',   ipa: '/sliːp/',  ex: 'Babies sleep a lot.',     exTj: 'Кӯдакони хурд зиёд мехобанд.', emoji: '😴' },
                { w: 'Learn',  t: 'Омӯхтан',   ipa: '/lɜːrn/',  ex: 'I learn English daily.', exTj: 'Ман ҳар рӯз инглисӣ меомӯзам.', emoji: '📖' },
                { w: 'Work',   t: 'Кор кардан', ipa: '/wɜːrk/', ex: 'My father works hard.',   exTj: 'Падарам сахт кор мекунад.', emoji: '💼' },
              ]
            },
            {
              title: 'Либос (Clothes)',
              emoji: '👕',
              words: [
                { w: 'Shirt',   t: 'Куртаи мардона / Пироҳан', ipa: '/ʃɜːrt/',  ex: 'He wears a white shirt.',  exTj: 'Ӯ пираҳани сафед мепӯшад.', emoji: '👔' },
                { w: 'Dress',   t: 'Либос / Кӯйлак',           ipa: '/drɛs/',   ex: 'She wears a red dress.',   exTj: 'Ӯ либоси сурх мепӯшад.',    emoji: '👗' },
                { w: 'Shoes',   t: 'Пойафзол / Туфлӣ',         ipa: '/ʃuːz/',   ex: 'New shoes are comfortable.', exTj: 'Пойафзоли нав роҳат аст.',  emoji: '👟' },
                { w: 'Hat',     t: 'Кулоҳ',                    ipa: '/hæt/',    ex: 'Wear a hat in the sun.',    exTj: 'Дар офтоб кулоҳ пӯшед.',    emoji: '🎩' },
                { w: 'Jacket',  t: 'Куртка / Жакет',           ipa: '/ˈdʒækɪt/', ex: 'Put on your jacket.',    exTj: 'Куртаатро пӯшед.',           emoji: '🧥' },
              ]
            },
          ],
          B1: [
            {
              title: 'Муошират (Communication)',
              emoji: '💬',
              words: [
                { w: 'Agree',     t: 'Розӣ будан / Қабул кардан', ipa: '/əˈɡriː/',    ex: 'I agree with you.',          exTj: 'Ман бо шумо розиям.',       emoji: '✅' },
                { w: 'Disagree',  t: 'Норозӣ будан',               ipa: '/ˌdɪsəˈɡriː/', ex: 'I disagree with this idea.', exTj: 'Ман бо ин ақида розӣ нестам.', emoji: '❌' },
                { w: 'Opinion',   t: 'Ақида / Фикр',               ipa: '/əˈpɪnjən/', ex: 'In my opinion, it is right.',  exTj: 'Ба ақидаи ман, ин дуруст аст.', emoji: '💭' },
                { w: 'Explain',   t: 'Шарҳ додан / Фаҳмондан',     ipa: '/ɪkˈspleɪn/', ex: 'Can you explain this?',      exTj: 'Метавонед ин матлабро шарҳ диҳед?', emoji: '📢' },
                { w: 'Discuss',   t: 'Муҳокима кардан',             ipa: '/dɪˈskʌs/',   ex: 'Let us discuss the problem.', exTj: 'Биёед мушкилотро муҳокима кунем.', emoji: '🗣️' },
              ]
            },
            {
              title: 'Корҳои рӯзона (Daily Routine)',
              emoji: '🌅',
              words: [
                { w: 'Wake up',     t: 'Бедор шудан',    ipa: '/weɪk ʌp/',    ex: 'I wake up at 7 am.',         exTj: 'Ман соати 7 бедор мешавам.',   emoji: '⏰' },
                { w: 'Brush teeth', t: 'Дандон тоза кардан', ipa: '/brʌʃ tiːθ/', ex: 'Brush your teeth twice a day.', exTj: 'Ду маротиба дар рӯз дандон тоза кунед.', emoji: '🪥' },
                { w: 'Exercise',    t: 'Варзиш кардан',   ipa: '/ˈeksəsaɪz/', ex: 'I exercise every morning.',   exTj: 'Ман ҳар субҳ варзиш мекунам.',  emoji: '🏋️' },
                { w: 'Cook',        t: 'Пухтупаз кардан', ipa: '/kʊk/',        ex: 'I cook dinner at home.',      exTj: 'Ман дар хона шом тайёр мекунам.', emoji: '👩‍🍳' },
                { w: 'Rest',        t: 'Истироҳат кардан',ipa: '/rɛst/',       ex: 'I rest on weekends.',         exTj: 'Ман рӯзҳои истироҳат ором мегирам.', emoji: '🛋️' },
              ]
            },
            {
              title: 'Муҳит (Environment)',
              emoji: '🌍',
              words: [
                { w: 'Nature',    t: 'Табиат',          ipa: '/ˈneɪtʃər/',  ex: 'We must protect nature.',     exTj: 'Мо бояд табиатро ҳифз кунем.',   emoji: '🌿' },
                { w: 'Mountain',  t: 'Кӯҳ',             ipa: '/ˈmaʊntɪn/', ex: 'Tajikistan has many mountains.', exTj: 'Тоҷикистон кӯҳҳои зиёд дорад.',emoji: '🏔️' },
                { w: 'River',     t: 'Дарё',            ipa: '/ˈrɪvər/',   ex: 'The river is very long.',      exTj: 'Дарё хеле дароз аст.',           emoji: '🏞️' },
                { w: 'Forest',    t: 'Ҷангал / Бешазор',ipa: '/ˈfɒrɪst/', ex: 'The forest is dark at night.',  exTj: 'Ҷангал шаб торик аст.',          emoji: '🌲' },
                { w: 'Weather',   t: 'Ҳаво / Об ва ҳаво',ipa: '/ˈwɛðər/', ex: 'The weather is nice today.',   exTj: 'Имрӯз ҳаво хуб аст.',            emoji: '⛅' },
              ]
            },
            {
              title: 'Технология (Technology)',
              emoji: '💻',
              words: [
                { w: 'Computer',  t: 'Компютер',     ipa: '/kəmˈpjuːtər/', ex: 'I work on a computer.',     exTj: 'Ман дар компютер кор мекунам.', emoji: '💻' },
                { w: 'Internet',  t: 'Интернет',     ipa: '/ˈɪntərnɛt/', ex: 'The internet connects us.',   exTj: 'Интернет моро мепайвандад.',    emoji: '🌐' },
                { w: 'Phone',     t: 'Телефон',      ipa: '/foʊn/',       ex: 'Call me on the phone.',       exTj: 'Ба ман бо телефон занг зан.',   emoji: '📱' },
                { w: 'Message',   t: 'Паём / Хабар', ipa: '/ˈmɛsɪdʒ/',  ex: 'Send me a message.',          exTj: 'Ба ман паём бифирист.',         emoji: '💬' },
                { w: 'Download',  t: 'Зеркашӣ кардан', ipa: '/ˈdaʊnloʊd/', ex: 'Download the app.',        exTj: 'Барнома зеркашӣ кунед.',       emoji: '⬇️' },
              ]
            },
            {
              title: 'Иқтисод (Economy)',
              emoji: '💰',
              words: [
                { w: 'Money',    t: 'Пул',              ipa: '/ˈmʌni/',   ex: 'Money is not everything.',   exTj: 'Пул ҳама чиз нест.',           emoji: '💵' },
                { w: 'Work',     t: 'Кор / Меҳнат',     ipa: '/wɜːrk/',   ex: 'Hard work brings success.',  exTj: 'Меҳнати сахт муваффақият меорад.', emoji: '💼' },
                { w: 'Save',     t: 'Иқтисод кардан / Ҷамъ кардан', ipa: '/seɪv/', ex: 'Save money for the future.', exTj: 'Барои оянда пул ҷамъ кунед.', emoji: '🏦' },
                { w: 'Business', t: 'Тиҷорат / Бизнес', ipa: '/ˈbɪznɪs/', ex: 'She started a business.',   exTj: 'Ӯ тиҷорат оғоз кард.',         emoji: '🏢' },
                { w: 'Spend',    t: 'Харҷ кардан',       ipa: '/spɛnd/',   ex: 'Do not spend all your money.', exTj: 'Ҳамаи пулатонро харҷ накунед.', emoji: '💳' },
              ]
            },
            {
              title: 'Таълим (Education)',
              emoji: '🎓',
              words: [
                { w: 'Study',     t: 'Таҳсил кардан / Омӯхтан', ipa: '/ˈstʌdi/',    ex: 'Study hard to succeed.',   exTj: 'Барои муваффақӣ сахт бихонед.', emoji: '📚' },
                { w: 'Exam',      t: 'Имтиҳон',                  ipa: '/ɪɡˈzæm/',   ex: 'The exam is tomorrow.',     exTj: 'Имтиҳон фардост.',           emoji: '📝' },
                { w: 'Lesson',    t: 'Дарс / Машғулия',           ipa: '/ˈlɛsn/',    ex: 'English lesson starts now.', exTj: 'Дарси инглисӣ ҳозир оғоз мешавад.', emoji: '📖' },
                { w: 'Teacher',   t: 'Омӯзгор / Муаллим',         ipa: '/ˈtiːtʃər/', ex: 'The teacher is patient.',   exTj: 'Муаллим сабрнок аст.',        emoji: '👨‍🏫' },
                { w: 'Knowledge', t: 'Дониш / Илм',               ipa: '/ˈnɒlɪdʒ/',  ex: 'Knowledge is power.',       exTj: 'Дониш қудрат аст.',           emoji: '🧠' },
              ]
            },
          ],
          B2: [
            {
              title: 'Забон ва Нутқ (Language & Speech)',
              emoji: '🗣️',
              words: [
                { w: 'Fluent',     t: 'Равон / Беатлас',  ipa: '/ˈfluːənt/',  ex: 'She speaks fluent English.',   exTj: 'Ӯ ба инглисӣ равон гап мезанад.', emoji: '💬' },
                { w: 'Vocabulary', t: 'Луғат / Захираи калимот', ipa: '/vəˈkæbjʊleri/', ex: 'Build your vocabulary daily.', exTj: 'Ҳар рӯз луғататонро ғанӣ кунед.', emoji: '📖' },
                { w: 'Accent',     t: 'Лаҳҷа / Аксент',  ipa: '/ˈæksent/',   ex: 'He has a British accent.',     exTj: 'Ӯ лаҳҷаи бритониягӣ дорад.',    emoji: '🗣️' },
                { w: 'Grammar',    t: 'Грамматика / Нуқтаҳои забон', ipa: '/ˈɡræmər/', ex: 'Good grammar is important.', exTj: 'Грамматикаи дуруст муҳим аст.', emoji: '📝' },
                { w: 'Translate',  t: 'Тарҷума кардан',   ipa: '/trænsˈleɪt/', ex: 'Please translate this text.', exTj: 'Лутфан ин матнро тарҷума кунед.', emoji: '🔄' },
              ]
            },
            {
              title: 'Муносибатҳо (Relationships)',
              emoji: '🤝',
              words: [
                { w: 'Trust',      t: 'Эътимод / Боварӣ', ipa: '/trʌst/',     ex: 'Trust is the base of friendship.', exTj: 'Эътимод асоси дӯстӣ аст.',    emoji: '🤝' },
                { w: 'Respect',    t: 'Эҳтиром кардан',   ipa: '/rɪˈspɛkt/',  ex: 'Respect your elders.',         exTj: 'Калонсолонро эҳтиром кунед.',   emoji: '🙏' },
                { w: 'Support',    t: 'Дастгирӣ кардан',  ipa: '/səˈpɔːrt/',  ex: 'I support my friends.',        exTj: 'Ман дӯстонамро дастгирӣ мекунам.', emoji: '💪' },
                { w: 'Forgive',    t: 'Бахшидан / Афв кардан', ipa: '/fərˈɡɪv/', ex: 'Forgive and move on.',      exTj: 'Бубахшед ва пеш равед.',        emoji: '🕊️' },
                { w: 'Friendship', t: 'Дӯстӣ',            ipa: '/ˈfrɛndʃɪp/', ex: 'Friendship is precious.',     exTj: 'Дӯстӣ нодир аст.',              emoji: '👫' },
              ]
            },
            {
              title: 'Сиёсат ва Ҷамъият (Politics & Society)',
              emoji: '🏛️',
              words: [
                { w: 'Democracy',  t: 'Демократия',         ipa: '/dɪˈmɒkrəsi/', ex: 'Democracy gives people voice.', exTj: 'Демократия ба мардум овоз медиҳад.', emoji: '🗳️' },
                { w: 'Government', t: 'Ҳукумат / Давлат',   ipa: '/ˈɡʌvərnmənt/', ex: 'The government makes laws.', exTj: 'Ҳукумат қонун қабул мекунад.',   emoji: '🏛️' },
                { w: 'Law',        t: 'Қонун',               ipa: '/lɔː/',         ex: 'Follow the law.',            exTj: 'Қонунро риоя кунед.',            emoji: '⚖️' },
                { w: 'Rights',     t: 'Ҳуқуқ',              ipa: '/raɪts/',        ex: 'Everyone has equal rights.',  exTj: 'Ҳама ҳуқуқи баробар доранд.',   emoji: '✊' },
                { w: 'Freedom',    t: 'Озодӣ',              ipa: '/ˈfriːdəm/',    ex: 'Freedom is a human right.',   exTj: 'Озодӣ ҳуқуқи инсон аст.',       emoji: '🕊️' },
              ]
            },
            {
              title: 'Санъат ва Маданият (Art & Culture)',
              emoji: '🎨',
              words: [
                { w: 'Culture',   t: 'Маданият / Фарҳанг',  ipa: '/ˈkʌltʃər/',  ex: 'Every country has its culture.', exTj: 'Ҳар кишвар маданияти худ дорад.', emoji: '🌍' },
                { w: 'Music',     t: 'Мусиқӣ',               ipa: '/ˈmjuːzɪk/',  ex: 'Music touches the heart.',      exTj: 'Мусиқӣ ба дил таъсир мерасонад.', emoji: '🎵' },
                { w: 'Painting',  t: 'Наққошӣ / Расмкашӣ',  ipa: '/ˈpeɪntɪŋ/',  ex: 'Painting is a form of art.',    exTj: 'Расмкашӣ як навъи санъат аст.', emoji: '🎨' },
                { w: 'Literature',t: 'Адабиёт',               ipa: '/ˈlɪtərɪtʃər/', ex: 'Literature reflects society.', exTj: 'Адабиёт ҷомеаро инъикос мекунад.', emoji: '📚' },
                { w: 'Heritage',  t: 'Мерос / Ирс',          ipa: '/ˈhɛrɪtɪdʒ/', ex: 'Protect our cultural heritage.', exTj: 'Мероси фарҳангиамонро ҳифз кунем.', emoji: '🏛️' },
              ]
            },
            {
              title: 'Илм ва Тадқиқот (Science & Research)',
              emoji: '🔬',
              words: [
                { w: 'Research',   t: 'Тадқиқот / Пажӯҳиш', ipa: '/rɪˈsɜːrtʃ/', ex: 'Research takes a long time.',  exTj: 'Тадқиқот вақти зиёд мегирад.',   emoji: '🔬' },
                { w: 'Theory',     t: 'Назария',              ipa: '/ˈθɪəri/',    ex: 'A theory must be proven.',     exTj: 'Назария бояд исбот шавад.',       emoji: '💡' },
                { w: 'Evidence',   t: 'Далел / Шоҳид',        ipa: '/ˈɛvɪdəns/', ex: 'Show me the evidence.',        exTj: 'Ба ман далел нишон диҳед.',       emoji: '📊' },
                { w: 'Discovery',  t: 'Кашфиёт',              ipa: '/dɪˈskʌvəri/', ex: 'A great discovery was made.', exTj: 'Кашфиёти бузурге рӯй дод.',      emoji: '🔭' },
                { w: 'Experiment', t: 'Озмоиш / Эксперимент', ipa: '/ɪkˈspɛrɪmənt/', ex: 'The experiment was successful.', exTj: 'Озмоиш муваффақ гузашт.',   emoji: '⚗️' },
              ]
            },
            {
              title: 'Кор ва Пешаҳо (Work & Professions)',
              emoji: '👔',
              words: [
                { w: 'Career',     t: 'Касб / Мансаб',    ipa: '/kəˈrɪər/',   ex: 'Choose your career wisely.',  exTj: 'Касбатонро бодиқат интихоб кунед.', emoji: '🏆' },
                { w: 'Skill',      t: 'Малака / Маҳорат', ipa: '/skɪl/',      ex: 'Learn new skills every day.',  exTj: 'Ҳар рӯз малакаи нав омӯзед.',      emoji: '🎯' },
                { w: 'Promotion',  t: 'Пешрафт / Тарфея', ipa: '/prəˈmoʊʃn/', ex: 'She got a promotion.',        exTj: 'Ӯ тарфея гирифт.',                emoji: '⬆️' },
                { w: 'Colleague',  t: 'Ҳамкор',           ipa: '/ˈkɒliːɡ/',   ex: 'My colleagues are helpful.',  exTj: 'Ҳамкоронам ёрдамкоранд.',          emoji: '👥' },
                { w: 'Interview',  t: 'Мусоҳиба / Интервью', ipa: '/ˈɪntərvjuː/', ex: 'Prepare for your interview.', exTj: 'Барои мусоҳибаатон тайёрӣ бинед.', emoji: '🎤' },
              ]
            },
          ],
          C1: [
            {
              title: 'Фалсафа (Philosophy)',
              emoji: '🤔',
              words: [
                { w: 'Wisdom',      t: 'Хирад / Дониш',         ipa: '/ˈwɪzdəm/',   ex: 'Wisdom comes with experience.',  exTj: 'Хирад бо таҷриба меояд.',         emoji: '🦉' },
                { w: 'Ethics',      t: 'Ахлоқ / Усули маъно',   ipa: '/ˈɛθɪks/',    ex: 'Ethics guide our actions.',      exTj: 'Ахлоқ амалҳои моро роҳнамоӣ мекунад.', emoji: '⚖️' },
                { w: 'Consciousness', t: 'Огоҳӣ / Шуур',        ipa: '/ˈkɒnʃəsnɪs/', ex: 'Consciousness defines humanity.', exTj: 'Шуур инсониятро муайян мекунад.', emoji: '🧠' },
                { w: 'Existence',   t: 'Вуҷуд / Ҳастӣ',         ipa: '/ɪɡˈzɪstəns/', ex: 'What is the meaning of existence?', exTj: 'Маънои ҳастӣ чист?',            emoji: '🌌' },
                { w: 'Perspective', t: 'Нуқтаи назар / Дурнамо', ipa: '/pərˈspɛktɪv/', ex: 'See things from a new perspective.', exTj: 'Чизҳоро аз нуқтаи назари нав бинед.', emoji: '👁️' },
              ]
            },
            {
              title: 'Иқтисоди калон (Macro-economics)',
              emoji: '📈',
              words: [
                { w: 'Inflation',   t: 'Таваррум / Инфлятсия',  ipa: '/ɪnˈfleɪʃn/',  ex: 'Inflation reduces buying power.', exTj: 'Таваррум қудрати харидро коҳиш медиҳад.', emoji: '📈' },
                { w: 'Investment',  t: 'Сармоягузорӣ',            ipa: '/ɪnˈvɛstmənt/', ex: 'Invest in your education.',     exTj: 'Ба таҳсили худ сармоягузорӣ кунед.', emoji: '💹' },
                { w: 'Recession',   t: 'Таназзули иқтисодӣ',     ipa: '/rɪˈsɛʃn/',    ex: 'The recession lasted two years.', exTj: 'Таназзул ду сол давом кард.',      emoji: '📉' },
                { w: 'Sustainable', t: 'Устувор / Тӯлонӣ',        ipa: '/səˈsteɪnəbl/', ex: 'Sustainable development is key.', exTj: 'Рушди устувор асосӣ аст.',        emoji: '🌱' },
                { w: 'Globalization', t: 'Ҷаҳонишавӣ / Глобализатсия', ipa: '/ˌɡloʊbəlaɪˈzeɪʃn/', ex: 'Globalization connects countries.', exTj: 'Ҷаҳонишавӣ кишварҳоро мепайвандад.', emoji: '🌐' },
              ]
            },
            {
              title: 'Тандурустӣ ва Медицина (Health & Medicine)',
              emoji: '🏥',
              words: [
                { w: 'Diagnosis',   t: 'Ташхис',               ipa: '/ˌdaɪəɡˈnoʊsɪs/', ex: 'The diagnosis was confirmed.',  exTj: 'Ташхис тасдиқ карда шуд.',        emoji: '🩺' },
                { w: 'Treatment',   t: 'Табобат / Муолиҷа',    ipa: '/ˈtriːtmənt/',   ex: 'The treatment is effective.',    exTj: 'Табобат самаранок аст.',           emoji: '💊' },
                { w: 'Symptom',     t: 'Аломати беморӣ',        ipa: '/ˈsɪmptəm/',    ex: 'What are your symptoms?',        exTj: 'Аломатҳои бемории шумо чист?',    emoji: '🤒' },
                { w: 'Prevention',  t: 'Пешгирӣ / Профилактика',ipa: '/prɪˈvɛnʃn/',   ex: 'Prevention is better than cure.', exTj: 'Пешгирӣ аз табобат беҳтар аст.', emoji: '🛡️' },
                { w: 'Immune',      t: 'Масуниятӣ / Иммун',    ipa: '/ɪˈmjuːn/',     ex: 'The immune system protects us.', exTj: 'Системаи масуниятӣ моро ҳифз мекунад.', emoji: '🦠' },
              ]
            },
            {
              title: 'Ҳуқуқ (Law & Justice)',
              emoji: '⚖️',
              words: [
                { w: 'Justice',     t: 'Адолат',                 ipa: '/ˈdʒʌstɪs/',   ex: 'Justice must be served.',       exTj: 'Адолат бояд барқарор шавад.',     emoji: '⚖️' },
                { w: 'Constitution',t: 'Конститутсия',            ipa: '/ˌkɒnstɪˈtjuːʃn/', ex: 'The constitution protects rights.', exTj: 'Конститутсия ҳуқуқро ҳифз мекунад.', emoji: '📜' },
                { w: 'Defendant',   t: 'Айбдоршаванда',           ipa: '/dɪˈfɛndənt/', ex: 'The defendant was acquitted.',  exTj: 'Айбдоршаванда бегуноҳ эълон шуд.', emoji: '👨‍⚖️' },
                { w: 'Verdict',     t: 'Ҳукм / Қарор',           ipa: '/ˈvɜːrdɪkt/',  ex: 'The jury gave a verdict.',      exTj: 'Ҳайъати доварон ҳукм баровард.',  emoji: '🔨' },
                { w: 'Legislation', t: 'Қонунгузорӣ',            ipa: '/ˌlɛdʒɪsˈleɪʃn/', ex: 'New legislation was passed.', exTj: 'Қонунгузории нав қабул шуд.',     emoji: '🏛️' },
              ]
            },
            {
              title: 'Дипломатия (Diplomacy)',
              emoji: '🤝',
              words: [
                { w: 'Negotiation', t: 'Музокира / Гуфтушунид',  ipa: '/nɪˌɡoʊʃiˈeɪʃn/', ex: 'Negotiations are ongoing.',   exTj: 'Музокираҳо давом дорад.',         emoji: '🤝' },
                { w: 'Alliance',    t: 'Иттифоқ / Созиш',         ipa: '/əˈlaɪəns/',    ex: 'An alliance was formed.',      exTj: 'Иттифоқ ташкил шуд.',             emoji: '🌐' },
                { w: 'Sovereignty', t: 'Истиқлолият / Соҳибихтиёрӣ', ipa: '/ˈsɒvrənti/', ex: 'Every nation has sovereignty.', exTj: 'Ҳар миллат истиқлолият дорад.', emoji: '🏴' },
                { w: 'Ambassador',  t: 'Сафир',                   ipa: '/æmˈbæsədər/', ex: 'The ambassador signed the treaty.', exTj: 'Сафир шартномаро имзо кард.',   emoji: '👨‍💼' },
                { w: 'Treaty',      t: 'Шартнома / Паймон',       ipa: '/ˈtriːti/',     ex: 'A peace treaty was signed.',   exTj: 'Шартномаи сулҳ имзо шуд.',       emoji: '📄' },
              ]
            },
            {
              title: 'Адабиёт ва Нигориш (Literature & Writing)',
              emoji: '✍️',
              words: [
                { w: 'Narrative',   t: 'Ривоят / Нақл',          ipa: '/ˈnærətɪv/',    ex: 'The narrative is compelling.',  exTj: 'Ривоят ҷолиб аст.',              emoji: '📖' },
                { w: 'Metaphor',    t: 'Истиора / Маҷоз',        ipa: '/ˈmɛtəfɔːr/',  ex: 'A metaphor compares two things.', exTj: 'Истиора ду чизро муқоиса мекунад.', emoji: '🖊️' },
                { w: 'Eloquent',    t: 'Фасеҳ / Баландсухан',    ipa: '/ˈɛləkwənt/',  ex: 'She gave an eloquent speech.',  exTj: 'Ӯ нутқи фасеҳе кард.',           emoji: '🎤' },
                { w: 'Prose',       t: 'Наср',                   ipa: '/proʊz/',        ex: 'He writes beautiful prose.',    exTj: 'Ӯ насри зебо менависад.',         emoji: '📝' },
                { w: 'Critique',    t: 'Танқид / Интиқод',       ipa: '/krɪˈtiːk/',    ex: 'Literary critique is valuable.', exTj: 'Танқиди адабӣ арзишманд аст.',  emoji: '🔍' },
              ]
            },
          ],
        };

        for (let i = 0; i < levels.length; i++) {
          const level = levels[i];
          const units = vocabData[level] ?? [];

          const courseEmojis: Record<string, string> = { A1: '🌱', A2: '🌿', B1: '🌳', B2: '🌲', C1: '🏆' };
          const courseColors: Record<string, string> = { A1: '#10B981', A2: '#3B82F6', B1: '#8B5CF6', B2: '#F59E0B', C1: '#EF4444' };

          const course = await prisma.course.create({
            data: {
              languageId: langEn.id,
              level,
              title: `Забони Англисӣ — Сатҳи ${level}`,
              description: level === 'A1' ? 'Асоси забони инглисӣ барои навомӯзон' : `Дарсҳои сатҳи ${level}`,
              emoji: courseEmojis[level] ?? '📚',
              color: courseColors[level] ?? '#4F46E5',
              sortOrder: i,
              isActive: true,
            }
          });

          for (let u = 0; u < units.length; u++) {
            const unitData = units[u];
            const unit = await prisma.unit.create({
              data: {
                courseId: course.id,
                title: unitData.title,
                emoji: unitData.emoji,
                color: courseColors[level] ?? '#10B981',
                sortOrder: u + 1,
                isPremium: level !== 'A1',
              }
            });

            // 2 lessons per unit: Vocab lesson + Quiz lesson
            for (let l = 0; l < 2; l++) {
              const isQuiz = l === 1;
              const lesson = await prisma.lesson.create({
                data: {
                  unitId: unit.id,
                  title: isQuiz ? `Санҷиш: ${unitData.title}` : unitData.title,
                  titleTranslations: {
                    tg: isQuiz ? `Санҷиш: ${unitData.title}` : unitData.title,
                    ru: isQuiz ? `Тест: ${unitData.title}` : unitData.title,
                    en: isQuiz ? `Quiz: ${unitData.title}` : unitData.title,
                    uz: isQuiz ? `Test: ${unitData.title}` : unitData.title,
                  },
                  emoji: isQuiz ? '📝' : unitData.emoji,
                  xpReward: isQuiz ? 80 + (i * 10) : 60 + (i * 10),
                  estimatedMin: isQuiz ? 3 : 5,
                  sortOrder: l + 1,
                  isActive: true,
                }
              });
              lessonIdList.push(lesson.id);

              // Add real words only to vocab lessons
              if (!isQuiz) {
                for (let w = 0; w < unitData.words.length; w++) {
                  const wd = unitData.words[w];
                  const word = await prisma.word.create({
                    data: {
                      langFrom: 'en',
                      langTo: 'tg',
                      word: wd.w,
                      translation: wd.t,
                      ipa: wd.ipa,
                      emoji: wd.emoji,
                      example: wd.ex,
                      exampleTranslation: wd.exTj,
                      difficulty: i + 1,
                    }
                  });
                  await prisma.lessonWord.create({
                    data: {
                      lessonId: lesson.id,
                      wordId: word.id,
                      sortOrder: w + 1,
                    }
                  });
                }
              }
            }
          }
        }
        results.push(`✅ 5 курс (A1–C1), 30 юнит, 60 дарс ва 150 калимаи воқеии инглисӣ-тоҷикӣ ворид карда шуд`);
        
        // Add 20 UserProgress records
        const someUsers = await prisma.user.findMany({ take: 5 });
        if (someUsers.length > 0 && lessonIdList.length > 0) {
           let progressCount = 0;
           for (const user of someUsers) {
             for (let p = 0; p < 4; p++) {
               await prisma.userProgress.create({
                 data: {
                   userId: user.id,
                   lessonId: lessonIdList[p],
                   isCompleted: true,
                   accuracy: 95,
                   xpEarned: 50,
                   timeSpent: 120,
                   completedAt: new Date()
                 }
               });
               progressCount++;
             }
           }
           results.push(`✅ ${progressCount} сабти UserProgress илова шуд`);
        }
      }
    } else {
      results.push(`⚠️ Курсҳо аллакай мавҷуданд (${courseCount})`);
    }

    // 4. ── Achievements (15) ──────────────────────────────────────────
    const achCount = await prisma.achievement.count();
    if (achCount === 0) {
      const achievements = [
        { code: 'streak_3', name: 'Оғози хуб', rarity: 'common', type: 'streak', val: 3, xp: 50 },
        { code: 'streak_7', name: 'Як ҳафта', rarity: 'common', type: 'streak', val: 7, xp: 100 },
        { code: 'streak_30', name: 'Оташ', rarity: 'rare', type: 'streak', val: 30, xp: 500 },
        { code: 'streak_100', name: 'Афсонавӣ', rarity: 'epic', type: 'streak', val: 100, xp: 2000 },
        { code: 'streak_365', name: 'Худои Забон', rarity: 'legendary', type: 'streak', val: 365, xp: 5000 },
        
        { code: 'xp_1000', name: 'Донишҷӯ', rarity: 'common', type: 'xp', val: 1000, xp: 100 },
        { code: 'xp_5000', name: 'Олим', rarity: 'rare', type: 'xp', val: 5000, xp: 500 },
        { code: 'xp_10000', name: 'Донишманд', rarity: 'epic', type: 'xp', val: 10000, xp: 1000 },
        { code: 'xp_50000', name: 'Нобиға', rarity: 'legendary', type: 'xp', val: 50000, xp: 5000 },
        
        { code: 'lessons_10', name: 'Навомӯз', rarity: 'common', type: 'lessons', val: 10, xp: 50 },
        { code: 'lessons_50', name: 'Устувор', rarity: 'rare', type: 'lessons', val: 50, xp: 250 },
        { code: 'lessons_100', name: 'Устод', rarity: 'epic', type: 'lessons', val: 100, xp: 1000 },
        { code: 'lessons_500', name: 'Муаллим', rarity: 'legendary', type: 'lessons', val: 500, xp: 5000 },
        
        { code: 'words_100', name: 'Луғатдон', rarity: 'common', type: 'words', val: 100, xp: 100 },
        { code: 'premium', name: 'Premium Аъзо', rarity: 'epic', type: 'premium', val: 1, xp: 1000 },
      ];
      
      for (const a of achievements) {
        await prisma.achievement.create({
          data: {
            code: a.code,
            name: a.name,
            nameTranslations: { tg: a.name, ru: a.name, en: a.name, uz: a.name },
            description: `Reach ${a.val} ${a.type}`,
            descriptionTranslations: { tg: `Расидан ба ${a.val}`, ru: `Reach ${a.val}`, en: `Reach ${a.val}`, uz: `Reach ${a.val}` },
            emoji: '🏆',
            rarity: a.rarity,
            conditionType: a.type,
            conditionValue: a.val,
            xpReward: a.xp,
            gemsReward: Math.floor(a.xp / 10),
          }
        });
      }
      results.push('✅ 15 Дастовард (Achievements) ворид карда шуд');
    } else {
      results.push(`⚠️ Дастовардҳо аллакай мавҷуданд (${achCount})`);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('SEED ERROR:', error?.message);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
