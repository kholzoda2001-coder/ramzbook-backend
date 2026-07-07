// TEMPORARY — protected by the same admin middleware as every /api/admin/*
// route (x-admin-api-key header or admin_token cookie). Returns the raw,
// unmasked API key so a one-off local script can test Groq TTS for the
// Russian alphabet. Delete this file right after use.
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loadAiSettingsConfig } from '@/lib/ai/ai-settings';

export async function GET(_req: NextRequest) {
  const cfg = await loadAiSettingsConfig(prisma);
  return Response.json({ apiKey: cfg.apiKey, baseUrl: cfg.baseUrl, model: cfg.model });
}
