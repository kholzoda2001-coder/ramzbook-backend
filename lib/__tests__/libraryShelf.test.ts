import { describe, expect, it } from 'vitest';
import {
  LIBRARY_API_HEADER,
  buildShelfItem,
  hasMediaUrl,
  resolveShelfMediaMode,
  type ShelfContext,
} from '../libraryShelf';

const NOW = Date.UTC(2026, 9, 18);
const DAY = 24 * 60 * 60 * 1000;

const baseRow = {
  id: 'i1',
  type: 'audio',
  title: 'Аудио',
  mediaUrl: 'https://cdn.example/a.mp3' as string | null,
  priceTjs: 25,
  isPremium: true,
  order: 3,
  createdAt: new Date(NOW - 2 * DAY),
  _count: { pages: 12 },
};

const row = (over: Partial<typeof baseRow> = {}): typeof baseRow => ({
  ...baseRow,
  ...over,
});

const ctx = (over: Partial<ShelfContext> = {}): ShelfContext => ({
  open: new Set<string>(),
  owned: new Set<string>(),
  newCutoff: NOW - 21 * DAY,
  mode: 'legacy',
  ...over,
});

describe('resolveShelfMediaMode', () => {
  it('пешфарз — legacy (барномаи кӯҳна нашикананд)', () => {
    expect(resolveShelfMediaMode({})).toBe('legacy');
    expect(resolveShelfMediaMode({ query: '', header: '', env: '' })).toBe('legacy');
    expect(resolveShelfMediaMode({ query: null, header: null, env: undefined })).toBe('legacy');
  });

  it('?media=gated → strict (бе ҳисоби ҳарф)', () => {
    expect(resolveShelfMediaMode({ query: 'gated' })).toBe('strict');
    expect(resolveShelfMediaMode({ query: ' GATED ' })).toBe('strict');
    expect(resolveShelfMediaMode({ query: 'all' })).toBe('legacy');
  });

  it('сарлавҳаи x-ramz-library-api ≥ 2 → strict', () => {
    expect(LIBRARY_API_HEADER).toBe('x-ramz-library-api');
    expect(resolveShelfMediaMode({ header: '2' })).toBe('strict');
    expect(resolveShelfMediaMode({ header: '3' })).toBe('strict');
    expect(resolveShelfMediaMode({ header: '1' })).toBe('legacy');
    expect(resolveShelfMediaMode({ header: 'abc' })).toBe('legacy');
  });

  it('LIBRARY_STRIP_LOCKED_MEDIA=1 → ҳама strict', () => {
    expect(resolveShelfMediaMode({ env: '1' })).toBe('strict');
    expect(resolveShelfMediaMode({ env: ' 1 ' })).toBe('strict');
    expect(resolveShelfMediaMode({ env: '0' })).toBe('legacy');
    expect(resolveShelfMediaMode({ env: 'true' })).toBe('legacy');
  });
});

describe('hasMediaUrl', () => {
  it('фақат пайванди ҳақиқӣ ҳисоб мешавад', () => {
    expect(hasMediaUrl('https://x/y')).toBe(true);
    expect(hasMediaUrl('')).toBe(false);
    expect(hasMediaUrl('   ')).toBe(false);
    expect(hasMediaUrl(null)).toBe(false);
    expect(hasMediaUrl(undefined)).toBe(false);
  });
});

