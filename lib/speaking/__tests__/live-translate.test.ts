/**
 * Тарҷумаи паёми Рамз (22.10.2026): тозакунии дархост + роут (Google ва база қалбакӣ).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TRANSLATE_MAX_CHARS, cleanTranslateRequest } from '../live-translate';

describe('cleanTranslateRequest', () => {
  it('матн холӣ → empty', () => {
    expect(cleanTranslateRequest({ text: '  ' }, 'tg')).toEqual({ ok: false, reason: 'empty' });
    expect(cleanTranslateRequest({}, 'tg')).toEqual({ ok: false, reason: 'empty' });
    expect(cleanTranslateRequest({ text: 5 }, 'tg')).toEqual({ ok: false, reason: 'empty' });
  });
  it('аз ҳад дароз → too_long', () => {
    expect(cleanTranslateRequest({ text: 'a'.repeat(TRANSLATE_MAX_CHARS + 1) }, 'tg')).toEqual({
      ok: false,
      reason: 'too_long',
    });
    expect(cleanTranslateRequest({ text: 'a'.repeat(TRANSLATE_MAX_CHARS) }, 'tg').ok).toBe(true);
  });
  it('target: аввал барнома, баъд ҳисоб, баъд tg', () => {
    expect(cleanTranslateRequest({ text: 'Hi', target: 'ru' }, 'tg')).toMatchObject({ target: 'ru' });
    expect(cleanTranslateRequest({ text: 'Hi' }, 'uz')).toMatchObject({ target: 'uz' });
    expect(cleanTranslateRequest({ text: 'Hi' }, null)).toMatchObject({ target: 'tg' });
  });
  it('target-и ғалат нодида гирифта мешавад', () => {
    expect(cleanTranslateRequest({ text: 'Hi', target: 'tg; DROP' }, 'ru')).toMatchObject({ target: 'ru' });
    expect(cleanTranslateRequest({ text: 'Hi', target: 'x' }, null)).toMatchObject({ target: 'tg' });
  });
  it('source ихтиёрӣ', () => {
    expect(cleanTranslateRequest({ text: 'Hi', source: 'en-US' }, 'tg')).toMatchObject({ source: 'en-us' });
    expect(cleanTranslateRequest({ text: 'Hi', source: '??' }, 'tg')).not.toHaveProperty('source');
  });
});

let authed = true;
let nativeLang: string | null = 'tg';
vi.mock('@/lib/auth', () => ({
  requireUserId: () => (authed ? 'u1' : null),
  unauthorized: () => new Response('no', { status: 401 }),
}));
vi.mock('@/lib/prisma', () => ({
  prisma: { user: { findUnique: async () => ({ nativeLang }) } },
}));
let calls: unknown[][] = [];
let result: string[] | null = ['Салом!'];
vi.mock('@/lib/ai/translate', () => ({
  translateTexts: async (...a: unknown[]) => {
    calls.push(a);
    return result;
  },
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai/speaking/live/translate/route';

const call = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/ai/speaking/live/translate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

describe('/api/ai/speaking/live/translate', () => {
  beforeEach(() => {
    authed = true;
    nativeLang = 'tg';
    calls = [];
    result = ['Салом!'];
  });

  it('бе вуруд → 401', async () => {
    authed = false;
    expect((await call({ text: 'Hello' })).status).toBe(401);
    expect(calls).toHaveLength(0);
  });
  it('тарҷума + забонҳо ба Google мераванд', async () => {
    const r = await call({ text: 'Hello!', source: 'en', target: 'tg' });
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ translation: 'Салом!', target: 'tg' });
    expect(calls[0]).toEqual([['Hello!'], 'tg', 'en']);
  });
  it('target нест → забони модарии ҳисоб', async () => {
    nativeLang = 'ru';
    await call({ text: 'Hello!' });
    expect(calls[0][1]).toBe('ru');
  });
  it('матни холӣ ва дароз → 400, Google даъват намешавад', async () => {
    expect((await call({ text: '' })).status).toBe(400);
    expect((await call({ text: 'a'.repeat(501) })).status).toBe(400);
    expect(calls).toHaveLength(0);
  });
  it('Google дастнорас → 503', async () => {
    result = null;
    expect((await call({ text: 'Hello' })).status).toBe(503);
  });
});
