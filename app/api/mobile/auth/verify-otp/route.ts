import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runVerifyOtpSession } from '@/lib/otp/otp-verify-session';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/**
 * POST /api/mobile/auth/verify-otp  (legacy)
 * Body: { email: string, code: string }
 *
 * Same as /otp/verify with type=email; includes isNewUser for mobile routing.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; code?: string };
    const email = (body?.email ?? '').trim().toLowerCase();
    const code = (body?.code ?? '').trim();

    const result = await runVerifyOtpSession(prisma, {
      rawIdentifier: email,
      type: 'email',
      code,
    });

    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status, headers: CORS });
    }

    return Response.json(
      {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
        isNewUser: result.isNewUser,
      },
      { status: 200, headers: CORS },
    );
  } catch (err) {
    console.error('[verify-otp]', err);
    return Response.json({ error: 'Хатогии дохилӣ.' }, { status: 500, headers: CORS });
  }
}
