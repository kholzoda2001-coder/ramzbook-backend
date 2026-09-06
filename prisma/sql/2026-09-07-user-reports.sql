-- Шикоят ба як КОРБАР (`UserReport`).
--
-- ⚠️ Драйвери HTTP-и Neon дар як дархост ТАНҲО ЯК амрро қабул мекунад.
-- Ин файлро якбора нагузаронед — ҳар блокро алоҳида иҷро кунед.

CREATE TABLE IF NOT EXISTS "UserReport" (
  "id"             TEXT PRIMARY KEY,
  "reporterId"     TEXT NOT NULL,
  "reportedId"     TEXT NOT NULL,
  "reason"         TEXT NOT NULL,
  "note"           TEXT,
  "snapshotName"   TEXT,
  "snapshotAvatar" TEXT,
  "status"         TEXT NOT NULL DEFAULT 'new',
  "uiLanguage"     TEXT,
  "appVersion"     TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt"     TIMESTAMP(3)
);

-- Як шикоятгар → як шикоятшуда = ЯК сатр. Бе ин як нафар метавонад панелро
-- бо садҳо шикояти якхела пур кунад.
CREATE UNIQUE INDEX IF NOT EXISTS "UserReport_reporterId_reportedId_key"
  ON "UserReport" ("reporterId", "reportedId");

CREATE INDEX IF NOT EXISTS "UserReport_reportedId_status_idx"
  ON "UserReport" ("reportedId", "status");

CREATE INDEX IF NOT EXISTS "UserReport_status_createdAt_idx"
  ON "UserReport" ("status", "createdAt");

-- Калидҳои беруна. `ON DELETE CASCADE` — корбари худпоккарда шикоятҳои
-- худро ҳам мебарад; сатри «шикоят ба корбари нестшуда» маъно надорад.
ALTER TABLE "UserReport" DROP CONSTRAINT IF EXISTS "UserReport_reporterId_fkey";

ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_reporterId_fkey"
  FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserReport" DROP CONSTRAINT IF EXISTS "UserReport_reportedId_fkey";

ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_reportedId_fkey"
  FOREIGN KEY ("reportedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
