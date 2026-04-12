/**
 * Admin-only CRUD for Login Settings (Google, Apple, Telegram).
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  loadLoginSettingsConfig,
  maskLoginSettingsForResponse,
  mergeLoginSettingsUpdate,
  saveLoginSettingsConfig,
  type LoginSettingsConfig,
} from '@/lib/auth/login-settings';

export async function GET(req: NextRequest) {
  const cfg = await loadLoginSettingsConfig(prisma);
  return Response.json({ config: maskLoginSettingsForResponse(cfg) });
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as { config?: Partial<LoginSettingsConfig> };
    if (!body.config) {
      return Response.json({ error: 'config object required' }, { status: 400 });
    }
    const current = await loadLoginSettingsConfig(prisma);
    const merged = mergeLoginSettingsUpdate(current, body.config);
    await saveLoginSettingsConfig(prisma, merged);
    return Response.json({
      config: maskLoginSettingsForResponse(merged),
    });
  } catch (e) {
    console.error('[admin/login-settings]', e);
    return Response.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
