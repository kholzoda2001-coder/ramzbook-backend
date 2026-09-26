/**
 * «Гуфтори рӯз» (26.09.2026): ёдрасон бо ибораи ХУДИ хонанда.
 *
 * Қулф мекунад:
 *   • {phrase}/{phrase_tr} пур мешаванд;
 *   • бе ибора паём НАМЕРАВАД (на «бигӯед: «»»);
 *   • ибора 2–6 калима, бо тарҷума, бе «___»; дар як рӯз ҳамон, рӯзи дигар дигар;
 *   • сегменти `speaking` ба Prisma дуруст табдил мешавад;
 *   • ёдрасони нарм ва «Гуфтори рӯз» якдигарро истисно мекунанд (лимити 2/рӯз).
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('../prisma', () => ({ prisma: {} }));

import { renderCampaignText } from '../pushTemplate';
import { pickDailyPhrase, type LearnerContext } from '../pushMessages';
import { buildWhere } from '../pushSegments';
import { DEFAULT_CAMPAIGNS, SPEAKING_DAILY } from '../pushDefaults';

const ctx = (over: Partial<LearnerContext> = {}): LearnerContext => ({
  userId: 'u1',
  firstName: 'Алишер',
  lang: 'tg',
  streak: 3,
  longestStreak: 5,
  hearts: 5,
  maxHearts: 5,
  gems: 0,
  level: 'A1',
  daysInactive: 0,
  tzOffsetMin: 300,
  ...over,
});

describe('матни «Гуфтори рӯз»', () => {
  it('ибора ва тарҷума пур мешаванд', () => {
    const m = renderCampaignText(
      SPEAKING_DAILY,
      ctx({ phrase: 'Где аптека?', phraseTr: 'Дорухона куҷост?' }),
    )!;
    expect(m.title).toBe('🗣 Алишер, имрӯз инро бигӯед');
    expect(m.body).toBe(
      '«Где аптека?» (Дорухона куҷост?) — 3 дақиқа гуфтор, ва ин ибора аз они шумост.',
    );
    // Аломати дучанд («?.») нест.
    expect(m.body).not.toMatch(/[?!.]\./);
  });

  it('бе ибора — паём нест', () => {
    expect(renderCampaignText(SPEAKING_DAILY, ctx())).toBeNull();
  });

  it('шаблони бе {phrase} ба ибора вобаста нест', () => {
    const m = renderCampaignText({ tg: { title: 'Салом {name}', body: 'x' } }, ctx());
    expect(m?.title).toBe('Салом Алишер');
  });

  it('русӣ бо забони интерфейс', () => {
    const m = renderCampaignText(
      SPEAKING_DAILY,
      ctx({ lang: 'ru', phrase: 'Сколько стоит?', phraseTr: 'Чанд пул?' }),
    )!;
    expect(m.body.startsWith('«Сколько стоит?» (Чанд пул?) — 3 минуты')).toBe(true);
  });
});

describe('pickDailyPhrase', () => {
  const items = [
    { text: 'Врач', translation: 'Духтур' },
    { text: 'Меня зовут ___.', translation: 'Номи ман ___.' },
    { text: 'Где аптека?', translation: 'Дорухона куҷост?' },
    { text: 'У меня болит голова.', translation: 'Сарам дард мекунад.' },
    { text: 'Нет', translation: '' },
    { text: 'Я не понимаю, что вы сейчас говорите мне.', translation: 'Дароз' },
  ];

  it('танҳо 2–6 калима, бо тарҷума, бе қолаб', () => {
    const seen = new Set<string>();
    for (let d = 0; d < 10; d++) {
      const p = pickDailyPhrase(items, new Date(d * 86_400_000));
      seen.add(p!.text);
    }
    expect(Array.from(seen).sort()).toEqual(['Где аптека?', 'У меня болит голова.']);
  });

  it('дар як рӯз ҳамон ибора', () => {
    const a = pickDailyPhrase(items, new Date(Date.UTC(2026, 8, 26, 3)));
    const b = pickDailyPhrase(items, new Date(Date.UTC(2026, 8, 26, 20)));
    expect(a).toEqual(b);
  });

  it('ибораи мувофиқ нест → null', () => {
    expect(pickDailyPhrase([{ text: 'Врач', translation: 'Духтур' }])).toBeNull();
  });
});

describe('сегменти «speaking»', () => {
  const now = new Date(Date.UTC(2026, 8, 26, 14));

  it('yes → дарси гуфтор дар 30 рӯз; no → НЕ', () => {
    const yes = buildWhere({ speaking: 'yes' }, 300, now);
    const no = buildWhere({ speaking: 'no' }, 300, now);
    const since = new Date(now.getTime() - 30 * 86_400_000);
    expect(yes.AND).toContainEqual({
      speakingProgress: { some: { completedAt: { gte: since } } },
    });
    expect(no.AND).toContainEqual({
      NOT: { speakingProgress: { some: { completedAt: { gte: since } } } },
    });
    expect(buildWhere({}, 300, now).AND).toBeUndefined();
  });
});

describe('кампанияҳои оғозӣ', () => {
  it('«Гуфтори рӯз» ва ёдрасони нарми 19:00 якдигарро истисно мекунанд', () => {
    const daily = DEFAULT_CAMPAIGNS.find((c) => c.name === 'Гуфтори рӯз 19:00')!;
    expect(daily.speaking).toBe('yes');
    expect(daily.route).toBe('speaking');
    const softs = DEFAULT_CAMPAIGNS.filter((c) => c.name.startsWith('Ёдрасони нарм 19:00'));
    expect(softs.length).toBe(2);
    for (const s of softs) expect(s.speaking).toBe('no');
  });
});
