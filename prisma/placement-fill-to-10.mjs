/**
 * Tops every tested placement level up to EXACTLY 10 active questions, with a
 * mix of skills (grammar / vocab / reading) instead of grammar-only blocks.
 *
 * Why 10: the pass threshold is now 0.85 (lib/placement.ts), so a level needs a
 * question count where "85%" is a sane bar — 9 of 10. With 7 or 8 questions the
 * effective bar drifted (6/7 = 86%, 7/8 = 88%) and differed per level.
 *
 * Idempotent: a question is inserted only when no active question with the same
 * prompt exists for that (target, native, level). Safe to re-run.
 *
 *   node prisma/placement-fill-to-10.mjs          # dry run
 *   node prisma/placement-fill-to-10.mjs --write  # actually insert
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EN = 'cmppaul1k0001xrdbc2woi3fj';
const RU = 'cmpqk40yz00009rhl1uazdfi3';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';

/** New questions, grouped by target language. */
const NEW_QUESTIONS = [
  // ── English → Tajik ──────────────────────────────────────────────────────
  {
    target: EN, level: 'A1', skill: 'vocab',
    prompt: 'What is the English word for «модар»?',
    promptTranslated: '«Модар» ба забони англисӣ чӣ мешавад?',
    options: ['mother', 'father', 'sister', 'brother'],
    answer: 'mother',
    explanation: '«Mother» = модар.',
  },
  {
    target: EN, level: 'A1', skill: 'reading',
    prompt: 'My name is Sara. I am ten years old.\nHow old is Sara?',
    promptTranslated: 'Сара чандсола аст?',
    options: ['10', '7', '9', '12'],
    answer: '10',
    explanation: '«Ten years old» = дасола.',
  },
  {
    target: EN, level: 'A1', skill: 'reading',
    prompt: 'This is my house. It is small and white.\nWhat is the house like?',
    promptTranslated: 'Хона чӣ гуна аст?',
    options: ['хурд ва сафед', 'калон ва сурх', 'нав ва кабуд', 'кӯҳна ва сиёҳ'],
    answer: 'хурд ва сафед',
    explanation: '«Small» = хурд, «white» = сафед.',
  },

  {
    target: EN, level: 'A2', skill: 'vocab',
    prompt: 'Choose the correct meaning of "expensive".',
    promptTranslated: '«Expensive» чӣ маъно дорад?',
    options: ['қиматбаҳо', 'арзон', 'зебо', 'душвор'],
    answer: 'қиматбаҳо',
    explanation: '«Expensive» = қиматбаҳо; муқобилаш «cheap» (арзон).',
  },
  {
    target: EN, level: 'A2', skill: 'reading',
    prompt: 'Ali works from Monday to Friday. On Saturday he visits his parents.\nWhat does Ali do on Saturday?',
    promptTranslated: 'Алӣ рӯзи шанбе чӣ мекунад?',
    options: ['ба назди волидайн меравад', 'кор мекунад', 'дар хона мехобад', 'ба мактаб меравад'],
    answer: 'ба назди волидайн меравад',
    explanation: '«Visits his parents» = ба назди волидайнаш меравад.',
  },

  {
    target: EN, level: 'B1', skill: 'vocab',
    prompt: 'Choose the word closest in meaning to "increase".',
    promptTranslated: 'Кадом калима ба «increase» наздик аст?',
    options: ['rise', 'drop', 'stay', 'lose'],
    answer: 'rise',
    explanation: '«Increase» ва «rise» ҳарду «зиёд шудан» мебошанд.',
  },
  {
    target: EN, level: 'B1', skill: 'vocab',
    prompt: 'What does the phrasal verb "give up" mean?',
    promptTranslated: '«Give up» чӣ маъно дорад?',
    options: ['бас кардан', 'сар кардан', 'ёфтан', 'фурӯхтан'],
    answer: 'бас кардан',
    explanation: '«Give up» = даст кашидан, бас кардан.',
  },
  {
    target: EN, level: 'B1', skill: 'reading',
    prompt: 'Although the weather was terrible, they decided to continue the journey.\nDid they continue?',
    promptTranslated: 'Оё онҳо сафарро идома доданд?',
    options: ['Ҳа, бо вуҷуди ҳавои бад', 'Не, бозгаштанд', 'Не, интизор шуданд', 'Матн инро намегӯяд'],
    answer: 'Ҳа, бо вуҷуди ҳавои бад',
    explanation: '«Although» = бо вуҷуди он ки; қарор — идома додан буд.',
  },

  {
    target: EN, level: 'B2', skill: 'grammar',
    prompt: 'Had I known about the delay, I ___ earlier.',
    promptTranslated: 'Шакли дурустро интихоб кунед.',
    options: ['would have left', 'will leave', 'had left', 'would leave'],
    answer: 'would have left',
    explanation: 'Шарти сеюм: Had I known…, I would have left.',
  },
  {
    target: EN, level: 'B2', skill: 'vocab',
    prompt: 'What does "put up with" mean?',
    promptTranslated: '«Put up with» чӣ маъно дорад?',
    options: ['таҳаммул кардан', 'бархостан', 'нигоҳ доштан', 'пешниҳод кардан'],
    answer: 'таҳаммул кардан',
    explanation: '«Put up with» = тоқат кардан, таҳаммул кардан.',
  },
  {
    target: EN, level: 'B2', skill: 'vocab',
    prompt: 'Choose the best synonym for "reluctant".',
    promptTranslated: 'Ҳаммаънои «reluctant»-ро интихоб кунед.',
    options: ['unwilling', 'eager', 'careless', 'confident'],
    answer: 'unwilling',
    explanation: '«Reluctant» = бемайл, нохоҳам — яъне «unwilling».',
  },
  {
    target: EN, level: 'B2', skill: 'reading',
    prompt: 'The proposal was turned down, despite widespread support among staff.\nWas the proposal accepted?',
    promptTranslated: 'Оё пешниҳод қабул шуд?',
    options: ['Не, рад карда шуд', 'Ҳа, қабул шуд', 'Ҳанӯз баррасӣ мешавад', 'Матн инро намегӯяд'],
    answer: 'Не, рад карда шуд',
    explanation: '«Turned down» = рад карда шуд.',
  },
  {
    target: EN, level: 'B2', skill: 'reading',
    prompt: 'Sales figures have levelled off after a sharp rise.\nWhat is happening to sales now?',
    promptTranslated: 'Ҳоло фурӯш дар чӣ ҳол аст?',
    options: ['Дар як сатҳ мондааст', 'Тез боло меравад', 'Тез поён меравад', 'Комилан қатъ шуд'],
    answer: 'Дар як сатҳ мондааст',
    explanation: '«Level off» = ба як сатҳ омада, устувор шудан.',
  },

  // ── Russian → Tajik ──────────────────────────────────────────────────────
  {
    target: RU, level: 'A2', skill: 'reading',
    prompt: 'Вчера мы были в кино. Фильм был очень интересный.\nГде они были вчера?',
    promptTranslated: 'Дирӯз онҳо дар куҷо буданд?',
    options: ['дар кинотеатр', 'дар мактаб', 'дар хона', 'дар бозор'],
    answer: 'дар кинотеатр',
    explanation: '«Были в кино» = дар кинотеатр буданд.',
  },
  {
    target: RU, level: 'B1', skill: 'vocab',
    prompt: '«Тавсия додан» ба русӣ чӣ мешавад?',
    promptTranslated: 'Тарҷумаи дурустро интихоб кунед.',
    options: ['советовать', 'спрашивать', 'отвечать', 'работать'],
    answer: 'советовать',
    explanation: '«Советовать» = тавсия додан, маслиҳат додан.',
  },
  {
    target: RU, level: 'B1', skill: 'reading',
    prompt: 'Если бы он знал об этом раньше, он бы позвонил.\nПозвонил ли он?',
    promptTranslated: 'Оё ӯ занг зад?',
    options: ['Не, занг назад', 'Ҳа, занг зад', 'Ҳанӯз занг мезанад', 'Матн инро намегӯяд'],
    answer: 'Не, занг назад',
    explanation: 'Шакли шартии «бы» — амал воқеан рӯй надод.',
  },
];

