/**
 * Admin-only CRUD for the in-app feedback prompt (when it appears, what it says).
 * Guarded by middleware.ts (`/api/admin` requires an admin token).
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  loadFeedbackConfig,
  mergeFeedbackUpdate,
  saveFeedbackConfig,
  type FeedbackConfig,
} from '@/lib/feedback';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const config = await loadFeedbackConfig(prisma);
  return Response.json({ config });
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as { config?: Partial<FeedbackConfig> };
    if (!body.config) {
      return Response.json({ error: 'config object required' }, { status: 400 });
    }
    const current = await loadFeedbackConfig(prisma);
    const merged = mergeFeedbackUpdate(current, body.config);
    await saveFeedbackConfig(prisma, merged);
    return Response.json({ config: merged });
  } catch (e) {
    console.error('[admin/feedback-settings]', e);
    return Response.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