describe('buildShelfItem — legacy (рафтори пештара бетағйир)', () => {
  it('воҳиди қулф HАМОН mediaUrl-ро мегирад (барномаи кӯҳна ба он такя мекунад)', () => {
    const it = buildShelfItem(row(), ctx());
    expect(it.locked).toBe(true);
    expect(it.mediaUrl).toBe('https://cdn.example/a.mp3');
    expect(it.hasMedia).toBe(true);
  });

  it('майдонҳои пештара ҳамон: pageCount, isNew, locked, owned; order/createdAt/_count нест', () => {
    const it = buildShelfItem(row(), ctx({ open: new Set(['i1']), owned: new Set(['i1']) }));
    expect(it).toMatchObject({
      id: 'i1',
      type: 'audio',
      title: 'Аудио',
      priceTjs: 25,
      isPremium: true,
      pageCount: 12,
      isNew: true,
      locked: false,
      owned: true,
    });
    const keys = Object.keys(it);
    for (const gone of ['order', 'createdAt', '_count']) {
      expect(keys).not.toContain(gone);
    }
    // Ягона майдони ИЛОВАШУДА:
    expect(keys).toContain('hasMedia');
  });

  it('isNew: сархади 21 рӯз', () => {
    const old = buildShelfItem(row({ createdAt: new Date(NOW - 22 * DAY) }), ctx());
    const fresh = buildShelfItem(row({ createdAt: new Date(NOW - 20 * DAY) }), ctx());
    expect(old.isNew).toBe(false);
    expect(fresh.isNew).toBe(true);
  });
});

describe('buildShelfItem — strict', () => {
  const strict = (c: Partial<ShelfContext> = {}) => ctx({ mode: 'strict', ...c });

  it('воҳиди ҚУЛФ: mediaUrl = null, вале hasMedia ҳақиқат аст', () => {
    const it = buildShelfItem(row(), strict());
    expect(it.locked).toBe(true);
    expect(it.mediaUrl).toBeNull();
    expect(it.hasMedia).toBe(true);
  });

  it('воҳиди кушода (ройгон / PRO) mediaUrl-ро нигоҳ медорад', () => {
    const it = buildShelfItem(row(), strict({ open: new Set(['i1']) }));
    expect(it.locked).toBe(false);
    expect(it.mediaUrl).toBe('https://cdn.example/a.mp3');
  });

  it('воҳиди ХАРИДАШУДА кушода аст ва mediaUrl-ро мегирад', () => {
    const it = buildShelfItem(row(), strict({ open: new Set(['i1']), owned: new Set(['i1']) }));
    expect(it.owned).toBe(true);
    expect(it.mediaUrl).toBe('https://cdn.example/a.mp3');
  });

  it('воҳиди бе файл: hasMedia = false дар ҳарду ҳолат', () => {
    for (const mode of ['legacy', 'strict'] as const) {
      const none = buildShelfItem(row({ mediaUrl: null }), ctx({ mode }));
      expect(none.hasMedia).toBe(false);
      expect(none.mediaUrl).toBeNull();
      const blank = buildShelfItem(row({ mediaUrl: '  ' }), ctx({ mode }));
      expect(blank.hasMedia).toBe(false);
    }
  });

  it('китоби САҲИФАДОР (бе mediaUrl) бетағйир: locked, pageCount мемонад', () => {
    const it = buildShelfItem(
      row({ type: 'book', mediaUrl: null, _count: { pages: 40 } }),
      strict(),
    );
    expect(it.locked).toBe(true);
    expect(it.pageCount).toBe(40);
    expect(it.mediaUrl).toBeNull();
    expect(it.hasMedia).toBe(false);
  });

  it('ягон воҳиди қулф ҳеҷ гоҳ пайванд намедиҳад (рафи пурра)', () => {
    const shelf = [
      row({ id: 'a', mediaUrl: 'https://cdn/a.mp3' }),
      row({ id: 'b', type: 'book', mediaUrl: 'https://cdn/b.epub' }),
      row({ id: 'c', type: 'video', mediaUrl: 'https://cdn/c.mp4' }),
      row({ id: 'd', mediaUrl: 'https://cdn/d.mp3' }),
    ];
    const c = strict({ open: new Set(['d']) });
    const out = shelf.map((r) => buildShelfItem(r, c));
    for (const it of out) {
      if (it.locked) expect(it.mediaUrl, it.id).toBeNull();
    }
    expect(out.find((i) => i.id === 'd')?.mediaUrl).toBe('https://cdn/d.mp3');
    // ҳеҷ пайванди қулфшуда дар ҷавоби сериализатсияшуда нест:
    const json = JSON.stringify(out);
    expect(json).not.toContain('a.mp3');
    expect(json).not.toContain('b.epub');
    expect(json).not.toContain('c.mp4');
  });
});
