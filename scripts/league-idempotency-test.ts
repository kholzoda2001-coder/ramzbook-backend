/**
 * Санҷиши идемпотентии бастани ҳафтаи лига.
 *
 * Иҷро:
 *   npx ts-node --compiler-options "{\"module\":\"commonjs\"}" scripts/league-idempotency-test.ts
 *
 * Савол: «оё иҷрои ДУБОРАИ кори ҳафтагӣ касеро ду зина боло мебарорад?»
 *
 * Ҷавоб дар се қабат санҷида мешавад — маҳз ҳамон се муҳофизате, ки
 * `lib/league.ts` эълон мекунад:
 *   1. `League.rolledOverAt` — иҷрои дуюм когортаро мегузаронад;
 *   2. `@@unique([userId, weekKey])` дар `LeagueResult`;
 *   3. `newTier` функсияи СОФ аст, на зиёдкунӣ.
 *
 * Базаи воқеӣ лозим нест: `closeLeague` мизоҷи танги худро ҳамчун параметр
 * мегирад, пас ин ҷо як Prisma-и қалбакии дар ХОТИРА гузошта мешавад.
 */

import {
  closeLeague,
  outcomeFor,
  rankAndDecide,
  zonesFor,
  weekKeyFor,
  GEMS_BY_OUTCOME,
  type LeagueDb,
} from '../lib/league';

