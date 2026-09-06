-- «Кадом САДО ба шумо кор мехоҳад» — ҷадвали ҷамъбасти талаффуз.
--
-- ⚠️ ИН SQL БОЯД ПЕШ АЗ ДЕПЛОЙ ИҶРО ШАВАД.
-- Prisma-и нав ба `SpeakingSound` муроҷиат мекунад; агар код пеш аз ҷадвал
-- ба продакшн равад, анҷоми ҳар дарси гуфтор хато медиҳад.
--
-- Ду роҳи иҷро:
--   • ҳамин файлро дар Neon SQL Editor часпонед  (браузер, бе VPN)
--   • ё аз мошине, ки ба база мерасад: psql < ин файл
--
-- Ҳар қадам такроршаванда аст — дубора иҷро кардан бехатар.

-- ── 1. Ҷадвал ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "SpeakingSound" (
  "id"           TEXT PRIMARY KEY,
  "userId"       TEXT NOT NULL,
  "languageId"   TEXT NOT NULL,
  "phoneme"      TEXT NOT NULL,

  -- Ҳафтаи ҷорӣ
  "curAttempts"  INTEGER NOT NULL DEFAULT 0,
  "curSum"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "curStart"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Ҳафтаи гузашта — танҳо барои муқоисаи «↑ беҳтар шуд»
  "prevAttempts" INTEGER NOT NULL DEFAULT 0,
  "prevSum"      DOUBLE PRECISION NOT NULL DEFAULT 0,

  -- То 3 калимаи намуна: «th — thank, three»
  "examples"     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  "lastAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. Калиди бегона ────────────────────────────────────────────────────────
-- Корбар нест шуд → садоҳои ӯ низ. `DO` барои такроршавандагӣ: Postgres
-- `ADD CONSTRAINT IF NOT EXISTS` надорад.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SpeakingSound_userId_fkey'
  ) THEN
    ALTER TABLE "SpeakingSound"
      ADD CONSTRAINT "SpeakingSound_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- ── 3. Индексҳо ─────────────────────────────────────────────────────────────
-- Яктогӣ: як сатр барои ҳар (корбар · забон · фонема). Ҳамин калидро
-- `upsert`-и роути анҷоми дарс истифода мебарад.
CREATE UNIQUE INDEX IF NOT EXISTS "SpeakingSound_userId_languageId_phoneme_key"
  ON "SpeakingSound" ("userId", "languageId", "phoneme");

-- Хониши ҳисобот: ҳамаи садоҳои як корбар барои як забон.
CREATE INDEX IF NOT EXISTS "SpeakingSound_userId_languageId_idx"
  ON "SpeakingSound" ("userId", "languageId");
