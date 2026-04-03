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
 * POST /api/mobile/auth/otp/verify
 * Body: { identifier: string, type?: "email" | "phone", code: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      identifier?: string;
      code?: string;
      type?: string;
    };
    const identifier = (body?.identifier ?? '').trim();
    const code = (body?.code ?? '').trim();
    const type = body?.type === 'phone' ? 'phone' : 'email';

    if (!identifier || !code) {
      return Response.json(
        { error: 'Identifier ва код лозим аст.' },
        { status: 400, headers: CORS },
      );
    }

    const result = await runVerifyOtpSession(prisma, {
      rawIdentifier: identifier,
      type,
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
    console.error('[otp/verify]', err);
    return Response.json({ error: 'Хатогии дохилӣ.' }, { status: 500, headers: CORS });
  }
}
