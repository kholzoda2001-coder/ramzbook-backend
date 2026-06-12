import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const B2_DATA = {
  level: 'B2',
  title: 'Забони англисӣ — B2',
  emoji: '📙',
  color: '#FB923C',
  description: 'Мавзӯъҳои мураккаб ва касбӣ',
  modules: [
    {
      title: 'Business',
      titleTranslated: 'Тиҷорат',
      emoji: '📈',
      lessons: [
        {
          title: 'Business · Part 1',
          titleTranslated: 'Тиҷорат · Қисми 1',
          emoji: '📈',
          words: [
            { w: 'Company', t: 'Ширкат', e: '🏢', ipa: '/ˈkʌmpəni/', ex: 'A large company.', exT: 'Ширкати калон.' },
            { w: 'Profit', t: 'Фоида', e: '💰', ipa: '/ˈprɒfɪt/', ex: 'High profit.', exT: 'Фоидаи баланд.' },
            { w: 'Strategy', t: 'Стратегия', e: '🎯', ipa: '/ˈstrætɪdʒi/', ex: 'A clear strategy.', exT: 'Стратегияи равшан.' },
            { w: 'Investment', t: 'Сармоягузорӣ', e: '📊', ipa: '/ɪnˈvestmənt/', ex: 'Foreign investment.', exT: 'Сармоягузории хориҷӣ.' },
          ],
        },
        {
          title: 'Business · Part 2',
          titleTranslated: 'Тиҷорат · Қисми 2',
          emoji: '📈',
          words: [
            { w: 'Market', t: 'Бозор', e: '🛒', ipa: '/ˈmɑːrkɪt/', ex: 'The world market.', exT: 'Бозори ҷаҳонӣ.' },
            { w: 'Contract', t: 'Шартнома', e: '📜', ipa: '/ˈkɒntrækt/', ex: 'Sign the contract.', exT: 'Шартномаро имзо кунед.' },
            { w: 'Competition', t: 'Рақобат', e: '🏆', ipa: '/ˌkɒmpɪˈtɪʃən/', ex: 'Strong competition.', exT: 'Рақобати шадид.' },
            { w: 'Negotiate', t: 'Музокира кардан', e: '🤝', ipa: '/nɪˈɡoʊʃieɪt/', ex: 'We must negotiate.', exT: 'Мо бояд музокира кунем.' },
          ],
        },
      ],
    },
    {
      title: 'Science',
      titleTranslated: 'Илм',
      emoji: '🔬',
      lessons: [
        {
          title: 'Science · Part 1',
          titleTranslated: 'Илм · Қисми 1',
          emoji: '🔬',
          words: [
            { w: 'Experiment', t: 'Озмоиш', e: '⚗️', ipa: '/ɪkˈsperɪmənt/', ex: 'A scientific experiment.', exT: 'Озмоиши илмӣ.' },
            { w: 'Evidence', t: 'Далел', e: '🔍', ipa: '/ˈevɪdəns/', ex: 'Strong evidence.', exT: 'Далели қавӣ.' },
            { w: 'Research', t: 'Тадқиқот', e: '📋', ipa: '/rɪˈsɜːrtʃ/', ex: 'Scientific research.', exT: 'Тадқиқоти илмӣ.' },
            { w: 'Hypothesis', t: 'Фарзия', e: '💡', ipa: '/haɪˈpɒθɪsɪs/', ex: 'Test the hypothesis.', exT: 'Фарзияро санҷед.' },
          ],
        },
        {
          title: 'Science · Part 2',
          titleTranslated: 'Илм · Қисми 2',
          emoji: '🔬',
          words: [
            { w: 'Theory', t: 'Назария', e: '📐', ipa: '/ˈθɪəri/', ex: 'A new theory.', exT: 'Назарияи нав.' },
            { w: 'Discovery', t: 'Кашф', e: '🌟', ipa: '/dɪˈskʌvəri/', ex: 'A major discovery.', exT: 'Кашфи бузург.' },
            { w: 'Analysis', t: 'Таҳлил', e: '📊', ipa: '/əˈnælɪsɪs/', ex: 'Careful analysis.', exT: 'Таҳлили дақиқ.' },
            { w: 'Innovation', t: 'Навоварӣ', e: '🚀', ipa: '/ˌɪnəˈveɪʃən/', ex: 'Technical innovation.', exT: 'Навоварии техникӣ.' },
          ],
        },
      ],
    },
    {
      title: 'Culture',
      titleTranslated: 'Фарҳанг',
      emoji: '🎭',
      lessons: [
        {
          title: 'Culture · Part 1',
          titleTranslated: 'Фарҳанг · Қисми 1',
          emoji: '🎭',
          words: [
            { w: 'Heritage', t: 'Мерос', e: '🏛️', ipa: '/ˈherɪtɪdʒ/', ex: 'Cultural heritage.', exT: 'Мероси фарҳангӣ.' },
            { w: 'Tradition', t: 'Анъана', e: '🎎', ipa: '/trəˈdɪʃən/', ex: 'An ancient tradition.', exT: 'Анъанаи қадима.' },
            { w: 'Exhibition', t: 'Намоишгоҳ', e: '🖼️', ipa: '/ˌeksɪˈbɪʃən/', ex: 'An art exhibition.', exT: 'Намоишгоҳи санъат.' },
            { w: 'Contemporary', t: 'Муосир', e: '✨', ipa: '/kənˈtempərəri/', ex: 'Contemporary art.', exT: 'Санъати муосир.' },
          ],
        },
        {
          title: 'Culture · Part 2',
          titleTranslated: 'Фарҳанг · Қисми 2',
          emoji: '🎭',
          words: [
            { w: 'Ceremony', t: 'Маросим', e: '🎊', ipa: '/ˈserɪməni/', ex: 'A wedding ceremony.', exT: 'Маросими арӯсӣ.' },
            { w: 'Influence', t: 'Таъсир', e: '💫', ipa: '/ˈɪnfluəns/', ex: 'Cultural influence.', exT: 'Таъсири фарҳангӣ.' },
            { w: 'Diversity', t: 'Гуногунӣ', e: '🌈', ipa: '/daɪˈvɜːrsɪti/', ex: 'Cultural diversity.', exT: 'Гуногунии фарҳангӣ.' },
            { w: 'Preserve', t: 'Ҳифз кардан', e: '🛡️', ipa: '/prɪˈzɜːrv/', ex: 'Preserve our culture.', exT: 'Фарҳанги моро ҳифз кунед.' },
          ],
        },
      ],
    },
    {
      title: 'Media',
      titleTranslated: 'Расона',
      emoji: '📺',
      lessons: [
        {
          title: 'Media · Part 1',
          titleTranslated: 'Расона · Қисми 1',
          emoji: '📺',
          words: [
            { w: 'Broadcast', t: 'Пахш кардан', e: '📡', ipa: '/ˈbrɔːdkæst/', ex: 'A live broadcast.', exT: 'Пахши бевосита.' },
            { w: 'Journalist', t: 'Рӯзноманигор', e: '🎙️', ipa: '/ˈdʒɜːrnəlɪst/', ex: 'A senior journalist.', exT: 'Рӯзноманигори аршад.' },
            { w: 'Headline', t: 'Унвони хабар', e: '📰', ipa: '/ˈhedlaɪn/', ex: 'A shocking headline.', exT: 'Унвони хабари ҳайратовар.' },
            { w: 'Editorial', t: 'Мақолаи сарвар', e: '✏️', ipa: '/ˌedɪˈtɔːriəl/', ex: 'A daily editorial.', exT: 'Мақолаи сарвари рӯзона.' },
          ],
        },
        {
          title: 'Media · Part 2',
          titleTranslated: 'Расона · Қисми 2',
          emoji: '📺',
          words: [
            { w: 'Publish', t: 'Нашр кардан', e: '📚', ipa: '/ˈpʌblɪʃ/', ex: 'Publish an article.', exT: 'Як мақола нашр кунед.' },
            { w: 'Censorship', t: 'Сензура', e: '🚫', ipa: '/ˈsensərʃɪp/', ex: 'Media censorship.', exT: 'Сензураи расона.' },
            { w: 'Audience', t: 'Тамошобин', e: '👥', ipa: '/ˈɔːdiəns/', ex: 'A large audience.', exT: 'Тамошобини калон.' },
            { w: 'Report', t: 'Гузориш', e: '📄', ipa: '/rɪˈpɔːrt/', ex: 'An official report.', exT: 'Гузоришии расмӣ.' },
          ],
        },
      ],
    },
    {
      title: 'Law & Politics',
      titleTranslated: 'Ҳуқуқ ва Сиёсат',
      emoji: '⚖️',
      lessons: [
        {
          title: 'Law & Politics · Part 1',
          titleTranslated: 'Ҳуқуқ ва Сиёсат · Қисми 1',
          emoji: '⚖️',
          words: [
            { w: 'Democracy', t: 'Демократия', e: '🗳️', ipa: '/dɪˈmɒkrəsi/', ex: 'True democracy.', exT: 'Демократияи воқеӣ.' },
            { w: 'Election', t: 'Интихобот', e: '🗽', ipa: '/ɪˈlekʃən/', ex: 'Free elections.', exT: 'Интихоботи озод.' },
            { w: 'Policy', t: 'Сиёсат', e: '📋', ipa: '/ˈpɒlɪsi/', ex: 'Foreign policy.', exT: 'Сиёсати хориҷӣ.' },
            { w: 'Parliament', t: 'Парлумон', e: '🏛️', ipa: '/ˈpɑːrləmənt/', ex: 'The national parliament.', exT: 'Парлумони миллӣ.' },
          ],
        },
        {
          title: 'Law & Politics · Part 2',
          titleTranslated: 'Ҳуқуқ ва Сиёсат · Қисми 2',
          emoji: '⚖️',
          words: [
            { w: 'Justice', t: 'Адолат', e: '⚖️', ipa: '/ˈdʒʌstɪs/', ex: 'Social justice.', exT: 'Адолати иҷтимоӣ.' },
            { w: 'Equality', t: 'Баробарӣ', e: '🤝', ipa: '/ɪˈkwɒlɪti/', ex: 'Gender equality.', exT: 'Баробарии гендерӣ.' },
            { w: 'Rights', t: 'Ҳуқуқ', e: '✊', ipa: '/raɪts/', ex: 'Human rights.', exT: 'Ҳуқуқи инсон.' },
            { w: 'Protest', t: 'Эътироз', e: '📢', ipa: '/ˈproʊtest/', ex: 'A peaceful protest.', exT: 'Эътирози осоишта.' },
          ],
        },
      ],
    },
    {
      title: 'Environment',
      titleTranslated: 'Муҳити Зист',
      emoji: '🌍',
      lessons: [
        {
          title: 'Environment · Part 1',
          titleTranslated: 'Муҳити Зист · Қисми 1',
          emoji: '🌍',
          words: [
            { w: 'Climate', t: 'Иқлим', e: '🌡️', ipa: '/ˈklaɪmɪt/', ex: 'The global climate.', exT: 'Иқлими ҷаҳонӣ.' },
            { w: 'Pollution', t: 'Олудагӣ', e: '💨', ipa: '/pəˈluːʃən/', ex: 'Air pollution.', exT: 'Олудагии ҳаво.' },
            { w: 'Renewable', t: 'Барқароршаванда', e: '♻️', ipa: '/rɪˈnjuːəbəl/', ex: 'Renewable energy.', exT: 'Энергияи барқароршаванда.' },
            { w: 'Ecosystem', t: 'Экосистема', e: '🌿', ipa: '/ˈiːkoʊˌsɪstəm/', ex: 'A fragile ecosystem.', exT: 'Экосистемаи нозук.' },
          ],
        },
        {
          title: 'Environment · Part 2',
          titleTranslated: 'Муҳити Зист · Қисми 2',
          emoji: '🌍',
          words: [
            { w: 'Sustainable', t: 'Устувор', e: '🌱', ipa: '/səˈsteɪnəbəl/', ex: 'Sustainable living.', exT: 'Зиндагии устувор.' },
            { w: 'Emission', t: 'Партов', e: '🏭', ipa: '/ɪˈmɪʃən/', ex: 'Carbon emissions.', exT: 'Партовҳои карбон.' },
            { w: 'Conservation', t: 'Ҳифозат', e: '🦁', ipa: '/ˌkɒnsəˈveɪʃən/', ex: 'Wildlife conservation.', exT: 'Ҳифозати ҳайвонот.' },
            { w: 'Habitat', t: 'Зистгоҳ', e: '🌲', ipa: '/ˈhæbɪtæt/', ex: 'Natural habitat.', exT: 'Зистгоҳи табиӣ.' },
          ],
        },
      ],
    },
  ],
};

