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
 * POST /api/mobile/auth/send-otp  (legacy)
 * Body: { email: string }
 *
 * Delegates to the shared OTP pipeline (hashed storage + provider adapters).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = (body?.email ?? '').trim();

    const result = await runSendOtpPipeline(prisma, {
      rawIdentifier: email,
      type: 'email',
    });

    if (!result.ok) {
      return Response.json(
        { error: result.error, retryAfterSec: result.retryAfterSec },
        { status: result.status, headers: CORS },
      );
    }

    return Response.json({ message: 'Код фиристода шуд.' }, { status: 200, headers: CORS });
  } catch (err) {
    console.error('[send-otp]', err);
    return Response.json({ error: 'Хатогии дохилӣ.' }, { status: 500, headers: CORS });
  }
}
