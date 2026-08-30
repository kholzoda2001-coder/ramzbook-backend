/* eslint-disable no-console */
//
// Боби спикинг «Фармоиши хӯрок» — англисӣ барои тоҷикзабонон.
//
// Мазмун дар `content/speaking/ordering_food_en_tg.json` аст — ҲАМОН файлро
// роҳи админ ҳам мехонад (`/api/admin/speaking/seed?slug=ordering_food_en_tg`),
// то ду нусхаи ҷудошаванда пайдо нашавад.
//
// Тартиби Falou: КАЛИМАИ нав → ҶУМЛАҲОЕ, ки ҳамон калимаро кор мефармоянд →
// калимаи нави дигар. Дар барнома `kind: "word"` машқи «бигӯед» (матн намоён)
// мешавад, `kind: "sentence"` — «тарҷума кунед» бо слотҳо.
//
// ⚠️ Ба Course/Module/Lesson/UserProgress ТАМОМАН даст намезанад.
//
// Иҷро:  node scripts/seed_speaking_food_en_tg.cjs
//        node scripts/seed_speaking_food_en_tg.cjs --dry-run
//
// Идемпотент: дарсҳо аз рӯи `order` ёфта мешаванд ва id-ашон нигоҳ дошта
// мешавад (яъне `SpeakingProgress`-и корбарон намесӯзад), танҳо воҳидҳо аз
// нав навишта мешаванд.

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const CONTENT = path.join(__dirname, '..', 'content', 'speaking', 'ordering_food_en_tg.json');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}

function tuneDatabaseUrl() {
  if (!process.env.DATABASE_URL) return;
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('connection_limit', '1');
  url.searchParams.set('pool_timeout', '60');
  url.searchParams.set('connect_timeout', '60');
  process.env.DATABASE_URL = url.toString();
}

loadEnv();
tuneDatabaseUrl();

const prisma = new PrismaClient();
const DRY = process.argv.includes('--dry-run');
const pack = JSON.parse(fs.readFileSync(CONTENT, 'utf8'));

async function language(code) {
  const row = await prisma.language.findUnique({
    where: { code },
    select: { id: true, code: true },
  });
  if (!row) throw new Error(`Забони "${code}" дар ҷадвали Language нест.`);
  return row;
}

async function main() {
  const totalItems = pack.lessons.reduce((n, l) => n + l.items.length, 0);
  console.log(`📦 ${pack.category.emoji} ${pack.category.titleTranslated} — `
    + `${pack.lessons.length} дарс, ${totalItems} воҳид`);

  // `--dry-run` ҚАСДАН пеш аз ҳар дархости база — то мазмунро дар мошине,
  // ки ба Neon намерасад, ҳам дида тавонед.
  if (DRY) {
    for (const l of pack.lessons) {
      console.log(`\n— Дарси ${l.order + 1}: ${l.title} (${l.items.length})`);
      for (const it of l.items) {
        console.log(`   ${it.kind === 'word' ? '🔤' : '💬'} ${it.text}  —  ${it.translation}`);
      }
    }
    console.log('\n(--dry-run: ба база чизе навишта нашуд)');
    return;
  }

  const target = await language(pack.targetLanguage);
  const native = await language(pack.nativeLanguage);
  console.log(`🌍 ${target.code} → ${native.code}`);

  let category = await prisma.speakingCategory.findFirst({
    where: {
      targetLanguageId: target.id,
      nativeLanguageId: native.id,
      title: pack.category.title,
    },
  });

  if (category) {
    category = await prisma.speakingCategory.update({
      where: { id: category.id },
      data: pack.category,
    });
    console.log(`♻️  Боб нав карда шуд: ${category.titleTranslated}`);
  } else {
    category = await prisma.speakingCategory.create({
      data: { ...pack.category, targetLanguageId: target.id, nativeLanguageId: native.id },
    });
    console.log(`✅ Боби нав: ${category.titleTranslated}`);
  }

  for (const spec of pack.lessons) {
    let lesson = await prisma.speakingLesson.findFirst({
      where: { categoryId: category.id, order: spec.order },
    });

    if (lesson) {
      // id нигоҳ дошта мешавад → прогресси корбарон намесӯзад.
      lesson = await prisma.speakingLesson.update({
        where: { id: lesson.id },
        data: { title: spec.title, isActive: true },
      });
      await prisma.speakingItem.deleteMany({ where: { lessonId: lesson.id } });
    } else {
      lesson = await prisma.speakingLesson.create({
        data: {
          categoryId: category.id,
          title: spec.title,
          order: spec.order,
          isActive: true,
        },
      });
    }

    await prisma.speakingItem.createMany({
      data: spec.items.map((it) => ({ ...it, lessonId: lesson.id })),
    });

    const words = spec.items.filter((i) => i.kind === 'word').length;
    console.log(
      `   ✅ Дарси ${spec.order + 1} «${spec.title}» — `
      + `${words} калима + ${spec.items.length - words} ҷумла`,
    );
  }

  const check = await prisma.speakingCategory.findUnique({
    where: { id: category.id },
    select: { lessons: { select: { _count: { select: { items: true } } } } },
  });
  const stored = check.lessons.reduce((n, l) => n + l._count.items, 0);
  console.log(`\n🎉 Тайёр: ${check.lessons.length} дарс, ${stored} воҳид дар база.`);
}

main()
  .catch((e) => {
    console.error('❌', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