/**
 * POST /api/admin/seed-b2
 * Adds ONLY the B2 course (English → Tajik) without touching A1/A2/B1/C1.
 * Safe to run even if other levels already exist.
 * If B2 already exists, it is replaced (modules/lessons/words wiped and re-created).
 */
export async function POST() {
  try {
    const [enLang, tgLang] = await Promise.all([
      prisma.language.findUnique({ where: { code: 'en' } }),
      prisma.language.findUnique({ where: { code: 'tg' } }),
    ]);

    if (!enLang || !tgLang) {
      return NextResponse.json(
        { error: 'Languages en and tg must exist. Run the main seed first to register languages.' },
        { status: 400 }
      );
    }

    // Delete existing B2 if present (cascade deletes modules → lessons → words)
    await prisma.course.deleteMany({
      where: { targetLanguageId: enLang.id, nativeLanguageId: tgLang.id, level: 'B2' },
    });

    // Determine order (after B1 = index 2, so B2 = index 3)
    const course = await prisma.course.create({
      data: {
        targetLanguageId: enLang.id,
        nativeLanguageId: tgLang.id,
        level: B2_DATA.level,
        title: B2_DATA.title,
        description: B2_DATA.description,
        emoji: B2_DATA.emoji,
        color: B2_DATA.color,
        order: 3,
        isActive: true,
      },
    });

    let modules = 0, lessons = 0, words = 0;

    for (let mi = 0; mi < B2_DATA.modules.length; mi++) {
      const m = B2_DATA.modules[mi];
      const module = await prisma.module.create({
        data: {
          courseId: course.id,
          title: m.title,
          titleTranslated: m.titleTranslated,
          emoji: m.emoji,
          color: '#FB923C',
          order: mi,
          isPremium: true,
          isActive: true,
        },
      });
      modules++;

      for (let li = 0; li < m.lessons.length; li++) {
        const l = m.lessons[li];
        const lesson = await prisma.lesson.create({
          data: {
            moduleId: module.id,
            title: l.title,
            titleTranslated: l.titleTranslated,
            type: 'vocab',
            emoji: l.emoji,
            xpReward: 60,
            duration: 5,
            order: li,
            isPremium: true,
            isActive: true,
          },
        });
        lessons++;

        await prisma.word.createMany({
          data: l.words.map((w, wi) => ({
            lessonId: lesson.id,
            word: w.w,
            translation: w.t,
            emoji: w.e ?? null,
            ipa: w.ipa ?? null,
            example: w.ex ?? null,
            exampleTrans: w.exT ?? null,
            difficulty: 2,
            order: wi,
          })),
        });
        words += l.words.length;
      }
    }

    return NextResponse.json({
      success: true,
      level: 'B2',
      course: course.id,
      modules,
      lessons,
      words,
    });
  } catch (err: any) {
    console.error('[admin/seed-b2]', err);
    return NextResponse.json({ error: err?.message ?? 'Seed B2 failed' }, { status: 500 });
  }
}
