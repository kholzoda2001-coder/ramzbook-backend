/**
 * /api/mobile/speech/transcribe — рамзҳои ҷавоб (ҳеҷ 5xx барои «нест»), WAV,
 * ҳад. Groq ва база қалбакӣ.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let mode = '{"azure":"off"}';
let modeReads = 0;
vi.mock('@/lib/prisma', () => ({
  prisma: {
    appSetting: {
      findUnique: async () => {
        modeReads++;
        return { valueJson: mode };
      },
    },
  },
}));
let authed = true;
vi.mock('@/lib/auth', () => ({
  requireUserId: () => (authed ? 'u1' : null),
  unauthorized: () => new Response('no', { status: 401 }),
}));
let adminReads = 0;
let adminCfg = { apiKey: '', baseUrl: '' };
vi.mock('@/lib/ai/ai-settings', () => ({
  loadAiSettingsConfig: async () => {
    adminReads++;
    return adminCfg;
  },
}));

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/mobile/speech/transcribe/route';
import {
  _resetWhisperModeCacheForTest,
  _resetWhisperSlotsForTest,
  WHISPER_MAX_PER_WINDOW,
} from '../whisper';

/** WAV-и дуруст: сарлавҳа + [ms] миллисония хомӯшӣ. */
function wavB64(ms = 500): string {
  const data = Buffer.alloc(ms * 32);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(16000, 24);
  h.writeUInt32LE(32000, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]).toString('base64');
}

const get = () => new NextRequest('http://x/api/mobile/speech/transcribe');
const post = (body: unknown) =>
  new NextRequest('http://x/api/mobile/speech/transcribe', { method: 'POST', body: JSON.stringify(body) });

let groq: () => Response;

beforeEach(() => {
  mode = '{"azure":"off"}';
  authed = true;
  modeReads = 0;
  adminReads = 0;
  adminCfg = { apiKey: '', baseUrl: '' };
  _resetWhisperSlotsForTest();
  _resetWhisperModeCacheForTest();
  vi.stubEnv('GROQ_API_KEY', 'k');
  vi.stubGlobal('fetch', async () => groq());
  vi.spyOn(console, 'error').mockImplementation(() => {});
  groq = () => new Response(JSON.stringify({ text: 'I am fine', language: 'en', segments: [] }), { status: 200 });
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('GET (санҷиши «фаъол?»)', () => {
  it('бе токен → 401', async () => {
    authed = false;
    expect((await GET(get())).status).toBe(401);
  });
  it('калид ҳаст → 200 {enabled:true}', async () => {
    const r = await GET(get());
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ enabled: true });
  });
  it('калид нест → 200 {enabled:false} (на 5xx!)', async () => {
    vi.stubEnv('GROQ_API_KEY', '');
    const r = await GET(get());
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ enabled: false });
  });
  it('whisper:off дар speech_engine → enabled:false', async () => {
    mode = '{"azure":"off","whisper":"off"}';
    expect(await (await GET(get())).json()).toEqual({ enabled: false });
  });
});

describe('суръат: пурсиши база', () => {
  it('калиди env ҳаст → танзимоти админ ГИРИФТА НАМЕШАВАД', async () => {
    await GET(get());
    await POST(post({ audio: wavB64() }));
    expect(adminReads).toBe(0);
  });
  it('режим 60с кэш мешавад: ду дархост = як пурсиш', async () => {
    await GET(get());
    await GET(get());
    await POST(post({ audio: wavB64() }));
    expect(modeReads).toBe(1);
  });
  it('калиди env нест → роҳи эҳтиётӣ: калиди Groq-и админ', async () => {
    vi.stubEnv('GROQ_API_KEY', '');
    adminCfg = { apiKey: 'admin-groq', baseUrl: 'https://api.groq.com/openai/v1' };
    expect(await (await GET(get())).json()).toEqual({ enabled: true });
    expect(adminReads).toBe(1);
  });
  it('кэш тугайдан баъд (>60с) аз нав мепурсад', async () => {
    const { cachedWhisperMode, WHISPER_MODE_TTL_MS } = await import('../whisper');
    const db = { appSetting: { findUnique: async () => { modeReads++; return { valueJson: '{"whisper":"off"}' }; } } };
    expect(await cachedWhisperMode(db as never, 1000)).toBe('off');
    expect(await cachedWhisperMode(db as never, 1000 + WHISPER_MODE_TTL_MS - 1)).toBe('off');
    expect(modeReads).toBe(1);
    await cachedWhisperMode(db as never, 1000 + WHISPER_MODE_TTL_MS + 1);
    expect(modeReads).toBe(2);
  });
});

describe('POST', () => {
  it('муваффақият → {text, language}', async () => {
    const r = await POST(post({ audio: wavB64(), locale: 'en-US' }));
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j).toMatchObject({ text: 'I am fine', language: 'en' });
    expect(typeof j.ms).toBe('number'); // вақти Groq барои ташхиси таъхир
    expect(j.ms).toBeGreaterThanOrEqual(0);
  });
  it('хомӯш → 409 (на 5xx: интерцептори барнома URL-ро иваз мекард)', async () => {
    mode = '{"whisper":"off"}';
    expect((await POST(post({ audio: wavB64() }))).status).toBe(409);
  });
  it('калиди Groq нодуруст (401 аз Groq) → 409', async () => {
    groq = () => new Response('bad key', { status: 401 });
    expect((await POST(post({ audio: wavB64() }))).status).toBe(409);
  });
  it('Groq 429/500 → 424 (муваққатӣ, на 5xx)', async () => {
    groq = () => new Response('busy', { status: 429 });
    expect((await POST(post({ audio: wavB64() }))).status).toBe(424);
    groq = () => new Response('boom', { status: 500 });
    expect((await POST(post({ audio: wavB64() }))).status).toBe(424);
  });
  it('аудио нест / WAV нест / хеле калон → 400', async () => {
    expect((await POST(post({}))).status).toBe(400);
    expect((await POST(post({ audio: Buffer.from('not a wav'.repeat(1000)).toString('base64') }))).status).toBe(400);
    expect((await POST(post({ audio: wavB64(40000) }))).status).toBe(400); // 40с > 1МБ
  });
  it('ҳад: аз WHISPER_MAX_PER_WINDOW зиёд → 429', async () => {
    for (let i = 0; i < WHISPER_MAX_PER_WINDOW; i++) {
      expect((await POST(post({ audio: wavB64() }))).status).toBe(200);
    }
    expect((await POST(post({ audio: wavB64() }))).status).toBe(429);
  });
  it('бе токен → 401', async () => {
    authed = false;
    expect((await POST(post({ audio: wavB64() }))).status).toBe(401);
  });
});
