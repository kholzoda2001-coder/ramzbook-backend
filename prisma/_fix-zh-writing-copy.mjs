// Ислоҳи БАНДКУНАНДА: zh A1 М1·Д9 «Машқи навиштан» — ҳар шаш калима тарҷумаи
// «COPY» (матни плейсхолдер) дошт.
//
// Чаро ин хонандаро БАНД мекунад, на танҳо «зишт аст»:
//   · бозии мувофиқат (Final Boss) шаш плиткаи «COPY» мегирад — ҷавоби дуруст
//     умуман вуҷуд надорад ва дарс тамом намешавад;
//   · ҳар машқи шинохт («COPY»-ро интихоб кун) маъно надорад.
// `_stuck-detector.mjs` онро ҳамчун ягона қулфи ВОҚЕИИ мазмун ёфт.
//
// Тарҷумаҳо аз ҳамон МОДУЛ гирифта шудаанд (Д1–Д3), то дар курс як калима ду
// тарҷумаи гуногун надошта бошад.
//
//   node prisma/_fix-zh-writing-copy.mjs --dry
//   node prisma/_fix-zh-writing-copy.mjs
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();
const DRY = process.argv.includes('--dry');

/** калима → тарҷумаи КАНОНИКӢ (айнан мисли дарсҳои 1–3-и ҳамин модул). */
const FIX = {
  '你好': 'Салом',
  '我': 'Ман',
  '叫': 'Ном доштан',
  '名字': 'Ном',
  '谢谢': 'Раҳмат (Ташаккур)',
  '再见': 'Хайр (То дидор)',
};

const lesson = await p.lesson.findFirst({
  where: {
    isActive: true,
    skillType: 'writing',
    module: { order: 0, course: { targetLanguage: { code: 'zh' }, level: 'A1' } },
  },
  select: {
    id: true, moduleId: true, titleTranslated: true,
    words: { orderBy: { order: 'asc' }, select: { id: true, word: true, translation: true } },
  },
});

if (!lesson) {
  console.error('⛔ дарс ёфт нашуд');
  process.exit(1);
}
console.log(`дарс: «${lesson.titleTranslated}» · ${lesson.words.length} калима`);

let changed = 0;
for (const w of lesson.words) {
  const want = FIX[w.word];
  if (!want) {
    console.log(`  ⚠ ${w.word}: дар рӯйхат нест, даст нарасид («${w.translation}»)`);
    continue;
  }
  if (w.translation === want) { console.log(`  = ${w.word}: аллакай дуруст`); continue; }
  console.log(`  ✎ ${w.word}: «${w.translation}» → «${want}»`);
  if (!DRY) await p.word.update({ where: { id: w.id }, data: { translation: want } });
  changed++;
}

if (!DRY && changed > 0) {
  // Бе ин ду қадам телефони хонанда нусхаи КӮҲНАРО нигоҳ медорад: бахш барои
  // офлайн зеркашӣ шудааст ва танҳо `contentVersion` онро кӯҳна эълон мекунад.
  await p.module.update({
    where: { id: lesson.moduleId },
    data: { contentVersion: { increment: 1 } },
  });
  await p.appSetting.upsert({
    where: { key: 'content_version' },
    create: { key: 'content_version', valueJson: '"1"' },
    update: { valueJson: String(Date.now()) },
  });
  console.log('версияи бахш ва версияи глобалии мазмун боло бардошта шуд');
}

console.log(DRY ? `\n[dry] ${changed} сатр иваз мешуд` : `\n✅ ${changed} сатр иваз шуд`);
await p.$disconnect();
