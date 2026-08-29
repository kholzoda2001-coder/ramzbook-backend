/**
 * САНҶИШ: ду бор «Ҳал шуд» задан алмосро ду бор НАМЕДИҲАД.
 *
 * Иҷро:  cd backend && npx ts-node --compiler-options '{"module":"commonjs"}' scripts/test-resolve-idempotent.ts
 *
 * Базаи ҳақиқӣ ЛОЗИМ НЕСТ: `resolveReportGroup` танҳо ба интерфейси хурди
 * `ResolveTx` такя мекунад, ва ин ҷо ҷои он як анбори дар ХОТИРА гузошта
 * мешавад. Ҳамон мантиқ, ки маршрут иҷро мекунад.
 *
 * Сенария — маҳз ҳамонест, ки талаб гуфтааст: ҲАШТ гузориш аз ҳашт корбари
 * гуногун ба ЯК сатр.
 */
import { resolveReportGroup, ResolveTx, GEMS_PER_REPORT } from '../lib/reports';

type Row = {
  id: string;
  userId: string;
  lessonId: string;
  moduleId: string | null;
  rewarded: boolean;
  status: string;
  contentId: string;
  field: string;
};

const CONTENT_ID = 'word_hello_001';
const FIELD = 'word_native';

function makeStore() {
  const rows: Row[] = [];
  for (let i = 1; i <= 8; i++) {
    rows.push({
      id: `r${i}`,
      userId: `u${i}`,
      lessonId: 'lesson_greetings_01',
      moduleId: 'module_01',
      rewarded: false,
      status: 'new',
      contentId: CONTENT_ID,
      field: FIELD,
    });
  }
  const gems: Record<string, number> = {};
  for (let i = 1; i <= 8; i++) gems[`u${i}`] = 0;

  const tx: ResolveTx = {
    contentReport: {
      async findMany(args: any) {
        const w = args.where;
        return rows
          .filter(
            (r) =>
              r.contentId === w.contentId &&
              r.field === w.field &&
              (w.status?.in ? w.status.in.indexOf(r.status) >= 0 : true),
          )
          .map((r) => ({
            id: r.id,
            userId: r.userId,
            lessonId: r.lessonId,
            moduleId: r.moduleId,
            rewarded: r.rewarded,
          }));
      },
      async updateMany(args: any) {
        const w = args.where;
        let count = 0;
        for (const r of rows) {
          if (w.contentId && r.contentId !== w.contentId) continue;
          if (w.field && r.field !== w.field) continue;
          if (w.status && r.status !== w.status) continue;
          if (w.id?.in && w.id.in.indexOf(r.id) < 0) continue;
          // ⚠️ МАҲЗ ин шарт идемпотентиро таъмин мекунад.
          if (w.rewarded !== undefined && r.rewarded !== w.rewarded) continue;
          if (args.data.status !== undefined) r.status = args.data.status;
          if (args.data.rewarded !== undefined) r.rewarded = args.data.rewarded;
          count++;
        }
        return { count };
      },
    },
    user: {
      async update(args: any) {
        const id = args.where.id;
        gems[id] = (gems[id] ?? 0) + (args.data.gems?.increment ?? 0);
        return {};
      },
    },
  };

  return { tx, rows, gems };
}

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`  ✗ ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ ${msg}`);
  }
}

async function main() {
  const { tx, rows, gems } = makeStore();

  console.log('Сенария: 8 гузориш аз 8 корбар ба ЯК сатр (word_native).\n');

  // ── Зеркунии ЯКУМ ────────────────────────────────────────────────────────
  console.log('Зеркунии 1-уми «Ҳал шуд»:');
  const first = await resolveReportGroup(tx, CONTENT_ID, FIELD);
  assert(first.groupSize === 8, `гурӯҳ 8 гузориш дорад (шуд: ${first.groupSize})`);
  assert(first.rewarded === 8, `8 гузориш мукофот гирифт (шуд: ${first.rewarded})`);
  assert(first.users.length === 8, `8 корбар огоҳӣ мегирад (шуд: ${first.users.length})`);
  assert(
    rows.every((r) => r.status === 'fixed'),
    'ҳамаи 8 сатр ҳолати fixed гирифтанд',
  );
  assert(
    rows.every((r) => r.rewarded === true),
    'ҳамаи 8 сатр rewarded = true',
  );
  const afterFirst = Object.keys(gems).map((u) => gems[u]);
  assert(
    afterFirst.every((g) => g === GEMS_PER_REPORT),
    `ҳар корбар маҳз ${GEMS_PER_REPORT} алмос дорад (шуд: ${afterFirst.join(',')})`,
  );

  // ── Зеркунии ДУЮМ (ҳамон тугма, боз як бор) ──────────────────────────────
  console.log('\nЗеркунии 2-юми «Ҳал шуд» (ҳамон гурӯҳ):');
  const second = await resolveReportGroup(tx, CONTENT_ID, FIELD);
  assert(second.groupSize === 8, `гурӯҳ ҳамон 8 гузориш аст (шуд: ${second.groupSize})`);
  assert(
    second.rewarded === 0,
    `ҲЕҶ гузориш мукофоти НАВ нагирифт (шуд: ${second.rewarded})`,
  );
  assert(
    second.users.length === 0,
    `ҲЕҶ огоҳии такрорӣ нарафт (шуд: ${second.users.length})`,
  );
  const afterSecond = Object.keys(gems).map((u) => gems[u]);
  assert(
    afterSecond.every((g) => g === GEMS_PER_REPORT),
    `тавозун ТАҒЙИР НАЁФТ — ҳар корбар ҳанӯз ${GEMS_PER_REPORT} (шуд: ${afterSecond.join(',')})`,
  );

  // ── Зеркунии СЕЮМ, барои эътимод ────────────────────────────────────────
  console.log('\nЗеркунии 3-юм:');
  const third = await resolveReportGroup(tx, CONTENT_ID, FIELD);
  assert(third.rewarded === 0, 'боз ҳам сифр мукофоти нав');
  const total = Object.keys(gems).reduce((a, u) => a + gems[u], 0);
  assert(
    total === 8 * GEMS_PER_REPORT,
    `ҳамагӣ ${8 * GEMS_PER_REPORT} алмос дода шуд, на бештар (шуд: ${total})`,
  );

  console.log(
    process.exitCode
      ? '\nНОКОМ — идемпотентӣ вайрон аст.'
      : '\nҲАМА ДУРУСТ: ҳал кардани такрорӣ алмоси такрорӣ намедиҳад.',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
