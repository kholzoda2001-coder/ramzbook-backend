/**
 * Admin-only CRUD for OTP delivery provider settings (masked on read).
 *
 * LIVE: Protected securely via Next.js middleware using JWT tokens.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  loadAuthProvidersConfig,
  maskAuthProvidersForResponse,
  mergeAuthProvidersUpdate,
  saveAuthProvidersConfig,
  type AuthProvidersConfig,
  type EmailOtpProviderId,
  type PhoneOtpProviderId,
} from '@/lib/otp/auth-provider-settings';

const ALLOWED_EMAIL: EmailOtpProviderId[] = ['mock', 'smtp', 'rabbitmq'];
const ALLOWED_PHONE: PhoneOtpProviderId[] = ['mock', 'twilio', 'rabbitmq'];

function assertValidProviderIds(partial: Partial<AuthProvidersConfig>): string | null {
  if (
    partial.activeEmailProvider !== undefined &&
    !ALLOWED_EMAIL.includes(partial.activeEmailProvider)
  ) {
    return 'Invalid activeEmailProvider';
  }
  if (
    partial.activePhoneProvider !== undefined &&
    !ALLOWED_PHONE.includes(partial.activePhoneProvider)
  ) {
    return 'Invalid activePhoneProvider';
  }
  return null;
}

export async function GET(req: NextRequest) {
  const cfg = await loadAuthProvidersConfig(prisma);
  return Response.json({ config: maskAuthProvidersForResponse(cfg) });
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as { config?: Partial<AuthProvidersConfig> };
    if (!body.config) {
      return Response.json({ error: 'config object required' }, { status: 400 });
    }
    const bad = assertValidProviderIds(body.config);
    if (bad) {
      return Response.json({ error: bad }, { status: 400 });
    }
    const current = await loadAuthProvidersConfig(prisma);
    const merged = mergeAuthProvidersUpdate(current, body.config);
    await saveAuthProvidersConfig(prisma, merged);
    return Response.json({
      config: maskAuthProvidersForResponse(merged),
    });
  } catch (e) {
    console.error('[admin/auth-providers]', e);
    return Response.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
