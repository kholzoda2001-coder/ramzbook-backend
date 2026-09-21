/**
 * Филтрҳои /admin/users — қулфи ҳар хатое, ки аудити 21.09.2026 ёфт.
 *
 *   node_modules/.bin/vitest run lib/admin/__tests__/userFilters.test.ts
 */
import { describe, it, expect } from 'vitest';
import {
  type AdminUserRow, type UserFilters, EMPTY_FILTERS,
  matchesFilters, sortUsers, allTargetLangs, allLevels, userLangs, userLevel,
} from '../userFilters';

const NOW = new Date('2026-09-21T09:00:00.000Z'); // 14:00 дар Душанбе

function u(over: Partial<AdminUserRow> = {}): AdminUserRow {
  return {
    id: 'u1', name: 'Ali', email: 'ali@mail.tj', phone: null,
    isActive: true, isPremium: false, premiumPlan: null,
    totalXp: 100, streak: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastActiveAt: '2026-09-21T05:00:00.000Z',
    interfaceLang: 'tg', targetLang: null, level: 'A1',
    langs: [], studyLevel: null, isTest: false,
    ...over,
  };
}
const f = (over: Partial<UserFilters> = {}): UserFilters => ({ ...EMPTY_FILTERS, ...over });

describe('Забони омӯзишӣ', () => {
  it('корбари бе targetLang вале бо прогресс ЁФТ мешавад', () => {
    // 🔴 Маҳз ин хато буд: 79 корбар (яке бо 234 дарси англисӣ) дар филтри
    // `en` пайдо намешуданд, чунки `User.targetLang` дар база NULL аст.
    const user = u({ targetLang: null, langs: ['en'] });
    expect(matchesFilters(user, f({ targetLang: 'en' }), NOW)).toBe(true);
  });

  it('корбари ЧАНДЗАБОНА дар ҳар ду филтр пайдо мешавад', () => {
    const user = u({ targetLang: 'en', langs: ['en', 'ru'] });
    expect(matchesFilters(user, f({ targetLang: 'en' }), NOW)).toBe(true);
    expect(matchesFilters(user, f({ targetLang: 'ru' }), NOW)).toBe(true);
    expect(matchesFilters(user, f({ targetLang: 'de' }), NOW)).toBe(false);
  });

  it('targetLang-и танҳо (бе прогресс) ҳам ҳисоб мешавад', () => {
    expect(userLangs(u({ targetLang: 'ko', langs: [] }))).toEqual(['ko']);
  });

  it('рӯйхати dropdown ҳамаи забонҳоро мегирад, на танҳо targetLang', () => {
    const rows = [u({ id: 'a', targetLang: null, langs: ['en'] }),
                  u({ id: 'b', targetLang: 'ru', langs: ['ru', 'ar'] })];
    expect(allTargetLangs(rows)).toEqual(['ar', 'en', 'ru']);
  });
});

describe('Сатҳ', () => {
  it('сатҳи ВОҚЕИИ курс, на User.level-и ҳамеша-A1', () => {
    const user = u({ level: 'A1', studyLevel: 'B1' });
    expect(userLevel(user)).toBe('B1');
    expect(matchesFilters(user, f({ level: 'B1' }), NOW)).toBe(true);
    expect(matchesFilters(user, f({ level: 'A1' }), NOW)).toBe(false);
  });

  it('рӯйхат бо тартиби CEFR меояд', () => {
    const rows = [u({ studyLevel: 'B1' }), u({ studyLevel: 'A1' }), u({ studyLevel: 'A2' })];
    expect(allLevels(rows)).toEqual(['A1', 'A2', 'B1']);
  });
});

describe('Вақти фаъолият', () => {
  // 🟠 «Имрӯз» тирезаи гардони 24-соата буд: корбари дирӯз соати 20:00 фаъол
  // имрӯз соати 09:00 ҳанӯз «имрӯз» ҳисоб мешуд (13 ба ҷои 5).
  it('дирӯз шом «имрӯз» НЕСТ', () => {
    const yest = u({ lastActiveAt: '2026-09-20T17:00:00.000Z' }); // 22:00 Душанбе
    expect(matchesFilters(yest, f({ lastActive: 'today' }), NOW)).toBe(false);
    expect(matchesFilters(yest, f({ lastActive: '3days' }), NOW)).toBe(true);
  });

  it('имрӯз субҳи барвақт «имрӯз» аст', () => {
    const early = u({ lastActiveAt: '2026-09-20T19:30:00.000Z' }); // 00:30 Душанбе
    expect(matchesFilters(early, f({ lastActive: 'today' }), NOW)).toBe(true);
  });

  it('ҳеҷ гоҳ фаъол набуда = ҒАЙРИФАЪОЛ, на «ҳеҷ ҷо»', () => {
    const never = u({ lastActiveAt: null });
    expect(matchesFilters(never, f({ lastActive: 'inactive' }), NOW)).toBe(true);
    expect(matchesFilters(never, f({ lastActive: '30days' }), NOW)).toBe(false);
  });

  it('30 рӯз ва ғайрифаъол ҳамдигарро НАМЕПӮШОНАНД ва сӯрох намемонад', () => {
    for (const days of [0, 1, 29, 30, 31, 400]) {
      const user = u({ lastActiveAt: new Date(NOW.getTime() - days * 86400000).toISOString() });
      const inWindow = matchesFilters(user, f({ lastActive: '30days' }), NOW);
      const isOld = matchesFilters(user, f({ lastActive: 'inactive' }), NOW);
      expect(inWindow !== isOld).toBe(true);
    }
  });
});

