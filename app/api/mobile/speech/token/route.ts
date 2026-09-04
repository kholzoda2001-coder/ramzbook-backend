import { NextRequest, NextResponse } from 'next/server';
import { requireUserId, unauthorized } from '@/lib/auth';
import { isPronunciationConfigured } from '@/lib/ai/pronunciation';

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

    if (!isPronunciationConfigured()) {
      return NextResponse.json({ error: 'not-configured' }, { status: 503 });
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
