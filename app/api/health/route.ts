import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health — lightweight uptime/readiness probe (Phase 6, Step 31).
 * Pings the database with a trivial query so monitors can distinguish
 * "app up" from "app up but DB unreachable". Returns 200 when healthy,
 * 503 otherwise. No auth, no secrets.
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      db: 'up',
      latencyMs: Date.now() - startedAt,
      time: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, db: 'down', error: err?.message ?? 'database unreachable', time: new Date().toISOString() },
      { status: 503 },
    );
  }
}