describe('Обуна', () => {
  const promo = u({ isPremium: true, premiumPlan: 'promo' });
  const paid = u({ isPremium: true, premiumPlan: 'yearly' });
  const free = u({ isPremium: false, premiumPlan: null });

  it('«пулакӣ» проморо намегирад', () => {
    expect(matchesFilters(paid, f({ premium: 'paid' }), NOW)).toBe(true);
    expect(matchesFilters(promo, f({ premium: 'paid' }), NOW)).toBe(false);
  });
  it('«промо» пулакиро намегирад', () => {
    expect(matchesFilters(promo, f({ premium: 'promo' }), NOW)).toBe(true);
    expect(matchesFilters(paid, f({ premium: 'promo' }), NOW)).toBe(false);
  });
  it('«ҳама Premium» ҳар дуро мегирад, «ройгон» — ҳеҷ якеро', () => {
    expect(matchesFilters(promo, f({ premium: 'premium' }), NOW)).toBe(true);
    expect(matchesFilters(paid, f({ premium: 'premium' }), NOW)).toBe(true);
    expect(matchesFilters(free, f({ premium: 'free' }), NOW)).toBe(true);
    expect(matchesFilters(promo, f({ premium: 'free' }), NOW)).toBe(false);
  });
});

describe('Ҷустуҷӯ', () => {
  it('бо ID-и ҷадвал кор мекунад', () => {
    const user = u({ id: 'cmsdjztb6000011qpvhqydata' });
    expect(matchesFilters(user, f({ search: 'cmsdjztb6000' }), NOW)).toBe(true);
  });
  it('фосилаи тасодуфӣ ҷустуҷӯро намекушад', () => {
    expect(matchesFilters(u({ name: 'Ali' }), f({ search: '  ali ' }), NOW)).toBe(true);
  });
  it('телефон бо фосила ва «+» ёфт мешавад', () => {
    const user = u({ phone: '+992901234567', email: null });
    expect(matchesFilters(user, f({ search: '992 90 123 45 67' }), NOW)).toBe(true);
    expect(matchesFilters(user, f({ search: '901234567' }), NOW)).toBe(true);
  });
  it('почтаи сояи @ramzbook.tj ҳамчун телефон ёфт мешавад', () => {
    const user = u({ phone: null, email: '992555111222@ramzbook.tj' });
    expect(matchesFilters(user, f({ search: '555111222' }), NOW)).toBe(true);
  });
});

describe('Диапазонҳои рақамӣ', () => {
  it('0 ҳамчун ҳадди поён кор мекунад', () => {
    expect(matchesFilters(u({ totalXp: 0 }), f({ minXp: '0' }), NOW)).toBe(true);
    expect(matchesFilters(u({ totalXp: 5 }), f({ maxXp: '0' }), NOW)).toBe(false);
  });
  it('матни нодуруст ҳама сатрҳоро намекушад', () => {
    expect(matchesFilters(u({ totalXp: 100 }), f({ minXp: 'abc' }), NOW)).toBe(true);
  });
  it('стрик ҳам аз ва ҳам то', () => {
    expect(matchesFilters(u({ streak: 3 }), f({ minStreak: '1', maxStreak: '5' }), NOW)).toBe(true);
    expect(matchesFilters(u({ streak: 9 }), f({ minStreak: '1', maxStreak: '5' }), NOW)).toBe(false);
  });
});

describe('Намуди ҳисоб', () => {
  it('пешфарз танҳо воқеӣ', () => {
    expect(matchesFilters(u({ isTest: true }), f(), NOW)).toBe(false);
    expect(matchesFilters(u({ isTest: false }), f(), NOW)).toBe(true);
  });
  it('«ҳама» ҳар дуро мегирад', () => {
    expect(matchesFilters(u({ isTest: true }), f({ isTest: 'all' }), NOW)).toBe(true);
  });
});

describe('Мураттабсозӣ', () => {
  const rows = [
    u({ id: 'a', totalXp: 10, name: 'Вали', lastActiveAt: '2026-09-01T00:00:00.000Z' }),
    u({ id: 'b', totalXp: 90, name: 'Аброр', lastActiveAt: '2026-09-20T00:00:00.000Z' }),
  ];
  it('XP кам→зиёд ва баръакс', () => {
    expect(sortUsers(rows, 'totalXp-asc').map((x) => x.id)).toEqual(['a', 'b']);
    expect(sortUsers(rows, 'totalXp-desc').map((x) => x.id)).toEqual(['b', 'a']);
  });
  it('фаъолияти охирин ва ном', () => {
    expect(sortUsers(rows, 'lastActiveAt-desc').map((x) => x.id)).toEqual(['b', 'a']);
    expect(sortUsers(rows, 'name-asc').map((x) => x.id)).toEqual(['b', 'a']);
  });
  it('рӯйхати аслиро тағйир намедиҳад', () => {
    const copy = [...rows];
    sortUsers(rows, 'totalXp-desc');
    expect(rows).toEqual(copy);
  });
});

describe('Якҷоягии филтрҳо', () => {
  it('ҳамаи шартҳо ҲАМЗАМОН татбиқ мешаванд', () => {
    const user = u({
      targetLang: null, langs: ['tr'], studyLevel: 'A2',
      totalXp: 500, streak: 7, isPremium: true, premiumPlan: 'promo',
      lastActiveAt: '2026-09-21T04:00:00.000Z',
    });
    const ok = f({ targetLang: 'tr', level: 'A2', minXp: '100', maxXp: '1000',
                   minStreak: '5', premium: 'promo', lastActive: 'today' });
    expect(matchesFilters(user, ok, NOW)).toBe(true);
    expect(matchesFilters(user, { ...ok, level: 'B1' }, NOW)).toBe(false);
    expect(matchesFilters(user, { ...ok, premium: 'paid' }, NOW)).toBe(false);
  });
});
