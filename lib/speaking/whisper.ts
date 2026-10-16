/**
 * «Санҷиши дуюм» барои гуфтор бе Azure — Whisper дар Groq (16.10.2026).
 *
 * ── Чаро ────────────────────────────────────────────────────────────────────
 * Муҳаррики телефон (`SpeechRecognizer`-и Android) VAD-и худро дорад: овози
 * паст ё ҷои гавғодорро «гуфтор нест» мешуморад. Дар ин роҳ барнома САБТРО
 * худаш мегирад (эндпойнтери худӣ, гейни баланд), ва сервер онро бо Whisper
 * ба матн мебарад. Қарори «қабул/рад» ҳамон мантиқи фаззии барнома мемонад.
 *
 * ── Қоидаҳо ─────────────────────────────────────────────────────────────────
 *  • БЕ `prompt`: матни ҳадафро ба Whisper додан хатои хонандаро «ислоҳ» ва
 *    пинҳон мекунад (Whisper ба ҷои шунидаи ӯ матни интизорро менависад).
 *  • Whisper дар хомӯшӣ ҳалюсинатсия дорад («Thank you.»,«Subtitles by…»).
 *    Сегменте, ки `no_speech_prob` баланд ва `avg_logprob` паст дорад, партофта
 *    мешавад; барнома ҳам танҳо баъди овози воқеӣ мефиристад.
 *  • Калид: `GROQ_API_KEY`, ё калиди админ агар `baseUrl`-и он Groq бошад.
 *
 * Хомӯш кардан бе deploy: `speech_engine` → `{"whisper":"off"}`.
 */
import type { PrismaClient } from '@prisma/client';
import { SPEECH_ENGINE_KEY } from './speech-engine';

export const GROQ_BASE = 'https://api.groq.com/openai/v1';
export const WHISPER_MODEL_DEFAULT = 'whisper-large-v3-turbo';
export const WHISPER_TIMEOUT_MS = 8000;
/** ≈ 30 сония дар 16 kHz mono 16-bit (ҳамон ҳад ки `/speech/assess`). */
export const MAX_WHISPER_AUDIO_BYTES = 1024 * 1024;

export type WhisperMode = 'on' | 'off';

/** Пешфарз `on`: ҳамин ки калид ҳаст, кор мекунад; `off` — тугмаи хомӯшкунӣ. */
export function parseWhisperMode(valueJson: string | null | undefined): WhisperMode {
  if (!valueJson) return 'on';
  try {
    const v = (JSON.parse(valueJson) as { whisper?: unknown }).whisper;
    return v === 'off' ? 'off' : 'on';
  } catch {
    return 'on';
  }
}

/** Хатои база набояд гуфторро бикушад — дар шубҳа `on`. */
export async function loadWhisperMode(prisma: PrismaClient): Promise<WhisperMode> {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: SPEECH_ENGINE_KEY } });
    return parseWhisperMode(row?.valueJson);
  } catch {
    return 'on';
  }
}

// ── Кэши режим ───────────────────────────────────────────────────────────────
// 🔴 Логи телефони воқеӣ (17.10.2026): вақти ҷавоб 2–6.5с (миёна ~4с). Ҳар
// дархост ду пурсиши Neon мекард (режим + танзимоти админ); Neon-и «хобида»
// ҳар кадомро 1–3с мекашонад. Режим ҳар чанд соат як бор тағйир меёбад —
// 60 сония дар хотираи ҳамин намунаи функсия нигоҳ дошта мешавад. Хомӯш
// кардани `whisper:off` ҳадди аксар 60с мегирад (дар ҳар намуна, на ҳама якбора).
export const WHISPER_MODE_TTL_MS = 60_000;
let modeCache: { value: WhisperMode; at: number } | null = null;

/** Ҳамон [loadWhisperMode], вале бо кэши 60-сонияӣ. `now` барои тест. */
export async function cachedWhisperMode(
  prisma: PrismaClient,
  now: number = Date.now(),
): Promise<WhisperMode> {
  if (modeCache && now - modeCache.at < WHISPER_MODE_TTL_MS) return modeCache.value;
  const value = await loadWhisperMode(prisma);
  modeCache = { value, at: now };
  return value;
}

export function _resetWhisperModeCacheForTest(): void {
  modeCache = null;
}

export interface WhisperConfig {
  enabled: boolean;
  apiKey: string;
  model: string;
  baseUrl: string;
}

/**
 * Калид: env `GROQ_API_KEY` аввал; вагарна калиди админ, танҳо агар он ба Groq
 * тааллуқ дошта бошад (калиди Gemini/OpenAI ба Groq намеравад).
 */
