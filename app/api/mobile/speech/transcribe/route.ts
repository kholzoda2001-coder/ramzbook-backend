import { NextRequest, NextResponse } from 'next/server';
import { requireUserId, unauthorized } from '@/lib/auth';
import { loadAiSettingsConfig } from '@/lib/ai/ai-settings';
import { prisma } from '@/lib/prisma';
import {
  MAX_WHISPER_AUDIO_BYTES,
  WhisperError,
  cachedWhisperMode,
  isWavBuffer,
  takeWhisperSlot,
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
 *  • `GET`  — «фаъол?»: ҳамеша 200 `{ enabled: boolean }`.
 *  • `POST` — `{ audio: base64 WAV 16kHz mono, locale }` → `{ text, language }`.
 *
 * ⚠️ ҶАВОБИ «НЕСТ» НАБОЯД 5xx БОШАД. `_FallbackInterceptor`-и барнома ҳар 5xx-ро
 * «сервери асосӣ мурд» мешуморад ва URL-и API-ро ба ТАМОМИ барнома иваз мекунад
 * (`ApiConfig.tryFallback`). Пас:
 *   409 `disabled`          — хомӯш / калид нест / калид нодуруст → барнома то
 *                             охири ҷаласа ба муҳаррики телефон мемонад;
 *   424 `transcribe-failed` — Groq муваққатан ҷавоб надод (429, хатои шабака);
 *   429 `slow-down`         — ҳад аз ҳад зиёд аст.
 */
async function cfgOrNull() {
  // Режим — бо кэши 60с (ниг. `cachedWhisperMode`): бе он ҳар дархост ба Neon мерафт.
  if ((await cachedWhisperMode(prisma)) === 'off') return null;
  // Калиди env ҳаст → пурсиши дуюм (танзимоти админ) ЛОЗИМ НЕСТ. Он танҳо
  // роҳи эҳтиётӣ барои калиди Groq-и админ аст.
  const fromEnv = whisperConfig(process.env);
  if (fromEnv.enabled) return fromEnv;
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
  return NextResponse.json({ enabled: (await cfgOrNull()) !== null });
}

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const cfg = await cfgOrNull();
    if (!cfg) return NextResponse.json({ error: 'disabled' }, { status: 409 });

    // Муҳофизат аз сӯйистифода (квотаи Groq умумӣ аст). Ҳади саховатманд:
    // хонандаи воқеӣ дар як дақиқа аз 6–10 навбат зиёд намекунад.
    if (!takeWhisperSlot(userId)) {
      return NextResponse.json({ error: 'slow-down' }, { status: 429 });
    }

    const body = (await req.json().catch(() => null)) as {
      audio?: string;
      locale?: string;
    } | null;
    const audioB64 = body?.audio ?? '';
    if (!audioB64) return NextResponse.json({ error: 'no-audio' }, { status: 400 });

    const audio = Buffer.from(audioB64, 'base64');
    if (!isWavBuffer(audio) || audio.length > MAX_WHISPER_AUDIO_BYTES) {
      return NextResponse.json({ error: 'bad-audio' }, { status: 400 });
    }

    // `ms` — вақти ТАНҲО даъвати Groq: аз лог (`[WSTT] … сервер Nмс`) маълум
    // мешавад, ки таъхир дар Groq аст ё дар шабака/база.
    const t0 = Date.now();
    const out = await transcribeWithWhisper({ audio, locale: body?.locale, config: cfg });
    return NextResponse.json({ ...out, ms: Date.now() - t0 });
  } catch (e: unknown) {
    if (e instanceof WhisperError) {
      console.error('[mobile/speech/transcribe]', e.status, e.message);
      // Калид нодуруст / ҳисоб баста: «Whisper нест» то охири ҷаласа.
      if (e.status === 401 || e.status === 403) {
        return NextResponse.json({ error: 'disabled' }, { status: 409 });
      }
      return NextResponse.json({ error: 'transcribe-failed' }, { status: 424 });
    }
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[mobile/speech/transcribe]', msg);
    return NextResponse.json({ error: 'transcribe-failed' }, { status: 424 });
  }
}
