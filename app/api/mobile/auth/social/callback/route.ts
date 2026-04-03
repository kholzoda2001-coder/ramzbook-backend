/**
 * POST /api/mobile/auth/social/callback
 * Body: { provider: "google" | "apple" | "telegram", idToken: string }
 *
 * - Google: `google-auth-library` + GOOGLE_CLIENT_ID (or dev `mock_*` token).
 * - Apple: `jose` JWKS verify + APPLE_CLIENT_ID (Bundle ID and/or Services ID, comma-separated).
 * - Telegram: TELEGRAM_BOT_TOKEN + idToken = JSON string from Login Widget (hash verified).
 *
 * Dev: `mock_*` tokens issue a session only when not production or ALLOW_MOCK_SOCIAL=true.
 */

import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import {
  generateRefreshToken,
  hashRefreshToken,
  signAccessTokenForUser,
} from '@/lib/auth';
import { loadLoginSettingsConfig } from '@/lib/auth/login-settings';
import { verifyTelegramLoginWidget } from '@/lib/social/telegram-widget';
import { verifyAppleIdentityToken } from '@/lib/social/apple-jwt';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const REFRESH_TTL_DAYS = 30;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { provider?: string; idToken?: string };
    const provider = (body?.provider ?? '').toLowerCase().trim();
    const idToken = (body?.idToken ?? '').trim();

    if (!provider || !idToken) {
      return Response.json({ error: 'provider ва idToken лозим аст.' }, { status: 400, headers: CORS });
    }

    let email: string;
    let name: string;
    let isNewUser = false;
    
    const loginCfg = await loadLoginSettingsConfig(prisma);

    if (provider === 'google') {
      const clientId = loginCfg.googleClientId || process.env.GOOGLE_CLIENT_ID;
      if (idToken.startsWith('mock_')) {
        const allowMock = loginCfg.allowMockSocial || process.env.ALLOW_MOCK_SOCIAL === 'true';
        if (process.env.NODE_ENV === 'production' && !allowMock) {
          return Response.json({ error: 'Mock social disabled in production.' }, { status: 403, headers: CORS });
        }
        const slug = crypto.createHash('sha256').update(idToken).digest('hex').slice(0, 20);
        email = `mock_${slug}@ramzbook.dev`;
        name = 'Dev Google';
      } else if (clientId) {
        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({ idToken, audience: clientId });
        const payload = ticket.getPayload();
        if (!payload?.email) {
          return Response.json({ error: 'Google token бе email.' }, { status: 400, headers: CORS });
        }
        email = payload.email.toLowerCase();
        name = (payload.name ?? email.split('@')[0]) as string;
      } else {
        return Response.json(
          {
            error:
              'GOOGLE_CLIENT_ID нест. Admin Panel-ро пур кунед ё муваққатан mock token истифода баред (танҳо dev).',
          },
          { status: 501, headers: CORS },
        );
      }
    } else if (provider === 'apple') {
      if (idToken.startsWith('mock_')) {
        const allowMock = loginCfg.allowMockSocial || process.env.ALLOW_MOCK_SOCIAL === 'true';
        if (process.env.NODE_ENV === 'production' && !allowMock) {
          return Response.json({ error: 'Mock social disabled in production.' }, { status: 403, headers: CORS });
        }
        const slug = crypto.createHash('sha256').update(idToken).digest('hex').slice(0, 20);
        email = `mock_apple_${slug}@ramzbook.dev`;
        name = 'Dev Apple';
      } else {
        const raw = (loginCfg.appleClientIds || process.env.APPLE_CLIENT_ID || '').trim();
        if (!raw) {
          return Response.json(
            {
              error:
                'APPLE_CLIENT_ID нест. Барои iOS/macOS одатан Bundle ID; барои Web — Services ID. ' +
                'Чанд арзишро бо віргул ҷудо кунед агар зарур бошад.',
            },
            { status: 501, headers: CORS },
          );
        }
        const audiences = raw.split(',').map((s) => s.trim()).filter(Boolean);
        try {
          const { sub, email: appleEmail } = await verifyAppleIdentityToken(idToken, audiences);
          email = appleEmail ?? `apple_${sub}@apple.ramzbook.internal`;
          name =
            appleEmail != null && appleEmail.length > 0
              ? appleEmail.split('@')[0]!
              : `Apple ${sub.slice(0, 8)}`;
        } catch (e) {
          console.error('[social/callback] Apple JWT', e);
          return Response.json(
            { error: 'Apple identity token нодуруст ё мӯҳлаташ гузашта.' },
            { status: 401, headers: CORS },
          );
        }
      }
    } else if (provider === 'telegram') {
      const botToken = (loginCfg.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '').trim();
      if (!botToken) {
        return Response.json(
          {
            error:
              'TELEGRAM_BOT_TOKEN танзим нашудааст (Admin Panel ё .env).',
          },
          { status: 503, headers: CORS },
        );
      }
      let authData: Record<string, string>;
      try {
        const parsed = JSON.parse(idToken) as Record<string, unknown>;
        authData = Object.fromEntries(
          Object.entries(parsed).map(([k, v]) => [k, String(v ?? '')]),
        );
      } catch {
        return Response.json(
          { error: 'Telegram: idToken = JSON string аз callback (id, first_name, hash, …).' },
          { status: 400, headers: CORS },
        );
      }
      if (!verifyTelegramLoginWidget(authData, botToken)) {
        return Response.json({ error: 'Telegram hash нодуруст.' }, { status: 401, headers: CORS });
      }
      const tgId = String(authData.id ?? '').trim();
      if (!tgId) {
        return Response.json({ error: 'Telegram: id вуҷуд надорад.' }, { status: 400, headers: CORS });
      }
      email = `tg_${tgId}@telegram.ramzbook.internal`;
      const fn = authData.first_name ?? '';
      const ln = authData.last_name ?? '';
      const un = authData.username ?? '';
      name = [fn, ln].filter(Boolean).join(' ').trim() || (un ? `@${un}` : `Telegram ${tgId}`);
    } else {
      return Response.json({ error: 'Ношинохта provider.' }, { status: 400, headers: CORS });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      isNewUser = true;
      const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
      user = await prisma.user.create({
        data: { email, name, passwordHash, isActive: true },
      });
    }

    const accessToken = signAccessTokenForUser(user.id);
    const rawRefresh = generateRefreshToken();
    const hashedRefresh = hashRefreshToken(rawRefresh);
    const refreshExpires = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashedRefresh,
        expiresAt: refreshExpires,
      },
    });

    return Response.json(
      {
        accessToken,
        refreshToken: rawRefresh,
        isNewUser,
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 200, headers: CORS },
    );
  } catch (err) {
    console.error('[social/callback]', err);
    return Response.json({ error: 'Хатогии дохилӣ.' }, { status: 500, headers: CORS });
  }
}
