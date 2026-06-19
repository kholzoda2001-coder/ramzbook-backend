const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const LANG_FIXES = {
  'tg': { name: 'Tajik', nativeName: 'Тоҷикӣ', flag: '🇹🇯' },
  'ru': { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  'en': { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  'tr': { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  'ar': { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  'de': { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  'zh': { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  'ja': { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
};

async function rescue() {
  console.log("1. Fixing Languages...");
  const langs = await prisma.language.findMany();
  const langMap = {};
  for (const l of langs) {
    langMap[l.code] = l.id;
    const fix = LANG_FIXES[l.code];
    if (fix) {
      await prisma.language.update({
        where: { id: l.id },
        data: { nativeName: fix.nativeName, flag: fix.flag }
      });
    }
  }

  console.log("2. Cleaning up all existing modules (to remove seed.mjs boilerplate)...");
  // We need to delete modules. Cascades should handle lessons, words, etc. if prisma schema allows.
  // If not, we do it manually.
  const allModules = await prisma.module.findMany();
  for (const m of allModules) {
    const lessons = await prisma.lesson.findMany({ where: { moduleId: m.id } });
    for (const l of lessons) {
      const words = await prisma.word.findMany({ where: { lessonId: l.id } });
      for (const w of words) {
        await prisma.srsCard.deleteMany({ where: { itemId: w.id } });
        await prisma.word.delete({ where: { id: w.id } });
      }
      await prisma.userProgress.deleteMany({ where: { lessonId: l.id } });
      await prisma.lesson.delete({ where: { id: l.id } });
    }
    await prisma.module.delete({ where: { id: m.id } });
  }

  console.log("3. Ensuring Courses Exist...");
  const coursesToEnsure = [
    { code: 'en', level: 'A1', title: 'Забони англисӣ — A1' },
    { code: 'en', level: 'A2', title: 'Забони англисӣ — A2' },
    { code: 'en', level: 'B1', title: 'Забони англисӣ — B1' },
    { code: 'ru', level: 'A1', title: 'Забони русӣ — A1' },
    { code: 'tr', level: 'A1', title: 'Забони туркӣ — A1' },
    { code: 'ar', level: 'A1', title: 'Забони арабӣ — A1' },
    { code: 'de', level: 'A1', title: 'Забони немисӣ — A1' },
    { code: 'zh', level: 'A1', title: 'Забони хитоӣ — A1' },
    { code: 'ja', level: 'A1', title: 'Забони ҷопонӣ — A1' },
  ];

  const courseIds = {};
  for (const c of coursesToEnsure) {
    const langId = langMap[c.code];
    let course = await prisma.course.findFirst({
      where: { targetLanguageId: langId, level: c.level }
    });
    if (!course) {
      course = await prisma.course.create({
        data: {
          targetLanguageId: langId,
          nativeLanguageId: langMap['tg'],
          level: c.level,
          title: c.title,
          description: '',
          isActive: true
        }
      });
    } else {
      await prisma.course.update({
        where: { id: course.id },
        data: { title: c.title }
      });
    }
    courseIds[`${c.code}_${c.level}`] = course.id;
  }

  console.log("4. Patching Seed Scripts...");
  const tmpDir = path.join(__dirname, 'tmp');

  const mappings = [
    { file: 'seed_english_a1_fill.js', courseId: courseIds['en_A1'] },
    { file: 'seed_english_a2_fill.js', courseId: courseIds['en_A2'] },
    { file: 'seed_english_b1_fill.js', courseId: courseIds['en_B1'] },
    { file: 'seed_russian_fill.js', courseId: courseIds['ru_A1'] },
    { file: 'seed_russian_alphabet.js', courseId: courseIds['ru_A1'] },
    { file: 'seed_turkish_api.js', courseId: courseIds['tr_A1'] },
    { file: 'seed_arabic_api.js', courseId: courseIds['ar_A1'] },
    { file: 'seed_german_api.js', courseId: courseIds['de_A1'] },
    { file: 'seed_chinese_api.js', courseId: courseIds['zh_A1'] },
    { file: 'seed_japanese_api.js', courseId: courseIds['ja_A1'] },
  ];

  for (const map of mappings) {
    const p = path.join(tmpDir, map.file);
    if (fs.existsSync(p)) {
      let code = fs.readFileSync(p, 'utf8');
      // Regex to replace const COURSE_ID = '...' or const COURSE = '...'
      code = code.replace(/(const\s+COURSE(?:_ID)?\s*=\s*)['"][a-zA-Z0-9]+['"]/g, `$1'${map.courseId}'`);
      fs.writeFileSync(p, code, 'utf8');
      console.log(`Patched ${map.file} with course ID ${map.courseId}`);
    }
  }

  console.log("Done! You can now run the seed scripts from tmp.");
}

rescue().catch(console.error).finally(() => prisma.$disconnect());
