/**
 * /api/mobile/speech/transcribe — рамзҳои ҷавоб (ҳеҷ 5xx барои «нест»), WAV,
 * ҳад. Groq ва база қалбакӣ.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let mode = '{"azure":"off"}';
vi.mock('@/lib/prisma', () => ({
  prisma: { appSetting: { findUnique: async () => ({ valueJson: mode }) } },
}));
let authed = true;
vi.mock('@/lib/auth', () => ({
  requireUserId: () => (authed ? 'u1' : null),
  unauthorized: () => new Response('no', { status: 401 }),
}));
vi.mock('@/lib/ai/ai-settings', () => ({
  loadAiSettingsConfig: async () => ({ apiKey: '', baseUrl: '' }),
}));

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/mobile/speech/transcribe/route';
import { _resetWhisperSlotsForTest, WHISPER_MAX_PER_WINDOW } from '../whisper';

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
  _resetWhisperSlotsForTest();
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

describe('POST', () => {
  it('муваффақият → {text, language}', async () => {
    const r = await POST(post({ audio: wavB64(), locale: 'en-US' }));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ text: 'I am fine', language: 'en' });
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