let failures = 0;
function check(label: string, cond: boolean, detail = '') {
  if (cond) {
    console.log(`  ✔ ${label}`);
  } else {
    failures++;
    console.log(`  ✘ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}
function eq(label: string, actual: unknown, expected: unknown) {
  check(label, JSON.stringify(actual) === JSON.stringify(expected),
    `intizor ${JSON.stringify(expected)}, omad ${JSON.stringify(actual)}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Prisma-и қалбакӣ — танҳо он чизе, ки `closeLeague` истифода мебарад.
// ─────────────────────────────────────────────────────────────────────────────

type FakeLeague = { id: string; tier: number; weekKey: string; rolledOverAt: Date | null };
type FakeMember = { userId: string; weeklyXp: number; joinedAt: Date; id: string };
type FakeResult = Record<string, unknown> & { userId: string; weekKey: string };
type FakeUser = { id: string; leagueTier: number; weeklyXp: number };

function makeDb(league: FakeLeague, members: FakeMember[], users: FakeUser[]) {
  const results: FakeResult[] = [];
  const store = { league, members, users, results, resultCreateCalls: 0, userUpdateCalls: 0 };

  const db = {
    league: {
      findUnique: async ({ where }: any) =>
        where.id === store.league.id ? { ...store.league } : null,
      findMany: async () => [],
      updateMany: async ({ where, data }: any) => {
        // Ҳамон семантикаи Prisma: шарт мувофиқ наояд → 0 сатр.
        if (where.id !== store.league.id) return { count: 0 };
        if (where.rolledOverAt === null && store.league.rolledOverAt !== null) {
          return { count: 0 };
        }
        store.league.rolledOverAt = data.rolledOverAt;
        return { count: 1 };
      },
    },
    leagueMember: {
      findMany: async () =>
        [...store.members].sort(
          (a, b) =>
            b.weeklyXp - a.weeklyXp ||
            a.joinedAt.getTime() - b.joinedAt.getTime() ||
            a.id.localeCompare(b.id),
        ),
    },
    leagueResult: {
      createMany: async ({ data, skipDuplicates }: any) => {
        store.resultCreateCalls++;
        let count = 0;
        for (const row of data as FakeResult[]) {
          const dup = store.results.some(
            (r) => r.userId === row.userId && r.weekKey === row.weekKey,
          );
          // `@@unique([userId, weekKey])` — муҳофизати №2.
          if (dup) {
            if (skipDuplicates) continue;
            throw Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
          }
          store.results.push({ ...row });
          count++;
        }
        return { count };
      },
    },
    user: {
      update: async ({ where, data }: any) => {
        store.userUpdateCalls++;
        const u = store.users.find((x) => x.id === where.id);
        if (!u) throw new Error('no user');
        // ⚠️ Танҳо `set` дастгирӣ мешавад. Агар коди истеҳсолӣ рӯзе ба
        // `increment` иваз шавад, ин ҷо ФАВРАН мепартояд — маҳз ҳамон боге,
        // ки тест бояд бигирад.
        if (data.leagueTier && 'increment' in data.leagueTier) {
          throw new Error('leagueTier bo `increment` navishta shud — idempotentī vayron ast');
        }
        if (data.leagueTier?.set != null) u.leagueTier = data.leagueTier.set;
        if (data.weeklyXp?.set != null) u.weeklyXp = data.weeklyXp.set;
        return u;
      },
    },
    $transaction: async (fn: any) => fn(db),
  };

  return { db: db as unknown as LeagueDb, store };
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const weekKey = weekKeyFor(new Date('2026-08-26T12:00:00Z')); // → чоршанбе → ҳафтаи 22-юм

  console.log('\n① Марзи ҳафта — шанбе 00:00 UTC');
  eq('чоршанбе 2026-08-26 → ҳафтаи шанбеи 2026-08-22', weekKey, '2026-08-22');
  eq('худи шанбе 2026-08-29 → ҳафтаи худаш',
    weekKeyFor(new Date('2026-08-29T00:00:00Z')), '2026-08-29');
  eq('ҷумъа 2026-08-28 23:59 → ҳанӯз ҳафтаи гузашта',
    weekKeyFor(new Date('2026-08-28T23:59:59Z')), '2026-08-22');

  console.log('\n② Минтақаҳо — когортаи пурра ва хурд');
  eq('30 нафар → 10 боло / 5 поён', zonesFor(30), { promote: 10, demote: 5 });
  eq('12 нафар → 4 боло / 2 поён', zonesFor(12), { promote: 4, demote: 2 });
  eq('3 нафар → 1 боло / 0 поён', zonesFor(3), { promote: 1, demote: 0 });
  eq('2 нафар → касе намеравад', zonesFor(2), { promote: 0, demote: 0 });
  eq('1 нафар → касе намеравад', zonesFor(1), { promote: 0, demote: 0 });
  check('минтақаҳо ҳеҷ гоҳ бо ҳам намебуранд',
    Array.from({ length: 40 }, (_, i) => i + 1)
      .every((n) => { const z = zonesFor(n); return z.promote + z.demote <= n; }));

  console.log('\n③ Ҳудуд — касе маҳз дар хатти буриш');
  eq('ҷои 10 дар 30 → боло', outcomeFor(10, 2, 30), { outcome: 'promoted', newTier: 3 });
  eq('ҷои 11 дар 30 → мемонад', outcomeFor(11, 2, 30), { outcome: 'stayed', newTier: 2 });
  eq('ҷои 25 дар 30 → мемонад', outcomeFor(25, 2, 30), { outcome: 'stayed', newTier: 2 });
  eq('ҷои 26 дар 30 → поён', outcomeFor(26, 2, 30), { outcome: 'demoted', newTier: 1 });
  eq('бронза поёнтар намеравад', outcomeFor(30, 1, 30), { outcome: 'stayed', newTier: 1 });
  eq('алмос болотар намеравад', outcomeFor(1, 5, 30), { outcome: 'stayed', newTier: 5 });

  console.log('\n④ Қабати СОФ — такрор ҳамон ҷавобро медиҳад');
  const ordered = Array.from({ length: 30 }, (_, i) => ({
    userId: `u${i + 1}`, weeklyXp: 3000 - i * 100, joinedAt: new Date(), id: `m${i + 1}`,
  }));
  const first = rankAndDecide(ordered, 2);
  const second = rankAndDecide(ordered, 2);
  eq('ду даъват — ҳамон натиҷа', JSON.stringify(first), JSON.stringify(second));
  check('ҳеҷ кас ду зина боло намеравад',
    first.every((r) => Math.abs(r.newTier - 2) <= 1));
  eq('мукофот аз рӯи натиҷа', first[0].gemsReward, GEMS_BY_OUTCOME.promoted);

  console.log('\n⑤ closeLeague — ду иҷро дар як когорта');
  const league: FakeLeague = { id: 'L1', tier: 2, weekKey, rolledOverAt: null };
  const members: FakeMember[] = ordered.map((m) => ({ ...m }));
  const users: FakeUser[] = ordered.map((m) => ({ id: m.userId, leagueTier: 2, weeklyXp: 999 }));
  const { db, store } = makeDb(league, members, users);

  const run1 = await closeLeague('L1', db);
  const tiersAfter1 = store.users.map((u) => u.leagueTier);
  const resultsAfter1 = store.results.length;

  const run2 = await closeLeague('L1', db);
  const tiersAfter2 = store.users.map((u) => u.leagueTier);

  check('иҷрои якум когортаро баст', run1 === true);
  check('иҷрои дуюм чизе накард', run2 === false);
  eq('шумораи натиҷаҳо баъди ду иҷро', store.results.length, 30);
  eq('шумораи натиҷаҳо тағйир наёфт', store.results.length, resultsAfter1);
  eq('зинаҳо баъди иҷрои дуюм АЙНАН ҳамонанд', tiersAfter2, tiersAfter1);
  eq('10-и боло → зинаи 3', tiersAfter2.slice(0, 10), Array(10).fill(3));
  eq('мобайн → зинаи 2 монд', tiersAfter2.slice(10, 25), Array(15).fill(2));
  eq('5-и поён → зинаи 1', tiersAfter2.slice(25), Array(5).fill(1));
  check('ҳеҷ кас ба зинаи 4 нарасид (дучанд боло рафтан)',
    tiersAfter2.every((t) => t <= 3));
  eq('XP-и ҳафтаинаи корбар сифр шуд', store.users[0].weeklyXp, 0);

  console.log('\n⑥ Ҳолати бадтарин — гейти `rolledOverAt` вайрон карда шуд');
  // Тасаввур мекунем, ки ду lambda ҲАМЗАМОН давиданд ва ҳарду аз муҳофизати
  // №1 гузаштанд. Муҳофизати №2 (уникал) ва №3 (ҳисоб, на зиёдкунӣ) бояд боз
  // ҳам нигоҳ доранд.
  store.league.rolledOverAt = null; // гейти №1-ро дастӣ мекушоем
  const run3 = await closeLeague('L1', db);
  check('иҷро гузашт (гейти №1 сунъӣ кушода шуд)', run3 === true);
  eq('вале сатри такрорӣ ЭҶОД НАШУД', store.results.length, 30);
  eq('ва зинаҳо боз ҳамонанд', store.users.map((u) => u.leagueTier), tiersAfter1);
  check('ҳеҷ кас ҳатто ҳоло ба зинаи 4 нарасид',
    store.users.every((u) => u.leagueTier <= 3));

  console.log('\n⑦ Когортаи хурд — подиум ва буришҳо намешикананд');
  const small: FakeMember[] = Array.from({ length: 2 }, (_, i) => ({
    userId: `s${i + 1}`, weeklyXp: 100 - i, joinedAt: new Date(), id: `sm${i + 1}`,
  }));
  const smallUsers: FakeUser[] = small.map((m) => ({ id: m.userId, leagueTier: 3, weeklyXp: 10 }));
  const { db: db2, store: store2 } = makeDb(
    { id: 'L2', tier: 3, weekKey, rolledOverAt: null }, small, smallUsers,
  );
  await closeLeague('L2', db2);
  eq('когортаи 2-нафара: ҳарду мемонанд',
    store2.users.map((u) => u.leagueTier), [3, 3]);

  console.log(`\n${failures === 0 ? '✅ ҲАМА ГУЗАШТ' : `❌ ${failures} санҷиш афтод`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
