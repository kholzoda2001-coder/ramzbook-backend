// Ҷадвали `Entitlement` + майдони `LibraryItem.priceTjs`.
//
//   node prisma/_add-entitlements-http.mjs
//
// ⚠️ `prisma migrate` аз ин мошин кор намекунад: порти 5432-и Neon баста аст
// (ниг. `ramz-db-scripts-local`). Пас SQL бо драйвери HTTP иҷро мешавад ва
// `schema.prisma` дастӣ ҳамоҳанг нигоҳ дошта мешавад.
//
// Идемпотент: `IF NOT EXISTS` дар ҳама ҷо — такрори иҷро бехатар аст.
//
// ⚠️ `sql.query(...)`, на `sql(...)`: драйвери Neon танҳо ҳамчун tagged
// template даъват мешавад, ва сатри оддӣ хатои норавшан медиҳад.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const steps = [
  ['нархи тоқа дар LibraryItem', `
    ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "priceTjs" DOUBLE PRECISION`],

  ['ҷадвали Entitlement', `
    CREATE TABLE IF NOT EXISTS "Entitlement" (
      "id"            TEXT PRIMARY KEY,
      "userId"        TEXT NOT NULL,
      "itemId"        TEXT NOT NULL,
      "source"        TEXT NOT NULL DEFAULT 'admin',
      "grantedBy"     TEXT,
      "purchaseToken" TEXT,
      "pricePaid"     DOUBLE PRECISION,
      "note"          TEXT,
      "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "revokedAt"     TIMESTAMP(3)
    )`],

  // Як ҷуфт (корбар, воҳид) — ЯК сатр. Грантҳои такрорӣ сатри мавҷударо
  // зинда мекунанд, на нусхаи дуюм месозанд.
  ['ягонагии (корбар, воҳид)', `
    CREATE UNIQUE INDEX IF NOT EXISTS "Entitlement_userId_itemId_key"
      ON "Entitlement" ("userId", "itemId")`],

  // Токени Play ҳеҷ гоҳ ду ҳуқуқ насозад — ҳамон муҳофизате, ки
  // `Subscription.googlePurchaseToken` дорад.
  ['ягонагии токени харид', `
    CREATE UNIQUE INDEX IF NOT EXISTS "Entitlement_purchaseToken_key"
      ON "Entitlement" ("purchaseToken")`],

  ['индекси хонанда', `
    CREATE INDEX IF NOT EXISTS "Entitlement_userId_revokedAt_idx"
      ON "Entitlement" ("userId", "revokedAt")`],

  ['индекси воҳид', `
    CREATE INDEX IF NOT EXISTS "Entitlement_itemId_idx"
      ON "Entitlement" ("itemId")`],

  // 🔴 Калидҳои беруна ОХИРИН: агар ҷадвал аллакай бо онҳо сохта шуда бошад,
  // `ADD CONSTRAINT` хато медиҳад. `DO $$` онро мебалъад.
  ['калиди беруна → User', `
    DO $$ BEGIN
      ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`],

  ['калиди беруна → LibraryItem', `
    DO $$ BEGIN
      ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_itemId_fkey"
        FOREIGN KEY ("itemId") REFERENCES "LibraryItem"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`],
];

for (const [name, q] of steps) {
  try {
    await sql.query(q);
    console.log(`  ✅ ${name}`);
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    process.exitCode = 1;
  }
}

const [cols] = await sql`
  SELECT count(*)::int n FROM information_schema.columns
  WHERE table_name = 'Entitlement'`;
const [price] = await sql`
  SELECT count(*)::int n FROM information_schema.columns
  WHERE table_name = 'LibraryItem' AND column_name = 'priceTjs'`;
console.log(`\nEntitlement: ${cols.n} сутун · LibraryItem.priceTjs: ${price.n === 1 ? 'ҳаст' : 'НЕСТ'}`);
