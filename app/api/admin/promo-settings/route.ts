/**
 * Admin-only CRUD for the launch promo (free Premium gift for new users).
 * Guarded by middleware.ts (`/api/admin` requires an admin token).
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  loadPromoConfig,
  mergePromoUpdate,
  renderPromoCopy,
  savePromoConfig,
  type PromoConfig,
} from '@/lib/promo';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const cfg = await loadPromoConfig(prisma);
  // `preview` shows the admin exactly what a user will read after substitution.
  return Response.json({ config: cfg, preview: renderPromoCopy(cfg) });
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as { config?: Partial<PromoConfig> };
    if (!body.config) {
      return Response.json({ error: 'config object required' }, { status: 400 });
    }
    const current = await loadPromoConfig(prisma);
    const merged = mergePromoUpdate(current, body.config);
    await savePromoConfig(prisma, merged);
    return Response.json({ config: merged, preview: renderPromoCopy(merged) });
  } catch (e) {
    console.error('[admin/promo-settings]', e);
    return Response.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