export function whisperConfig(
  env: Record<string, string | undefined>,
  admin?: { apiKey?: string; baseUrl?: string },
): WhisperConfig {
  const adminIsGroq = (admin?.baseUrl ?? '').toLowerCase().includes('groq.com');
  const apiKey = (env.GROQ_API_KEY ?? '').trim() || (adminIsGroq ? (admin?.apiKey ?? '').trim() : '');
  return {
    enabled: apiKey.length > 0,
    apiKey,
    model: (env.GROQ_WHISPER_MODEL ?? '').trim() || WHISPER_MODEL_DEFAULT,
    baseUrl: GROQ_BASE,
  };
}

/** `en-US` → `en`, `zh-CN` → `zh`; холӣ → `undefined` (Whisper худаш мефаҳмад). */
export function whisperLanguage(locale: string | undefined | null): string | undefined {
  const p = (locale ?? '').trim().replace('_', '-').split('-')[0].toLowerCase();
  return /^[a-z]{2,3}$/.test(p) ? p : undefined;
}

export interface WhisperSegment {
  text?: string;
  no_speech_prob?: number;
  avg_logprob?: number;
}

/**
 * Сегменти ҳалюсинатсия: Whisper «шунид», вале худаш боварӣ надорад гуфтор буд.
 * Ҳарду шарт якҷоя (ҳадди Whisper барои «хомӯшӣ») — як шарт кофӣ нест, вагарна
 * овози паст ва дурусти хонанда бурида мешуд.
 */
export function isHallucinatedSegment(s: WhisperSegment): boolean {
  const ns = s.no_speech_prob;
  const lp = s.avg_logprob;
  return typeof ns === 'number' && typeof lp === 'number' && ns > 0.6 && lp < -1.0;
}

/** Матни ниҳоӣ аз ҷавоби `verbose_json`; сегментҳои ҳалюсинатсия партофта мешаванд. */
export function textFromWhisper(resp: {
  text?: string;
  segments?: WhisperSegment[];
}): string {
  const segs = resp.segments;
  if (Array.isArray(segs) && segs.length > 0) {
    return segs
      .filter((s) => !isHallucinatedSegment(s))
      .map((s) => (s.text ?? '').trim())
      .filter(Boolean)
      .join(' ')
      .trim();
  }
  return (resp.text ?? '').trim();
}

/** WAV-и ҳақиқӣ: сарлавҳаи `RIFF…WAVE` ва камаш 0.1с (3200 байт дар 16kHz/16bit). */
export function isWavBuffer(b: Buffer): boolean {
  return (
    b.length > 44 + 3200 &&
    b.toString('ascii', 0, 4) === 'RIFF' &&
    b.toString('ascii', 8, 12) === 'WAVE'
  );
}

// ── Ҳади дархост ба як корбар ───────────────────────────────────────────────
// ⚠️ Дар хотираи ҳамин намунаи функсия (Vercel бесервер аст) — ин ҳимояи пурра
// нест, танҳо монеа барои сӯйистифодаи оддӣ (скрипт, такрори беохир). Ҳади
// воқеии хароҷот дар Groq (квота) аст.
export const WHISPER_WINDOW_MS = 10 * 60 * 1000;
export const WHISPER_MAX_PER_WINDOW = 80;
const hits = new Map<string, number[]>();

/** `true` = иҷозат; ҳисоб мекунад. `now` барои тест. */
export function takeWhisperSlot(userId: string, now: number = Date.now()): boolean {
  const from = now - WHISPER_WINDOW_MS;
  const list = (hits.get(userId) ?? []).filter((t) => t > from);
  if (list.length >= WHISPER_MAX_PER_WINDOW) {
    hits.set(userId, list);
    return false;
  }
  list.push(now);
  hits.set(userId, list);
  // Хотираро тоза нигоҳ медорем: корбарони ғайрифаъол нест мешаванд.
  if (hits.size > 5000) {
    hits.forEach((v, k) => {
      if (v.every((t: number) => t <= from)) hits.delete(k);
    });
  }
  return true;
}

export function _resetWhisperSlotsForTest(): void {
  hits.clear();
}

export class WhisperError extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

/** WAV (16 kHz mono) → матн. `fetchImpl` барои тест. */
export async function transcribeWithWhisper(opts: {
  audio: Buffer;
  locale?: string;
  config: WhisperConfig;
  fetchImpl?: typeof fetch;
}): Promise<{ text: string; language?: string }> {
  const { audio, config } = opts;
  const f = opts.fetchImpl ?? fetch;
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(audio)], { type: 'audio/wav' }), 'speech.wav');
  form.append('model', config.model);
  form.append('response_format', 'verbose_json');
  form.append('temperature', '0');
  const lang = whisperLanguage(opts.locale);
  if (lang) form.append('language', lang);
  // ⚠️ `prompt` ҚАСДАН нест — ниг. шарҳи боло.

  const res = await f(`${config.baseUrl}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}` },
    body: form,
    signal: AbortSignal.timeout(WHISPER_TIMEOUT_MS),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new WhisperError(res.status, body.slice(0, 200));
  }
  const json = (await res.json()) as { text?: string; language?: string; segments?: WhisperSegment[] };
  return { text: textFromWhisper(json), language: json.language };
}
