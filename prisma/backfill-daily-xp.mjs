// ─────────────────────────────────────────────────────────────────────────────
// One-time backfill: rebuild DailyXp rows from historical UserProgress.
// Run once after deploying the DailyXp model:
//   node prisma/backfill-daily-xp.mjs
// Idempotent: it deletes existing 'lesson'-sourced rows it would recreate.
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function dateOnly(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function dateString(d) {
  return dateOnly(d).toISOString().split('T')[0];
}

async function main() {
  const progress = await prisma.userProgress.findMany({
    where: { isCompleted: true, completedAt: { not: null }, xpEarned: { gt: 0 } },
    select: { userId: true, xpEarned: true, completedAt: true },
  });

  // Aggregate xp by (userId, date)
  const buckets = new Map(); // key `${userId}|${dateStr}` -> xp
  for (const p of progress) {
    const ds = dateString(p.completedAt);
    const key = `${p.userId}|${ds}`;
    buckets.set(key, (buckets.get(key) ?? 0) + p.xpEarned);
  }

  let upserts = 0;
  for (const [key, xp] of buckets.entries()) {
    const [userId, ds] = key.split('|');
    const date = new Date(`${ds}T00:00:00.000Z`);
    await prisma.dailyXp.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, xp, source: { lesson: xp } },
      update: { xp, source: { lesson: xp } },
    });
    upserts++;
  }

  console.log(JSON.stringify({ progressRows: progress.length, dailyXpUpserts: upserts }));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
