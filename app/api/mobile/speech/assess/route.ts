import { NextRequest, NextResponse } from 'next/server';
import { requireUserId, unauthorized } from '@/lib/auth';
import {
  assessPronunciation,
  isPronunciationConfigured,
} from '@/lib/ai/pronunciation';

export const dynamic = 'force-dynamic';

/**
 * Баҳодиҳии ТАЛАФФУЗ — «Талаффузи маро санҷ».
 *
 * Барнома як ибораро сабт мекунад ва ин ҷо мефиристад; ҷавоб хол барои ҳар
 * калима ва ҳар фонема аст. Ниг. `lib/ai/pronunciation.ts` — он ҷо шарҳ
 * дода шудааст, ки чаро ин аз муҳаррики ҳозираи барнома ҷудост.
 *
 * ⚠️ Калиди Azure ҲЕҶ ГОҲ ба барнома намеравад: аудио ба сервери МО меояд,
 * сервер ба Azure муроҷиат мекунад. Калид дар барномаи мобилӣ = калиди
 * оммавӣ; ҳар кас метавонад APK-ро кушода онро гирад.
 *
 * ── Ҳудудҳо ────────────────────────────────────────────────────────────────
 * Аудио ба ҷисми дархост ҳамчун base64 меояд (JSON, на multipart: клиенти
 * Dart барои як файли хурд ҳамин соддатарин аст). Ҳадди 1 МБ ≈ 30 сония дар
 * 16 kHz mono — аз ҳар ибораи дарс хеле зиёд.
 */
const MAX_AUDIO_BYTES = 1024 * 1024;

/** Ҳадди дарозии матни ҳадаф — муҳофизат аз дархости бемаънӣ. */
const MAX_REFERENCE_LEN = 300;

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    // Хидмат танзим нашуда — барнома тугмаро пинҳон мекунад. 503, на 500:
    // ин хатои сервер нест, балки «ҳанӯз васл нашудааст».
    if (!isPronunciationConfigured()) {
      return NextResponse.json(
        { error: 'not-configured' },
        { status: 503 },
      );
    }

    const body = (await req.json().catch(() => null)) as {
      audio?: string;
      reference?: string;
      locale?: string;
    } | null;

    const reference = (body?.reference ?? '').trim();
    const locale = (body?.locale ?? '').trim() || 'en-US';
    const audioB64 = body?.audio ?? '';

    if (!reference || reference.length > MAX_REFERENCE_LEN) {
      return NextResponse.json({ error: 'bad-reference' }, { status: 400 });
    }
    if (!audioB64) {
      return NextResponse.json({ error: 'no-audio' }, { status: 400 });
    }

    const audio = Buffer.from(audioB64, 'base64');
    if (audio.length === 0 || audio.length > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: 'bad-audio' }, { status: 400 });
    }

    const result = await assessPronunciation({ audio, reference, locale });
    if (!result) {
      return NextResponse.json({ error: 'not-configured' }, { status: 503 });
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);

    // Azure садоро гуфтор нашумурд — ин хатои ХОНАНДА нест. Барнома бояд
    // «шуморо нашунидам» гӯяд, на «хол 0».
    if (msg === 'no-speech') {
      return NextResponse.json({ error: 'no-speech' }, { status: 422 });
    }

    console.error('[mobile/speech/assess]', msg);
    return NextResponse.json({ error: 'assess-failed' }, { status: 502 });
  }
}
