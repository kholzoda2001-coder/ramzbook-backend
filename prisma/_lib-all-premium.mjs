// Ҳамаи воҳидҳои китобхона → PRO, ва воҳиди пинҳоншуда → боз фаъол.
//
// ⚠️ Ба базаи ПРОДАКШН менависад. Бо иҷозати сареҳи соҳиб (2026-09-02).
// ⚠️ Драйвери HTTP лозим аст — TCP 5432 аз ин мошин баста аст
//    (ниг. хотираи `ramz-db-scripts-local`).
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    }),
);
const sql = neon(env.DATABASE_URL);

const before = await sql`
  SELECT id, title, "isPremium", "isActive" FROM "LibraryItem" ORDER BY "order"`;
console.log('ПЕШ АЗ:');
for (const r of before) {
  console.log(`  ${r.isPremium ? '🔒' : '  '} ${r.isActive ? 'фаъол' : 'ХОМӮШ'} · ${r.title}`);
}

// 1. Ҳама ба PRO.
await sql`UPDATE "LibraryItem" SET "isPremium" = true WHERE "isPremium" = false`;

// 2. Воҳиди пинҳоншуда боз намоён. Қулф будан ≠ нопадид будан: эндпоинти
//    барнома `isActive: true` мегирад, пас китоби хомӯш умуман фиристода
//    намешавад ва хонанда намедонад, ки он вуҷуд дорад.
await sql`UPDATE "LibraryItem" SET "isActive" = true WHERE "isActive" = false`;

const after = await sql`
  SELECT title, "isPremium", "isActive" FROM "LibraryItem" ORDER BY "order"`;
console.log('\nБАЪД АЗ:');
for (const r of after) {
  console.log(`  ${r.isPremium ? '🔒 PRO ' : '   free'} · ${r.isActive ? 'фаъол' : 'ХОМӮШ'} · ${r.title}`);
}
const pro = after.filter((r) => r.isPremium).length;
const live = after.filter((r) => r.isActive).length;
console.log(`\nҲамагӣ ${after.length} · PRO: ${pro} · фаъол: ${live}`);
