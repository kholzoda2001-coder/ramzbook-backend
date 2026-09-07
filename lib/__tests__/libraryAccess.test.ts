import { describe, expect, it } from 'vitest';
import {
  FREE_BOOK_QUOTA,
  FREE_PREVIEW_PAGES,
  canPreviewPages,
  freeBookCount,
  freeItemIds,
  unlockedIds,
} from '../libraryAccess';

const book = (over: Partial<Parameters<typeof canPreviewPages>[0]> = {}) => ({
  type: 'book',
  mediaUrl: null as string | null,
  ...over,
});

describe('canPreviewPages', () => {
  it('китоби САҲИФАДОР пешнамоиш дорад', () => {
    expect(canPreviewPages(book())).toBe(true);
    expect(canPreviewPages(book({ mediaUrl: '' }))).toBe(true);
    expect(canPreviewPages(book({ mediaUrl: '   ' }))).toBe(true);
  });

  it('EPUB пешнамоиш НАДОРАД', () => {
    // Дар EPUB «саҳифа» сутуни экран аст ва рақами устувор надорад: дар
    // телефони калон 3, дар хурд 8. «5 саҳифаи аввал» маъно намедиҳад.
    expect(canPreviewPages(book({ mediaUrl: 'https://x/y.epub' }))).toBe(false);
  });

  it('аудио, видео ва шаблон пешнамоиш НАДОРАНД', () => {
    // Дархости сареҳи соҳиби маҳсулот: «ягон саҳифа ё ягон минуташ ройгон
    // набошад».
    for (const t of ['audio', 'video', 'template']) {
      expect(canPreviewPages({ type: t, mediaUrl: null })).toBe(false);
      expect(canPreviewPages({ type: t, mediaUrl: 'u' })).toBe(false);
    }
  });

  it('`mediaUrl`-и нобуда ҳамчун холӣ ҳисоб мешавад', () => {
    expect(canPreviewPages({ type: 'book' })).toBe(true);
  });
});

describe('FREE_PREVIEW_PAGES', () => {
  it('панҷ аст', () => {
    // ⚠️ Ин рақам дар ДУ ҷо зиндагӣ мекунад: ин ҷо ва `kFreePreviewPages`-и
    // барнома. Агар яке иваз шавад ва дигаре не, хонанда матни «боз N
    // саҳифа мондааст»-и нодурустро мебинад. Тарафи Flutter ҳамин рақамро
    // қулф мекунад.
    expect(FREE_PREVIEW_PAGES).toBe(5);
  });

  it('мусбат аст', () => {
    // `slice(0, 0)` пешнамоиши холӣ медод — экрани «мазмун нест», ҳамон
    // боге, ки ислоҳ карда шуд.
    expect(FREE_PREVIEW_PAGES).toBeGreaterThan(0);
  });
});

describe('unlockedIds — қоида тағйир НАЁФТ', () => {
  const shelf = [
    { id: 'a', type: 'book', isPremium: false, order: 0, createdAt: new Date(1) },
    { id: 'b', type: 'book', isPremium: true, order: 1, createdAt: new Date(2) },
    { id: 'c', type: 'audio', isPremium: true, order: 2, createdAt: new Date(3) },
  ];

  it('премиум ҳама чизро мекушояд', () => {
    expect(unlockedIds(shelf, true)).toEqual(new Set(['a', 'b', 'c']));
  });

  it('корбари ройгон танҳо воҳиди бе парчами Premium', () => {
    expect(unlockedIds(shelf, false)).toEqual(new Set(['a']));
  });

  it('квота 0 аст — парчами админ ягона ҳақиқат', () => {
    expect(FREE_BOOK_QUOTA).toBe(0);
    expect(freeItemIds(shelf)).toEqual(new Set(['a']));
    expect(freeBookCount(shelf)).toBe(1);
  });

  it('пешнамоиш ба ДАСТРАСӢ дахл надорад', () => {
    // Китоби қулф қулф мемонад — пешнамоиш танҳо тарзи ҶАВОБ аст, на
    // иҷозат. Вагарна `unlockedIds` девори ягонаи худро гум мекард.
    expect(unlockedIds(shelf, false).has('b')).toBe(false);
    expect(canPreviewPages({ type: 'book', mediaUrl: null })).toBe(true);
  });
});
