-- 01 — Рӯзҳо ва моҳҳо бо ҳарфи хурд
-- Сохта шуд: 2026-08-22T21:04:46.844Z
-- Сатрҳо: 38
-- ⚠️ Пеш аз иҷро аз базаи продакшн нусхаи эҳтиётӣ гиред.

BEGIN;
UPDATE "Word" SET "translation" = 'душанбе' WHERE id = 'cmqo1ysfz000ouydwd8i5t5vx';
UPDATE "Word" SET "translation" = 'сешанбе' WHERE id = 'cmqo1ysfz000puydwv1hintmo';
UPDATE "Word" SET "translation" = 'чоршанбе' WHERE id = 'cmqo1ysfz000quydwgl5l7tqg';
UPDATE "Word" SET "translation" = 'панҷшанбе' WHERE id = 'cmqo1ysfz000ruydwn71pjw2f';
UPDATE "Word" SET "translation" = 'ҷумъа' WHERE id = 'cmqo1ysfz000suydwo77lhzpq';
UPDATE "Word" SET "translation" = 'шанбе' WHERE id = 'cmqo1ysfz000tuydw9hm03vz0';
UPDATE "Word" SET "translation" = 'якшанбе' WHERE id = 'cmqo1ysfz000uuydwndvh29uz';
UPDATE "Word" SET "exampleTrans" = 'якшанбе рӯзи хуб аст.' WHERE id = 'cmqo1ysfz000uuydwndvh29uz';
UPDATE "Word" SET "translation" = 'январ' WHERE id = 'cmqo1ysfz000wuydw9a5l9bwg';
UPDATE "Word" SET "translation" = 'феврал' WHERE id = 'cmqo1ysfz000xuydwj1xymyec';
UPDATE "Word" SET "translation" = 'март' WHERE id = 'cmqo1ysfz000yuydw5y0tlx4k';
UPDATE "Word" SET "translation" = 'апрел' WHERE id = 'cmqo1ysfz000zuydwsjx8ckiy';
UPDATE "Word" SET "translation" = 'май' WHERE id = 'cmqo1ysfz0010uydwkg77d1bo';
UPDATE "Word" SET "translation" = 'июн' WHERE id = 'cmqo1ysfz0011uydwni8psrxv';
UPDATE "Word" SET "exampleTrans" = 'феврал хунук аст.' WHERE id = 'cmqo1ysfz000xuydwj1xymyec';
UPDATE "Word" SET "exampleTrans" = 'март нағз аст.' WHERE id = 'cmqo1ysfz000yuydw5y0tlx4k';
UPDATE "Word" SET "exampleTrans" = 'май моҳи хуб аст.' WHERE id = 'cmqo1ysfz0010uydwkg77d1bo';
UPDATE "Word" SET "translation" = 'июл' WHERE id = 'cmqpfrxz3000xm74o8aostjkb';
UPDATE "Word" SET "translation" = 'август' WHERE id = 'cmqpfryhb000zm74o0v76pora';
UPDATE "Word" SET "translation" = 'сентябр' WHERE id = 'cmqpfryy90011m74ow1wu0b8p';
UPDATE "Word" SET "translation" = 'октябр' WHERE id = 'cmqpfrzho0013m74oxbtpnipr';
UPDATE "Word" SET "translation" = 'ноябр' WHERE id = 'cmqpfrzyk0015m74o64q76zzf';
UPDATE "Word" SET "translation" = 'декабр' WHERE id = 'cmqpfs0mh0017m74obpixcfzy';
UPDATE "Word" SET "exampleTrans" = 'июл гарм аст.' WHERE id = 'cmqpfrxz3000xm74o8aostjkb';
UPDATE "Word" SET "exampleTrans" = 'октябр нағз аст.' WHERE id = 'cmqpfrzho0013m74oxbtpnipr';
UPDATE "Word" SET "exampleTrans" = 'ноябр хунук аст.' WHERE id = 'cmqpfrzyk0015m74o64q76zzf';
UPDATE "Word" SET "exampleTrans" = 'декабр хеле хунук аст.' WHERE id = 'cmqpfs0mh0017m74obpixcfzy';
UPDATE "ComprehensionExercise" SET "passageTranslated" = 'Имрӯз душанбе аст. Соат ҳашти субҳ аст. Зодрӯзи ман моҳи июл аст. Ман дувоздаҳсола ҳастам. Дарси англисии ман соати даҳ аст. Мактаб соати се тамом мешавад. Рӯзи ҷумъа ман озодам.' WHERE id = 'cmqpfwgkf000wpxxbi2dy62m4';
UPDATE "DialogueLine" SET "translation" = 'Имрӯз душанбе аст.' WHERE id = 'cmqp81xj9000zv8u4r2owaugi';
UPDATE "Word" SET "translation" = 'чоршанбе' WHERE id = 'cmrge34pt000v5nnr4p74b9vc';
UPDATE "Word" SET "translation" = 'феврал' WHERE id = 'cmrge357n000x5nnrbevgdbws';
UPDATE "Word" SET "translation" = 'август' WHERE id = 'cmrge35pi000z5nnra9r0q1gn';
UPDATE "Word" SET "exampleTrans" = 'феврал хунук аст.' WHERE id = 'cmrge357n000x5nnrbevgdbws';
UPDATE "ComprehensionQuestion" SET "questionTranslated" = '«чоршанбе»-ро тарҷума кунед:' WHERE id = 'cmqpfwhkp0013pxxbtln8iqln';
UPDATE "ComprehensionQuestion" SET "explanation" = 'ҷумъа = Friday.' WHERE id = 'cmr4xsmah0003ndxgcpmrti7g';
UPDATE "Word" SET "exampleTrans" = 'маймун банан мехӯрад.' WHERE id = 'cmr4wdc0x001v13940hfhscox';
UPDATE "ComprehensionQuestion" SET "questionTranslated" = '«панҷшанбе»-ро тарҷума кунед:' WHERE id = 'b8939f86-34e8-4e7b-90e3-8162df827f3d';
UPDATE "ComprehensionQuestion" SET "explanation" = 'панҷшанбе = Thursday (Модули 4).' WHERE id = 'b8939f86-34e8-4e7b-90e3-8162df827f3d';

COMMIT;
