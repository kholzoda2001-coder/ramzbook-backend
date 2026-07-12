import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Targeted fix: "Energy" appears in both A2 M3 (Habits) and A2 M11 (Environment).
// Rename the M11 occurrence(s) to "Fuel" so A2 vocab is 700 unique. Scoped to the
// M11 module only (leaves M3's "Energy" intact). Touches vocab + any writing mirror.

async function run() {
  const en = await prisma.language.findFirst({ where: { code: 'en' } });
  const tg = await prisma.language.findFirst({ where: { code: 'tg' } });
  const a2 = await prisma.course.findFirst({ where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'A2' } });
  const m11 = await prisma.module.findFirst({ where: { courseId: a2.id, order: 10 } }); // M11 = order 10
  if (!m11) throw new Error('M11 (order 10) not found');
  const rows = await prisma.word.findMany({ where: { lesson: { moduleId: m11.id }, word: 'Energy' } });
  for (const r of rows) {
    await prisma.word.update({ where: { id: r.id }, data: {
      word: 'Fuel', ipa: '/ˈfjuːəl/', ipaTajik: 'фюел', translation: 'Сӯзишворӣ', emoji: '⛽',
      example: 'Cars need less fuel now.', exampleTrans: 'Мошинҳо ҳоло сӯзишвории камтар лозим доранд.', audioUrl: null,
    }});
  }
  await prisma.appSetting.update({ where: { key: 'content_version' }, data: { valueJson: '"1"' } });
  console.log(`✅ M11: ${rows.length} \"Energy\" → \"Fuel\" (order 10). content_version bump.`);
}

let ok = false;
for (let i = 1; i <= 60 && !ok; i++) {
  try { await run(); ok = true; }
  catch (e) { if (i === 60) console.log('❌ ноком:', (e.message||'').split('\n')[0]); else await new Promise(r => setTimeout(r, 10000)); }
}
await prisma.$disconnect();
if (!ok) process.exit(1);
