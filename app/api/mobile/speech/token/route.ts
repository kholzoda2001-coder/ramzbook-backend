import { NextRequest, NextResponse } from 'next/server';
import { requireUserId, unauthorized } from '@/lib/auth';
import { isPronunciationConfigured } from '@/lib/ai/pronunciation';
import { prisma } from '@/lib/prisma';
import { isAzureAccountDead, loadAzureMode, SPEECH_ENGINE_KEY } from '@/lib/speaking/speech-engine';
import {
  DEEPGRAM_LISTEN_URL,
  DEEPGRAM_MODEL,
  dailyGrantCap,
  deepgramLanguage,
  dushanbeDay,
  mintDeepgramToken,
  parseDeepgramMode,
} from '@/lib/speaking/deepgram';

export const dynamic = 'force-dynamic';

/**
 * Токени кӯтоҳмуддати Azure барои баҳодиҳии ТАЛАФФУЗИ РЕАЛТАЙМ.
 *
 * ── Чаро ин роҳ вуҷуд дорад ────────────────────────────────────────────────
 *
 * `/speech/assess` тамоми сабтро мегирад: хонанда мегӯяд → интизор мешавад →
 * хол мегирад. Барои «санҷиши талаффуз» ин бас аст, вале барои гардиши
 * ЗИНДАИ дарс не — он ҷо ҷавоб бояд ҳамон лаҳза ояд.
 *
 * Azure барои ин режими ҷараёнӣ (WebSocket) дорад: аудио ҳангоми гап задан
 * пора-пора меравад ва гипотезаҳо фавран бармегарданд. Вале WebSocket-и
 * дарозмуддатро аз сервери мо гузарондан МУМКИН НЕСТ — Vercel функсияи
 * бесервер аст ва пайвасти кушодаро нигоҳ намедорад.
 *
 * Пас барнома бояд РОСТ ба Azure пайваст шавад. Ва маҳз барои ҳамин ин ҷо
 * ТОКЕН бароварда мешавад, на калид:
 *
 *   • калиди Azure абадист — агар он ба APK афтад, ҳар кас онро гирифта
 *     метавонад ва ҳисоби мо холӣ мешавад;
 *   • токен 10 дақиқа зинда аст ва танҳо ба хонандаи воридшуда дода мешавад.
 *
 * Ин ҳамон намунаест, ки худи Microsoft тавсия медиҳад.
 *
 * ⚠️ Ин роҳ ҳисоб карда НАМЕШАВАД. Хароҷоти Azure аз рӯи дарозии АУДИО
 * ҳисоб мешавад, на аз рӯи токен. Маҳдудкунии сарф дар тарафи барнома аст
 * (ниг. `DeepCheckQuota`) — ва рӯзе ки он кофӣ набошад, ҳисоби воқеиро
 * бояд ҳамин ҷо, дар сервер гузорем.
 */

/** Azure токенро 10 дақиқа зинда медорад; мо каме пештар нав мекунем. */
const TTL_SECONDS = 9 * 60;

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    // ── Deepgram (22.10.2026) ────────────────────────────────────────────────
    // Барномаи НАВ `providers: ['deepgram', 'azure']` мефиристад. Нусхаи кӯҳна
    // бе бадан меояд — ба ӯ Deepgram НАМЕДИҲЕМ (ӯ ба Azure сокет мекушояд ва JWT-и
    // Deepgram-ро намефаҳмад), пас аз роҳи пештараи Azure мегузарад.
    const body = (await req.json().catch(() => ({}))) as { providers?: unknown; locale?: unknown };
    const wantsDeepgram =
      Array.isArray(body.providers) && (body.providers as unknown[]).includes('deepgram');
    const dgKey = (process.env.DEEPGRAM_API_KEY ?? '').trim();
    if (wantsDeepgram && dgKey) {
      const row = await prisma.appSetting
        .findUnique({ where: { key: SPEECH_ENGINE_KEY } })
        .catch(() => null);
      const lang = deepgramLanguage(typeof body.locale === 'string' ? body.locale : undefined);
      if (parseDeepgramMode(row?.valueJson) !== 'off' && (lang || body.locale === undefined)) {
        // Ҳадди рӯзона (пул!): беш аз ҳад → 503, барнома то охири ҷаласа ба телефон меравад.
        const day = dushanbeDay(Date.now());
        const grant = await prisma.speechGrant.upsert({
          where: { userId_day: { userId, day } },
          create: { userId, day, count: 1 },
          update: { count: { increment: 1 } },
          select: { count: true },
        });
        if (grant.count > dailyGrantCap(process.env.DEEPGRAM_DAILY_GRANTS)) {
          return NextResponse.json({ error: 'daily-cap' }, { status: 503 });
        }
        const minted = await mintDeepgramToken(dgKey);
        if (minted.ok) {
          return NextResponse.json({
            provider: 'deepgram',
            token: minted.token,
            url: DEEPGRAM_LISTEN_URL,
            model: DEEPGRAM_MODEL,
            expiresIn: minted.expiresIn,
          });
        }
        console.error('[mobile/speech/token] deepgram mint failed', minted.status, minted.dead ? 'dead' : 'temporary');
        // `upstream` — танҳо рамзи HTTP-и Deepgram (на сир): 401 = калид нодуруст, 403 = иҷозат кам (Member лозим), 402 = пул.
        if (minted.dead) return NextResponse.json({ error: 'deepgram-unavailable', upstream: minted.status }, { status: 503 });
        // Хатои муваққатӣ — ба Azure намеафтем (он ҳам хомӯш аст): 502, барнома дубора мекӯшад.
        return NextResponse.json({ error: 'token-failed', upstream: minted.status }, { status: 502 });
      }
    }

    // ⚠️ 503 = «Azure нест, то охири ҷаласа ба муҳаррики телефон гузар»
    // (`RealtimeSpeech.available = false` дар барнома). Ниг. `speech-engine.ts`.
    if (!isPronunciationConfigured()) {
      return NextResponse.json({ error: 'not-configured' }, { status: 503 });
    }
    if ((await loadAzureMode(prisma)) === 'off') {
      return NextResponse.json({ error: 'disabled' }, { status: 503 });
    }

    const key = process.env.AZURE_SPEECH_KEY!;
    const region = process.env.AZURE_SPEECH_REGION!;

    const res = await fetch(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Length': '0',
        },
      },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[mobile/speech/token]', res.status, body.slice(0, 200));
      // Ҳисоби Azure мурда (озмоиш тамом, квота, калид) — на хатои
      // муваққатӣ. 502 барномаро маҷбур мекард ҳар машқ аз нав бикӯшад.
      if (isAzureAccountDead(res.status)) {
        return NextResponse.json({ error: 'azure-unavailable' }, { status: 503 });
      }
      return NextResponse.json({ error: 'token-failed' }, { status: 502 });
    }

    // Ҷавоб JSON НЕСТ — худи JWT ҳамчун матни соф меояд.
    const token = (await res.text()).trim();
    if (!token) {
      return NextResponse.json({ error: 'token-failed' }, { status: 502 });
    }

    return NextResponse.json({
      token,
      region,
      expiresIn: TTL_SECONDS,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[mobile/speech/token]', msg);
    return NextResponse.json({ error: 'token-failed' }, { status: 502 });
  }
}
