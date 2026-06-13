/**
 * Admin-only CRUD for AI Tutor settings (limits, OpenAI key, model, prompt).
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  loadAiSettingsConfig,
  maskAiSettingsForResponse,
  mergeAiSettingsUpdate,
  saveAiSettingsConfig,
  type AiSettingsConfig,
} from '@/lib/ai/ai-settings';

export async function GET(_req: NextRequest) {
  const cfg = await loadAiSettingsConfig(prisma);
  return Response.json({ config: maskAiSettingsForResponse(cfg) });
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as { config?: Partial<AiSettingsConfig> };
    if (!body.config) {
      return Response.json({ error: 'config object required' }, { status: 400 });
    }
    const current = await loadAiSettingsConfig(prisma);
    const merged = mergeAiSettingsUpdate(current, body.config);
    await saveAiSettingsConfig(prisma, merged);
    return Response.json({ config: maskAiSettingsForResponse(merged) });
  } catch (e) {
    console.error('[admin/ai-settings]', e);
    return Response.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
