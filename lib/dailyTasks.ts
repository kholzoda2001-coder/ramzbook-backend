import { prisma } from './prisma';
import { DEFAULT_TZ_OFFSET_MIN } from './localDay';

// ─────────────────────────────────────────────────────────────────────────────
// Daily tasks ("Вазифаҳои рӯзона"). Three trackable quests per day, reset daily.
// All are driven by real lesson-completion events via updateDailyTasks().
// ─────────────────────────────────────────────────────────────────────────────

export type DailyTaskDef = {
  taskType: 'complete_lesson' | 'learn_words' | 'earn_xp';
  targetValue: number;
  reward: number; // gems
};

/**
 * 🔴 «1 дарс дар як рӯз» ҳадафи НОДУРУСТ буд.
 *
 * Ченаки продакшн (21.09.2026, 143 хонандаи фаъол) нишон дод, ки маҳз
 * шумораи дарси рӯзи ЯКУМ тақдири корбарро ҳал мекунад:
 *
 *     1 дарс   → 45% бармегардад, 8%  хонандаи доимӣ мешавад
 *     2–3      → 46% / 14%
 *     7–12     → 86% / 64%
 *
 * Ҳадафи «1 дарс» маҳз ҳамон рафтореро мукофот медод, ки бадтарин натиҷа
 * дорад. 3 дарс ≈ 10 дақиқа — ҳадафи воқеӣ ва расиданашон осон.
 */
export const DAILY_TASK_DEFS: DailyTaskDef[] = [
  { taskType: 'complete_lesson', targetValue: 3, reward: 10 },
  { taskType: 'learn_words', targetValue: 5, reward: 5 },
  { taskType: 'earn_xp', targetValue: 50, reward: 5 },
];

/**
 * «Имрӯз» бо вақти ДУШАНБЕ (UTC+5), на UTC.
 *
 * 🔴 Бо UTC рӯзи вазифаҳо соати 05:00-и субҳи маҳаллӣ иваз мешуд: хонандае,
 * ки шаб соати 01:00 машғул мешуд, ҳанӯз вазифаҳои ДИРӮЗРО медид ва пас аз
 * 05:00 пешрафташ «нест» мешуд. Ҳамон қоидаи боқимондаи барнома
 * (`lib/localDay.ts`).
 */
function todayString(d = new Date()): string {
  return new Date(d.getTime() + DEFAULT_TZ_OFFSET_MIN * 60_000)
    .toISOString()
    .split('T')[0];
}

/** Ensures today's 3 tasks exist for the user; returns them ordered. */
export async function ensureTodayTasks(userId: string) {
  const date = todayString();

  const existing = await prisma.dailyTask.findMany({ where: { userId, date } });
  const have = new Set(existing.map((t) => t.taskType));
  const missing = DAILY_TASK_DEFS.filter((d) => !have.has(d.taskType));

  if (missing.length > 0) {
    await prisma.dailyTask.createMany({
      data: missing.map((d) => ({
        userId,
        date,
        taskType: d.taskType,
        targetValue: d.targetValue,
        currentValue: 0,
        reward: d.reward,
        completed: false,
      })),
      skipDuplicates: true,
    });
  }

  const tasks = await prisma.dailyTask.findMany({ where: { userId, date } });
  // Keep a stable order matching DAILY_TASK_DEFS
  const order = DAILY_TASK_DEFS.map((d) => d.taskType);
  return tasks.sort((a, b) => order.indexOf(a.taskType as never) - order.indexOf(b.taskType as never));
}

/**
 * Increments today's task progress from a lesson-completion event.
 * Marks tasks complete + awards their gem reward exactly once.
 */
export async function updateDailyTasks(
  userId: string,
  deltas: { lessons?: number; words?: number; xp?: number },
): Promise<void> {
  const date = todayString();
  await ensureTodayTasks(userId);

  const map: Record<string, number> = {
    complete_lesson: deltas.lessons ?? 0,
    learn_words: deltas.words ?? 0,
    earn_xp: deltas.xp ?? 0,
  };

  const tasks = await prisma.dailyTask.findMany({ where: { userId, date } });
  let gemsToAward = 0;

  for (const task of tasks) {
    if (task.completed) continue;
    const delta = map[task.taskType] ?? 0;
    if (delta <= 0) continue;

    const newValue = task.currentValue + delta;
    const nowComplete = newValue >= task.targetValue;

    await prisma.dailyTask.update({
      where: { id: task.id },
      data: { currentValue: newValue, completed: nowComplete },
    });

    if (nowComplete) gemsToAward += task.reward;
  }

  if (gemsToAward > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { gems: { increment: gemsToAward } },
    });
    await prisma.gemTransaction.create({
      data: { userId, amount: gemsToAward, reason: 'daily_task_complete' },
    });
  }
}
