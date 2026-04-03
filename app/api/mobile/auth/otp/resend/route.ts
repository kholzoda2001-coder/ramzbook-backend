import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runSendOtpPipeline } from '@/lib/otp/otp-send-pipeline';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/**
 * POST /api/mobile/auth/otp/resend
 * Body: { identifier: string, type: "email" | "phone" }
 *
 * Same behaviour as `/otp/request` (cooldown, hash, provider routing).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { identifier?: string; type?: string };
    const identifier = (body?.identifier ?? '').trim();
    const type = body?.type === 'phone' ? 'phone' : 'email';

    if (!identifier) {
      return Response.json({ error: 'Identifier required.' }, { status: 400, headers: CORS });
    }

    const result = await runSendOtpPipeline(prisma, { rawIdentifier: identifier, type });

    if (!result.ok) {
      return Response.json(
        { error: result.error, retryAfterSec: result.retryAfterSec },
        { status: result.status, headers: CORS },
      );
    }

    return Response.json({ message: 'Код дубора фиристода шуд.' }, { status: 200, headers: CORS });
  } catch (err) {
    console.error('[otp/resend]', err);
    return Response.json({ error: 'Хатогии дохилӣ.' }, { status: 500, headers: CORS });
  }
}
