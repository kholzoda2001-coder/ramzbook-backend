import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loadLoginSettingsConfig } from '@/lib/auth/login-settings';

export async function GET() {
  try {
    const config = await loadLoginSettingsConfig(prisma);
    return NextResponse.json({
      whatsappSupportNumber: config.whatsappSupportNumber,
    });
  } catch (error) {
    console.error('[public/settings]', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
