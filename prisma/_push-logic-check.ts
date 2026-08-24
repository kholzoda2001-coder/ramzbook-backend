/**
 * Санҷиши МАНТИҚИ ҷадвали push — бе база, бе Firebase, бе шабака.
 *
 * Чаро лозим: тамоми «дақиқ ба одами дақиқ» ба се ҳисоби пок такя мекунад —
 * (1) оё вақти кампания расид, (2) то дедлайн чанд вақт монд, (3) филтри
 * сегмент чӣ шакл дорад. Инҳо тоза функсияанд, пас метавон онҳоро бе хароҷот
 * бо ҳар вазъият санҷид — ва маҳз ҳамин ҷо хатоҳои минтақаи вақт пинҳон мешаванд.
 *
 * Иҷро:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' prisma/_push-logic-check.ts
 */
import { isDue } from '../lib/pushRunner';
import { minutesUntilLocalHour, formatCountdown } from '../lib/pushTemplate';
import { buildWhere, localDayStart } from '../lib/pushSegments';
import type { PushCampaign } from '@prisma/client';

let pass = 0;
let fail = 0;

function check(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}\n      интизор: ${JSON.stringify(want)}\n      воқеӣ:   ${JSON.stringify(got)}`); }
}

/** Лаҳзаи UTC барои вақти МАҲАЛЛИИ Душанбе (UTC+5). */
function tj(y: number, m: number, d: number, h: number, min = 0): Date {
  return new Date(Date.UTC(y, m - 1, d, h - 5, min));
}

function campaign(over: Partial<PushCampaign> = {}): PushCampaign {
  return {
    id: 'c1', name: 'тест', kind: 'scheduled', isActive: true,
    hour: 19, minute: 0, tzOffsetMin: 300, weekdays: null,
    langs: null, tier: null, studiedToday: null,
    minStreak: null, maxStreak: null, minInactiveDays: null, maxInactiveDays: null,
    levels: null, countries: null, friendStreak: null, wager: null,
    texts: {}, route: 'lesson', countdownToHour: null,
    priority: 0, cooldownHours: 20, lastRunAt: null, lastRunSent: 0,
    createdAt: new Date(), updatedAt: new Date(),
    ...over,
  } as PushCampaign;
}

console.log('\n1. isDue — оё вақти кампания расид (19:00 бо соати Душанбе)');
{
  const c = campaign({ hour: 19, minute: 0 });
  check('18:55 — ҳанӯз барвақт', isDue(c, tj(2026, 8, 24, 18, 55)), false);
  check('19:00 — маҳз вақташ', isDue(c, tj(2026, 8, 24, 19, 0)), true);
  check('20:00 — дар тирезаи 90-дақиқа', isDue(c, tj(2026, 8, 24, 20, 0)), true);
  check('20:31 — тиреза гузашт, дигар не', isDue(c, tj(2026, 8, 24, 20, 31)), false);
  check('хомӯш → ҳеҷ гоҳ', isDue(campaign({ isActive: false }), tj(2026, 8, 24, 19, 5)), false);
  check(
    'имрӯз аллакай давид → такрор не',
    isDue(campaign({ lastRunAt: tj(2026, 8, 24, 19, 2) }), tj(2026, 8, 24, 19, 30)),
    false,
  );
  check(
    'дирӯз давид → имрӯз боз мешавад',
    isDue(campaign({ lastRunAt: tj(2026, 8, 23, 19, 2) }), tj(2026, 8, 24, 19, 5)),
    true,
  );
  // Марзи хатарнок: соати 02:00 маҳаллӣ ҳанӯз «дирӯз»-и UTC аст.
  check(
    'дирӯз соати 23:xx давид → имрӯз 19:00 боз мешавад',
    isDue(campaign({ lastRunAt: tj(2026, 8, 23, 23, 40) }), tj(2026, 8, 24, 19, 5)),
    true,
  );
}

console.log('\n2. weekdays — танҳо рӯзҳои интихобшуда');
{
  // 2026-08-24 = Душанбе (1). Танҳо рӯзҳои корӣ.
  const c = campaign({ weekdays: '1,2,3,4,5' });
  check('Душанбе — ҳа', isDue(c, tj(2026, 8, 24, 19, 5)), true);
  check('Шанбе — не', isDue(c, tj(2026, 8, 29, 19, 5)), false);
  check('Якшанбе — не', isDue(c, tj(2026, 8, 30, 19, 5)), false);
}

console.log('\n3. {countdown} — то дедлайни ВОҚЕИИ силсила (05:00 маҳаллӣ = 00:00 UTC)');
{
  const now = tj(2026, 8, 24, 21, 30); // огоҳии қавӣ маҳз ҳамин вақт меравад
  check('соати 29 → 7 соату 30 дақиқа', minutesUntilLocalHour(now, 300, 29), 450);
  check('матни тоҷикӣ', formatCountdown(450, 'tg'), '7 соату 30 дақиқа');
  check('матни русӣ', formatCountdown(450, 'ru'), '7 ч 30 мин');
  check('матни англисӣ', formatCountdown(450, 'en'), '7h 30m');
  // Хатои кӯҳна: 24 = нимишаби маҳаллӣ → «2 соат монд», дар ҳоле ки корбар
  // воқеан 7.5 соат дошт. Ҳамин фарқро сабт мекунем, то дубора барнагардад.
  check('соати 24 (кӯҳна) — 2 соат, яъне ДУРӮҒ', minutesUntilLocalHour(now, 300, 24), 150);
  // Муҳоҷир дар Маскав (UTC+3): ҳамон лаҳза барои ӯ 19:30 аст.
  check('Маскав, ҳамон лаҳза → 9 соату 30 дақиқа', minutesUntilLocalHour(now, 180, 29), 570);
}

console.log('\n4. Марзи «имрӯз» бо вақти маҳаллӣ');
{
  // Нимишаби Душанбе 24-ум = 19:00 UTC 23-юм.
  check(
    'оғози рӯзи маҳаллӣ',
    localDayStart(tj(2026, 8, 24, 21, 30), 300).toISOString(),
    '2026-08-23T19:00:00.000Z',
  );
}

console.log('\n5. buildWhere — филтрҳои нави дӯст/гарав');
{
  const w: any = buildWhere({ friendStreak: 'yes' }, 300, tj(2026, 8, 24, 19, 0));
  check('ҳамеша: танҳо корбари дорои token', w.deviceTokens, { some: {} });
  check('ҳамеша: танҳо огоҳии фаъол', w.pushEnabled, true);
  check('дӯст: ҳар ду тарафи ҷуфт санҷида мешавад', w.AND?.[0]?.OR?.length, 2);

  const wn: any = buildWhere({ wager: 'no' }, 300, tj(2026, 8, 24, 19, 0));
  check('гарав=no → NOT', !!wn.AND?.[0]?.NOT, true);

}

console.log('\n6. studiedToday — ҲАР ДУ сигнали фаъолият санҷида мешавад');
{
  const noon = tj(2026, 8, 24, 21, 30);
  const dayStart = '2026-08-23T19:00:00.000Z';

  const no: any = buildWhere({ studiedToday: 'no' }, 300, noon);
  const noBlock = no.AND?.[0]?.AND;
  check('«нахондааст» ду шарт мегузорад (lastStudyAt + lastActiveDate)', noBlock?.length, 2);
  check(
    'сигнали 1: такрор/SRS (lastStudyAt), null ҳам ҳисоб мешавад',
    noBlock?.[0]?.OR,
    [{ lastStudyAt: null }, { lastStudyAt: { lt: new Date(dayStart) } }],
  );
  check(
    'сигнали 2: хатми аввалин (lastActiveDate)',
    noBlock?.[1]?.OR,
    [{ lastActiveDate: null }, { lastActiveDate: { lt: new Date(dayStart) } }],
  );

  const yes: any = buildWhere({ studiedToday: 'yes' }, 300, noon);
  check(
    '«хондааст» = кофист ЯКЕ аз ду сигнал',
    yes.AND?.[0]?.OR,
    [{ lastStudyAt: { gte: new Date(dayStart) } }, { lastActiveDate: { gte: new Date(dayStart) } }],
  );

  // Ду филтр ҳамзамон набояд ҳамдигарро пахш кунанд.
  const both: any = buildWhere({ studiedToday: 'no', wager: 'yes' }, 300, noon);
  check('studiedToday + wager ҳарду мемонанд', both.AND?.length, 2);
}

console.log(`\n${fail === 0 ? '✅' : '❌'}  ${pass} санҷиш гузашт, ${fail} афтод\n`);
process.exit(fail === 0 ? 0 : 1);
