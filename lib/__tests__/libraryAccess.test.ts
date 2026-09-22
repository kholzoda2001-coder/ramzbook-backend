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

describe('ҲУҚУҚИ тоқа (Entitlement)', () => {
  const shelf = [
    { id: 'a', type: 'book', isPremium: false, order: 0, createdAt: new Date(1) },
    { id: 'b', type: 'book', isPremium: true, order: 1, createdAt: new Date(2) },
    { id: 'c', type: 'audio', isPremium: true, order: 2, createdAt: new Date(3) },
  ];

  it('китоби харида кушода мешавад, БОҚӢ не', () => {
    // Маҳз ҳамин дархости соҳиби маҳсулот: «агар танҳо як китобро харид,
    // он танҳо ҳамон китоб комилан боз мешавад».
    expect(unlockedIds(shelf, false, ['b'])).toEqual(new Set(['a', 'b']));
    expect(unlockedIds(shelf, false, ['b']).has('c')).toBe(false);
  });

  it('аудио низ ҳамон тавр', () => {
    expect(unlockedIds(shelf, false, ['c'])).toEqual(new Set(['a', 'c']));
  });

  it('чанд воҳид якҷоя', () => {
    expect(unlockedIds(shelf, false, ['b', 'c'])).toEqual(new Set(['a', 'b', 'c']));
  });

  it('🔴 ҳуқуқ аз ОБУНА мустақил аст', () => {
    // Хонанда китоб харид → обуна шуд → обунаро бекор кард.
    // Китоби ПУЛ ДОДАИ ӯ бояд ҳамоно кушода бошад.
    const owned = ['b'];
    expect(unlockedIds(shelf, true, owned).has('b')).toBe(true);   // обунадор
    expect(unlockedIds(shelf, false, owned).has('b')).toBe(true);  // обуна тамом
  });

  it('ID-и бегона ҳеҷ чизро намекушояд', () => {
    // Сатри `Entitlement` барои воҳиди нестшуда набояд рафро вайрон кунад.
    expect(unlockedIds(shelf, false, ['zzz'])).toEqual(new Set(['a']));
  });

  it('бе ҳуқуқ рафтори КӮҲНА бетағйир мемонад', () => {
    // Аргументи сеюм ихтиёрист — ҳамаи даъватгарони кӯҳна бояд кор кунанд.
    expect(unlockedIds(shelf, false)).toEqual(new Set(['a']));
    expect(unlockedIds(shelf, false, [])).toEqual(new Set(['a']));
  });

  it('ҳуқуқ ба шумораи китоби РОЙГОНИ пейвол дахл надорад', () => {
    // Пейвол мегӯяд «N китоб ройгон». Китоби ХАРИДАИ як хонанда набояд ин
    // рақами умумиро тағйир диҳад — вагарна пейвол ба ҳама дурӯғ мегӯяд.
    expect(freeBookCount(shelf)).toBe(1);
  });
});
