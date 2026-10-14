// Санҷиши ФАҚАТ-ХОНИШ: барои ҳар забон × ҳадаф роҳи «Гуфтор» чӣ мешавад.
// Ҳамон мантиқи `lib/speaking/situations.ts` (inPath/orderChapters) — нусха.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GOALS = ['general', 'build', 'service', 'drive', 'study', 'life'];
const GENERAL_THEN = 'life';

const isSituation = (c) => c.lessons.some((l) => !!l.stage);
const inPath = (c, goal) => {
  if (!isSituation(c)) return false;
  const g = c.goals ?? [];
  if (goal === 'general') return g.length === 0 || g.includes(GENERAL_THEN);
  return g.length === 0 || g.includes(goal);
};
const lvl = (c) => { const l = Math.round(c.level ?? 1); return l >= 1 && l <= 3 ? l : 1; };

const cats = await prisma.speakingCategory.findMany({
  where: { isActive: true },
  orderBy: { order: 'asc' },
  select: {
    id: true, order: true, goals: true, level: true, titleTranslated: true,
    targetLanguage: { select: { code: true } },
    nativeLanguage: { select: { code: true } },
    lessons: {
      where: { isActive: true },
      select: { stage: true, items: { select: { text: true, translation: true } } },
    },
  },
});

const usable = cats
  .map((c) => ({ ...c, lessons: c.lessons.filter((l) => l.items.some((i) => i.text.trim() && i.translation.trim())) }))
  .filter((c) => c.lessons.length > 0);

const pairs = new Map();
for (const c of usable) {
  const k = `${c.targetLanguage.code}→${c.nativeLanguage.code}`;
  if (!pairs.has(k)) pairs.set(k, []);
  pairs.get(k).push(c);
}

const unknownGoals = new Set();
for (const [k, list] of pairs) {
  console.log(`\n=== ${k}: ${list.length} боб (${list.filter(isSituation).length} вазъият)`);
  for (const goal of GOALS) {
    const path = list.filter((c) => inPath(c, goal));
    const own = path.filter((c) => (c.goals ?? []).includes(goal === 'general' ? GENERAL_THEN : goal));
    const common = path.filter((c) => (c.goals ?? []).length === 0);
    const ordered = [...path].sort((a, b) =>
      lvl(a) - lvl(b) ||
      ((goal === 'general' && a.goals.length ? 1 : 0) - (goal === 'general' && b.goals.length ? 1 : 0)) ||
      a.order - b.order);
    const first = ordered.slice(0, 3).map((c) => `${c.titleTranslated}${c.goals.length ? `[${c.goals.join(',')}]` : ''}`).join(' → ');
    console.log(`  ${goal.padEnd(8)} роҳ=${String(path.length).padStart(3)}  нишаи худ=${String(own.length).padStart(3)}  умумӣ=${String(common.length).padStart(2)}  | ${first}`);
  }
  for (const c of list) for (const g of c.goals ?? []) if (!GOALS.includes(g)) unknownGoals.add(`${k} «${c.titleTranslated}» → ${g}`);
}
console.log('\nҲадафҳои номаълум дар DB:', unknownGoals.size ? [...unknownGoals] : 'нест');
await prisma.$disconnect();
