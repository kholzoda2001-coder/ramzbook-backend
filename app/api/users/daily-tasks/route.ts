import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { ensureTodayTasks } from '@/lib/dailyTasks';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/daily-tasks
 * Today's quests for the user (created on first access each day).
 * Progress is driven by lesson-completion events (see lib/dailyTasks.ts).
 */
export async function GET(req: Request) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tasks = await ensureTodayTasks(me.id);

    return NextResponse.json({
      tasks: tasks.map((t) => ({
        taskType: t.taskType,
        targetValue: t.targetValue,
        currentValue: Math.min(t.currentValue, t.targetValue),
        reward: t.reward,
        completed: t.completed,
      })),
    });
  } catch (error) {
    console.error('[daily-tasks]', error);
    return NextResponse.json({ error: 'Failed to load daily tasks' }, { status: 500 });
  }
}
