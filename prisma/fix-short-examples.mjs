import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Polishes 10 A1 words whose example sentences are shorter than 3 words —
// too short for cloze/build production drills (engine falls back to bare
// typing) and weak pedagogy. Gives each a natural short sentence + Tajik.

const FIX = {
  'Yes':          { example: 'Yes, I am ready.',            exampleTrans: 'Ҳа, ман тайёрам.' },
  'Goodbye':      { example: 'Goodbye, see you tomorrow!',  exampleTrans: 'Хайр, то фардо!' },
  'Good morning': { example: 'Good morning, teacher!',      exampleTrans: 'Субҳ ба хайр, муаллим!' },
  'Morning':      { example: 'The morning is fresh.',       exampleTrans: 'Субҳ тароватнок аст.' },
  'Afternoon':    { example: 'Good afternoon, my friend.',  exampleTrans: 'Рӯз ба хайр, дӯстам.' },
  'Evening':      { example: 'The evening is quiet.',       exampleTrans: 'Шом ором аст.' },
  'Night':        { example: 'The night is dark.',          exampleTrans: 'Шаб торик аст.' },
  'Left':         { example: 'Turn left here.',             exampleTrans: 'Ин ҷо ба чап гард.' },
  'Right':        { example: 'Turn right at the shop.',     exampleTrans: 'Дар назди мағоза ба рост гард.' },
  'Straight':     { example: 'Go straight ahead.',          exampleTrans: 'Рост ба пеш рав.' },
};

async function run() {
  const en = await prisma.language.findFirst({ where: { code: 'en' } });
  const tg = await prisma.language.findFirst({ where: { code: 'tg' } });
  const a1 = await prisma.course.findFirst({ where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'A1' } });
  if (!a1) throw new Error('A1 missing');
  let n = 0;
  for (const [word, data] of Object.entries(FIX)) {
    const rows = await prisma.word.findMany({ where: { word, lesson: { module: { courseId: a1.id } } } });
    for (const r of rows) {
      const short = !(r.example || '').trim() || r.example.trim().split(/\s+/).length < 3;
      if (!short) continue; // only touch genuinely short ones
      await prisma.word.update({ where: { id: r.id }, data: { example: data.example, exampleTrans: data.exampleTrans, audioUrl: r.audioUrl } });
      n++;
    }
  }
  await prisma.appSetting.update({ where: { key: 'content_version' }, data: { valueJson: '"1"' } });
  console.log(`✅ ${n} мисоли кӯтоҳи A1 нав шуд. content_version bump.`);
}

let ok = false;
for (let i = 1; i <= 60 && !ok; i++) {
  try { await run(); ok = true; }
  catch (e) { if (i === 60) console.log('❌ ноком:', (e.message||'').split('\n')[0]); else await new Promise(r => setTimeout(r, 10000)); }
}
await prisma.$disconnect();
if (!ok) process.exit(1);
