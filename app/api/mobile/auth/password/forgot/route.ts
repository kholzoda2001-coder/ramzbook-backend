import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyOtpInDb, normalizeIdentifier, type OtpChannel } from '@/lib/otp/otp-core';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/**
 * POST /api/mobile/auth/password/forgot
 * Body: { identifier: string, code: string, newPassword: string }
 *
 * 1. OTP кодни текширади
 * 2. Фойдаловчини топади (email ёки телефон орқали)
 * 3. Паролни ўзгартиради
 * 4. Сессия бермайди — фойдаловчи дубора кириши керак
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      identifier?: string;
      code?: string;
      newPassword?: string;
    };

    const rawIdentifier = (body?.identifier ?? '').trim();
    const code = (body?.code ?? '').trim();
    const newPassword = (body?.newPassword ?? '').trim();

    // ── Маълумотларни текширамиз ──────────────────────────────────────────
    if (!rawIdentifier) {
      return Response.json(
        { error: 'Идентификатор (телефон ё почта) лозим аст.' },
        { status: 400, headers: CORS },
      );
    }
    if (!code || code.length !== 6) {
      return Response.json(
        { error: 'Коди 6-рақама лозим аст.' },
        { status: 400, headers: CORS },
      );
    }
    if (!newPassword || newPassword.length < 8) {
      return Response.json(
        { error: 'Пароли нав бояд камаш 8 аломат бошад.' },
        { status: 400, headers: CORS },
      );
    }

    // ── Каналро аниқлаймиз ────────────────────────────────────────────────
    const channel: OtpChannel = rawIdentifier.includes('@') ? 'email' : 'phone';
    const identifier = normalizeIdentifier(channel, rawIdentifier);

    // ── OTP кодни текширамиз ──────────────────────────────────────────────
    const v = await verifyOtpInDb(prisma, identifier, code);
    if (!v.ok) {
      if (v.reason === 'too_many_attempts') {
        return Response.json(
          { error: 'Такрори зиёд. Коди нав дархост кунед.' },
          { status: 429, headers: CORS },
        );
      }
      if (v.reason === 'not_found') {
        return Response.json(
          { error: 'Код ёфт нашуд. Аввал кодро сӯзон кунед.' },
          { status: 400, headers: CORS },
        );
      }
      return Response.json(
        { error: 'Коди нодуруст ё мӯҳлаташ гузашт.' },
        { status: 401, headers: CORS },
      );
    }

    // ── Фойдаловчини топамиз ──────────────────────────────────────────────
    let user = null;
    if (channel === 'email') {
      user = await prisma.user.findUnique({ where: { email: identifier } });
    } else {
      // Телефон орқали — phone устуниданки ёки синтетик email дан
      const syntheticEmail = `phone_${identifier.replace(/[^0-9]/g, '')}@internal.ramzbook.tj`;
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: identifier },
            { email: syntheticEmail },
          ],
        },
      });
    }

    if (!user) {
      return Response.json(
        { error: 'Бо ин маълумот фойдаловчи ёфт нашуд.' },
        { status: 404, headers: CORS },
      );
    }

    // ── Паролни ҳаш қилиб ўзгартирамиз ───────────────────────────────────
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // ── Барча refresh токенларини бекор қиламиз (хавфсизлик учун) ────────
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    return Response.json(
      { message: 'Парол бомуваффақият иваз шуд.' },
      { status: 200, headers: CORS },
    );
  } catch (err) {
    console.error('[password/forgot]', err);
    return Response.json(
      { error: 'Хатогии дохилӣ. Лутфан дубора уриниед.' },
      { status: 500, headers: CORS },
    );
  }
}
