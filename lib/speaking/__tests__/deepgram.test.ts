/**
 * Deepgram (22.10.2026): функсияҳои софи сервер + роути токен (база ва Deepgram қалбакӣ).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEEPGRAM_DAILY_GRANTS,
  dailyGrantCap,
  deepgramLanguage,
  dushanbeDay,
  mintDeepgramToken,
  parseDeepgramMode,
} from '../deepgram';

describe('deepgramLanguage', () => {
  it('ҳар шаш забони мо', () => {
    for (const [loc, code] of [['ru-RU', 'ru'], ['en-US', 'en'], ['de-DE', 'de'], ['tr-TR', 'tr'], ['ko-KR', 'ko'], ['ar', 'ar'], ['ar-SA', 'ar']]) {
      expect(deepgramLanguage(loc)).toBe(code);
    }
  });
  it('забони дастнорас → null', () => {
    expect(deepgramLanguage('tg-TJ')).toBeNull();
    expect(deepgramLanguage('')).toBeNull();
    expect(deepgramLanguage(undefined)).toBeNull();
  });
});

describe('parseDeepgramMode / dailyGrantCap / dushanbeDay', () => {
  it('режим', () => {
    expect(parseDeepgramMode(null)).toBe('auto');
    expect(parseDeepgramMode('{"deepgram":"off"}')).toBe('off');
    expect(parseDeepgramMode('{"azure":"off"}')).toBe('auto');
    expect(parseDeepgramMode('not json')).toBe('auto');
  });
  it('ҳадди рӯзона аз муҳит, ғалат → пешфарз', () => {
    expect(dailyGrantCap('40')).toBe(40);
    expect(dailyGrantCap(undefined)).toBe(DEEPGRAM_DAILY_GRANTS);
    expect(dailyGrantCap('abc')).toBe(DEEPGRAM_DAILY_GRANTS);
    expect(dailyGrantCap('-3')).toBe(DEEPGRAM_DAILY_GRANTS);
  });
  it('рӯзи Душанбе: 20:00 UTC ҳанӯз ҳамон рӯз нест (UTC+5)', () => {
    expect(dushanbeDay(Date.UTC(2026, 9, 22, 18, 59))).toBe('2026-10-22');
    expect(dushanbeDay(Date.UTC(2026, 9, 22, 19, 1))).toBe('2026-10-23');
  });
});

describe('mintDeepgramToken', () => {
  const fake = (status: number, body: unknown) =>
    (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  it('муваффақ', async () => {
    expect(await mintDeepgramToken('k', fake(200, { access_token: 'jwt', expires_in: 90 }))).toEqual({
      ok: true, token: 'jwt', expiresIn: 90,
    });
  });
  it('401/402/403 → dead', async () => {
    for (const st of [401, 402, 403]) {
      expect(await mintDeepgramToken('k', fake(st, {}))).toMatchObject({ ok: false, dead: true });
    }
  });
  it('5xx ва ҷавоби бе токен → муваққатӣ', async () => {
    expect(await mintDeepgramToken('k', fake(500, {}))).toMatchObject({ ok: false, dead: false });
    expect(await mintDeepgramToken('k', fake(200, {}))).toMatchObject({ ok: false, dead: false });
  });
  it('калид дар сарлавҳа, ttl дар бадан', async () => {
    let seen: { headers?: HeadersInit; body?: BodyInit | null } = {};
    const f = (async (_u: unknown, init: RequestInit) => {
      seen = init;
      return new Response(JSON.stringify({ access_token: 'x' }), { status: 200 });
    }) as unknown as typeof fetch;
    await mintDeepgramToken('SECRET', f);
    expect((seen.headers as Record<string, string>).Authorization).toBe('Token SECRET');
    expect(JSON.parse(String(seen.body)).ttl_seconds).toBe(90);
  });
});

// ── Роут ────────────────────────────────────────────────────────────────────
let setting = '';
let count = 0;
vi.mock('@/lib/prisma', () => ({
  prisma: {
    appSetting: { findUnique: async () => (setting ? { valueJson: setting } : null) },
    speechGrant: {
      upsert: async () => {
        count++;
        return { count };
      },
    },
  },
}));
let authed = true;
vi.mock('@/lib/auth', () => ({
  requireUserId: () => (authed ? 'u1' : null),
  unauthorized: () => new Response('no', { status: 401 }),
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/mobile/speech/token/route';

const call = (body?: unknown) =>
  POST(
    new NextRequest('http://localhost/api/mobile/speech/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );

describe('/api/mobile/speech/token — Deepgram', () => {
  const realFetch = globalThis.fetch;
  beforeEach(() => {
    setting = '';
    count = 0;
    authed = true;
    delete process.env.AZURE_SPEECH_KEY;
    delete process.env.AZURE_SPEECH_REGION;
    process.env.DEEPGRAM_API_KEY = 'dg-key';
    delete process.env.DEEPGRAM_DAILY_GRANTS;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ access_token: 'jwt', expires_in: 90 }), { status: 200 })) as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    delete process.env.DEEPGRAM_API_KEY;
  });

  it('бе вуруд → 401', async () => {
    authed = false;
    expect((await call({ providers: ['deepgram'] })).status).toBe(401);
  });
  it('барномаи нав: токен + url + модел, КАЛИД ҳеҷ гоҳ дар ҷавоб нест', async () => {
    const r = await call({ providers: ['deepgram', 'azure'], locale: 'ru-RU' });
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j).toMatchObject({ provider: 'deepgram', token: 'jwt', model: 'nova-3', expiresIn: 90 });
    expect(j.url).toBe('wss://api.deepgram.com/v1/listen');
    expect(JSON.stringify(j)).not.toContain('dg-key');
  });
  it('нусхаи кӯҳна (бе providers) Deepgram намегирад → роҳи Azure (нест → 503)', async () => {
    const r = await call();
    expect(r.status).toBe(503);
  });
  it('режим off → 503, ҳисоб накарда', async () => {
    setting = '{"deepgram":"off"}';
    expect((await call({ providers: ['deepgram'], locale: 'en-US' })).status).toBe(503);
    expect(count).toBe(0);
  });
  it('забони дастнорас (тоҷикӣ) → 503', async () => {
    expect((await call({ providers: ['deepgram'], locale: 'tg-TJ' })).status).toBe(503);
  });
  it('ҳадди рӯзона: баъди ҳад → 503', async () => {
    process.env.DEEPGRAM_DAILY_GRANTS = '2';
    expect((await call({ providers: ['deepgram'], locale: 'en-US' })).status).toBe(200);
    expect((await call({ providers: ['deepgram'], locale: 'en-US' })).status).toBe(200);
    const r = await call({ providers: ['deepgram'], locale: 'en-US' });
    expect(r.status).toBe(503);
    expect((await r.json()).error).toBe('daily-cap');
  });
  it('калиди Deepgram мурда (401) → 503; хатои муваққатӣ → 502', async () => {
    globalThis.fetch = (async () => new Response('{}', { status: 401 })) as typeof fetch;
    expect((await call({ providers: ['deepgram'], locale: 'en-US' })).status).toBe(503);
    globalThis.fetch = (async () => new Response('{}', { status: 500 })) as typeof fetch;
    expect((await call({ providers: ['deepgram'], locale: 'en-US' })).status).toBe(502);
  });
});
