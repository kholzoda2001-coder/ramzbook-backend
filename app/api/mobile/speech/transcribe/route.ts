import { NextRequest, NextResponse } from 'next/server';
import { requireUserId, unauthorized } from '@/lib/auth';
import { loadAiSettingsConfig } from '@/lib/ai/ai-settings';
import { prisma } from '@/lib/prisma';
import {
  MAX_WHISPER_AUDIO_BYTES,
  WhisperError,
  loadWhisperMode,
  transcribeWithWhisper,
  whisperConfig,
} from '@/lib/speaking/whisper';

export const dynamic = 'force-dynamic';

/**
 * Матни гуфтор аз садои хонанда — Whisper (Groq), бе Azure.
 *
 * Ниг. `lib/speaking/whisper.ts`. Барнома ин роҳро танҳо вақте мегирад, ки
 * Azure нест (503) ва муҳаррики телефон овози паст/гавғоро намефаҳмад.
 *
 *  • `GET`  — «фаъол?»: 204 ё 503. Барнома пеш аз сабт мепурсад, то садои
 *    хонанда бе сабаб гум нашавад.
 *  • `POST` — `{ audio: base64 WAV 16kHz mono, locale }` → `{ text, language }`.
 *
 * 503 = «Whisper нест» (калид нест / хомӯш) → барнома то охири ҷаласа ба
 * муҳаррики телефон мемонад. 502 = хатои муваққатӣ.
 */
async function cfgOrNull() {
  if ((await loadWhisperMode(prisma)) === 'off') return null;
  let admin: { apiKey?: string; baseUrl?: string } | undefined;
  try {
    admin = await loadAiSettingsConfig(prisma);
  } catch {
    admin = undefined;
  }
  const cfg = whisperConfig(process.env, admin);
  return cfg.enabled ? cfg : null;
}

export async function GET(req: NextRequest) {
  const userId = requireUserId(req);
  if (!userId) return unauthorized('Missing or invalid Bearer token.');
  if (!(await cfgOrNull())) {
    return NextResponse.json({ error: 'disabled' }, { status: 503 });
  }
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const cfg = await cfgOrNull();
    if (!cfg) return NextResponse.json({ error: 'disabled' }, { status: 503 });

    const body = (await req.json().catch(() => null)) as {
      audio?: string;
      locale?: string;
    } | null;
    const audioB64 = body?.audio ?? '';
    if (!audioB64) return NextResponse.json({ error: 'no-audio' }, { status: 400 });

    const audio = Buffer.from(audioB64, 'base64');
    if (audio.length === 0 || audio.length > MAX_WHISPER_AUDIO_BYTES) {
      return NextResponse.json({ error: 'bad-audio' }, { status: 400 });
    }

    const out = await transcribeWithWhisper({ audio, locale: body?.locale, config: cfg });
    return NextResponse.json(out);
  } catch (e: unknown) {
    if (e instanceof WhisperError) {
      console.error('[mobile/speech/transcribe]', e.status, e.message);
      // Калид нодуруст / квота: «Whisper нест» (барнома ба телефон мегузарад).
      if (e.status === 401 || e.status === 403) {
        return NextResponse.json({ error: 'whisper-unavailable' }, { status: 503 });
      }
      return NextResponse.json({ error: 'transcribe-failed' }, { status: 502 });
    }
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[mobile/speech/transcribe]', msg);
    return NextResponse.json({ error: 'transcribe-failed' }, { status: 502 });
  }
}
