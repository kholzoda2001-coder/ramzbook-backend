-- «Фикри хонандагон» — як қуттӣ барои ҳама.
--
-- ⚠️ ИН SQL БОЯД ПЕШ АЗ ДЕПЛОЙ ИҶРО ШАВАД.
-- Prisma-и нав сутуни `nativeLang`-ро интихоб мекунад; агар код пеш аз сутун
-- ба продакшн равад, ҳам панел, ҳам POST-и фикр аз барнома мешиканад.
--
-- Ду роҳи иҷро:
--   • node prisma/_inbox-add-native-lang.mjs       (аз мошини корӣ, HTTP/443)
--   • ё ҳамин файлро дар Neon SQL Editor часпонед  (браузер, бе VPN)
--
-- Ҳар қадам такроршаванда аст — дубора иҷро кардан бехатар.

-- ── 1. Сутун ва индекси филтр ───────────────────────────────────────────────
ALTER TABLE "Feedback" ADD COLUMN IF NOT EXISTS "nativeLang" TEXT;

CREATE INDEX IF NOT EXISTS "Feedback_nativeLang_targetLang_idx"
  ON "Feedback" ("nativeLang", "targetLang");

-- ── 2. Сатрҳои кӯҳна: `targetLang` cuid буд, на код ─────────────────────────
-- Барномаи то 2026-08-30 `Language.id`-ро мефиристод. Бе ин навсозӣ филтри
-- забон нисфи таърихро намедид ва панел «cmq7…» ҳамчун забон нишон медод.
UPDATE "Feedback" f
SET "targetLang" = l.code
FROM "Language" l
WHERE f."targetLang" = l.id;

-- ── 3. Забони МОДАРӢ — аз сатри корбар ──────────────────────────────────────
-- Ҳеҷ гоҳ сабт намешуд. Ҳақиқати наздиктарин — забони ҷории худи корбар.
UPDATE "Feedback" f
SET "nativeLang" = u."nativeLang"
FROM "User" u
WHERE u.id = f."userId"
  AND f."nativeLang" IS NULL
  AND u."nativeLang" IS NOT NULL;

-- ── 4. Забони ОМӮЗИШӢ, агар тамоман холӣ монда бошад ────────────────────────
UPDATE "Feedback" f
SET "targetLang" = u."targetLang"
FROM "User" u
WHERE u.id = f."userId"
  AND f."targetLang" IS NULL
  AND u."targetLang" IS NOT NULL;