const write = process.argv.includes('--write');

async function main() {
  const targets = [...new Set(NEW_QUESTIONS.map((q) => q.target))];

  // Continue the existing order numbering per language.
  const nextOrder = new Map();
  for (const t of targets) {
    const max = await prisma.placementQuestion.aggregate({
      where: { targetLanguageId: t, nativeLanguageId: TG },
      _max: { order: true },
    });
    nextOrder.set(t, (max._max.order ?? 0) + 1);
  }

  let inserted = 0;
  let skipped = 0;

  for (const q of NEW_QUESTIONS) {
    const exists = await prisma.placementQuestion.findFirst({
      where: {
        targetLanguageId: q.target,
        nativeLanguageId: TG,
        cefrLevel: q.level,
        prompt: q.prompt,
      },
      select: { id: true },
    });
    if (exists) {
      skipped++;
      continue;
    }

    const order = nextOrder.get(q.target);
    nextOrder.set(q.target, order + 1);

    if (write) {
      await prisma.placementQuestion.create({
        data: {
          targetLanguageId: q.target,
          nativeLanguageId: TG,
          cefrLevel: q.level,
          skill: q.skill,
          prompt: q.prompt,
          promptTranslated: q.promptTranslated,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          order,
          isActive: true,
        },
      });
    }
    inserted++;
  }

  console.log(
    `${write ? 'Inserted' : 'Would insert'}: ${inserted} · already present: ${skipped}`,
  );

  // Report the resulting shape so a short level is obvious immediately.
  const rows = await prisma.placementQuestion.groupBy({
    by: ['targetLanguageId', 'cefrLevel', 'skill'],
    where: { isActive: true, nativeLanguageId: TG },
    _count: { _all: true },
  });
  const byLevel = new Map();
  for (const r of rows) {
    const key = `${r.targetLanguageId === EN ? 'en' : r.targetLanguageId === RU ? 'ru' : r.targetLanguageId} ${r.cefrLevel}`;
    const cur = byLevel.get(key) ?? { total: 0, skills: {} };
    cur.total += r._count._all;
    cur.skills[r.skill] = r._count._all;
    byLevel.set(key, cur);
  }
  for (const [key, v] of [...byLevel.entries()].sort()) {
    const mix = Object.entries(v.skills).map(([s, n]) => `${s}:${n}`).join(' ');
    console.log(`  ${key.padEnd(8)} ${String(v.total).padStart(2)} savol  (${mix})${v.total === 10 ? '' : '  ← != 10'}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
