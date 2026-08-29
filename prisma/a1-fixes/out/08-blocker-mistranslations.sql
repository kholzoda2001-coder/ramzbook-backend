-- 08 — Хатоҳои маъноии блокер
-- Сохта шуд: 2026-08-22T21:13:45.664Z
-- Сатрҳо: 7
-- ⚠️ Пеш аз иҷро аз базаи продакшн нусхаи эҳтиётӣ гиред.

BEGIN;
UPDATE "Word" SET "exampleTrans" = 'Он китоб аст.' WHERE id = 'cmqngcvui000kee51g5jvv715';
UPDATE "Word" SET "exampleTrans" = 'Он китоб аст.' WHERE id = 'cmrge2vo7000d5nnrg7guwgw8';
UPDATE "DialogueLine" SET "translation" = 'Он бист доллар аст.' WHERE id = 'cmqqbem180047ftii1e0d033c';
UPDATE "DialogueLine" SET "translation" = 'Хоҳиш мекунам.' WHERE id = 'cmqqbem18004bftiiayek1s3g';
UPDATE "DialogueLine" SET "translation" = 'Мебахшед. Беморхона дар куҷост?' WHERE id = 'cmqqch2gb003krhonh7xl667x';
UPDATE "DialogueLine" SET "translation" = 'Бале. Он дар паҳлӯи бонк аст.' WHERE id = 'cmqqch2gb003prhonqww368ob';
UPDATE "DialogueLine" SET "translation" = 'Хоҳиш мекунам.' WHERE id = 'cmqqch2gb003rrhony45nocyn';

COMMIT;
