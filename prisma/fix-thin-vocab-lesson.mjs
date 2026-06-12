// ─────────────────────────────────────────────────────────────────────────────
// Cleanup: merge any A1 vocab lesson that has 1–2 words into the previous vocab
// lesson of the same module, then remove the now-empty shell lesson.
// No content is lost — the words are moved, not deleted. DRY_RUN=1 = preview.
//
// Run:  cd backend
//       DRY_RUN=1 node prisma/fix-thin-vocab-lesson.mjs
//       node prisma/fix-thin-vocab-lesson.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.env.DRY_RUN === '1';

function loadDotEnv() {
  for (const p of [join(__dirname, '..', '.env'), join(process.cwd(), '.env')]) {
    try {
      for (const raw of readFileSync(p, 'utf8').split(/\r?\n/)) {
        const line = raw.trim(); if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('='); if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let val = line.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
        if (!(key in process.env)) process.env[key] = val;
      } break;
    } catch { /* next */ }
  }
}
loadDotEnv();
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('connection_limit')) {
  process.env.DATABASE_URL += (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'connection_limit=2&pool_timeout=30';
}
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({ where: { level: 'A1', targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' } }, select: { id: true } });
  const mods = await prisma.module.findMany({
    where: { courseId: course.id }, orderBy: { order: 'asc' },
    select: { id: true, title: true, lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, order: true, skillType: true, _count: { select: { words: true } } } } },
  });

  const plans = [];
  for (const m of mods) {
    for (const l of m.lessons) {
      if (l.skillType === 'vocab' && l._count.words > 0 && l._count.words < 3) {
        const prev = m.lessons.filter((x) => x.order < l.order && x.skillType === 'vocab' && x._count.words > 0).sort((a, b) => b.order - a.order)[0];
        if (!prev) { console.warn(`No previous vocab lesson for "${l.title}" — skipping`); continue; }
        plans.push({ module: m.title, thin: l, prev });
      }
    }
  }

  if (plans.length === 0) { console.log('No thin vocab lessons found. Nothing to do.'); return; }

  for (const pl of plans) {
    const words = await prisma.word.findMany({ where: { lessonId: pl.thin.id }, orderBy: { order: 'asc' }, select: { id: true, word: true } });
    const prevMax = await prisma.word.aggregate({ where: { lessonId: pl.prev.id }, _max: { order: true } });
    const startOrder = (prevMax._max.order ?? -1) + 1;
    console.log(`MERGE [${pl.module}] "${pl.thin.title}" (${words.map(w=>w.word).join(', ')}) → "${pl.prev.title}"`);
    if (DRY_RUN) continue;
    for (let i = 0; i < words.length; i++) {
      await prisma.word.update({ where: { id: words[i].id }, data: { lessonId: pl.prev.id, order: startOrder + i } });
    }
    await prisma.lesson.delete({ where: { id: pl.thin.id } });
    console.log(`   ✓ moved ${words.length} word(s), removed empty lesson`);
  }

  if (DRY_RUN) { console.log('\nDRY_RUN=1 → nothing written.'); return; }

  const lessonsNow = await prisma.lesson.count({ where: { module: { courseId: course.id } } });
  const wordsNow = await prisma.word.count({ where: { lesson: { module: { courseId: course.id } } } });
  console.log(`\nDONE. A1 lessons now: ${lessonsNow} | words: ${wordsNow}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e?.message ?? e); await prisma.$disconnect(); process.exit(1); });
