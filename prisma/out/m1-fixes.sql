-- ═══════════════════════════════════════════════════════════════════════════
--  English A1 · Module 1 — remediation
--  Source: English_A1_Module1_QA_Report.md (2026-08-28)
--  Course cmqkvhu8p0001o5r7nkbeo4jm · Module cmqngcvui0001ee513prbg336
--
--  46 statements, 7 groups. IDEMPOTENT: every statement carries a WHERE guard
--  on the current value, so re-running changes nothing and raises nothing.
--  Wrapped in a single transaction — either all of it lands or none of it.
--
--  TAKE A BACKUP FIRST.
-- ═══════════════════════════════════════════════════════════════════════════
BEGIN;

-- ─── 1 · Sequence swap: Subject Pronouns (was 7) before Verb To Be (was 6) ──
-- Routed through -1 so this stays correct if a unique index on
-- ("moduleId","order") is ever added.
UPDATE "Lesson" SET "order" = -1
 WHERE id = 'cmqqkhm69000zwyp4mg0lvce5' AND "order" = 7;               -- Pronouns → parking slot
UPDATE "Lesson" SET "order" = 7
 WHERE id = 'cmqqkhw04001zwyp45xyaky44' AND "order" = 6;               -- Verb To Be → 7
UPDATE "Lesson" SET "order" = 6
 WHERE id = 'cmqqkhm69000zwyp4mg0lvce5' AND "order" = -1;              -- Pronouns → 6

-- ─── 2 · ipaTajik ──────────────────────────────────────────────────────────
-- Tajik е/ё/ю/я are already iotated: «ес» IS /jes/, so «йес» was a double yod.
-- «уу» already means long /uː/ elsewhere in the course (туутҳ, суупэмаакит).
UPDATE "Word" SET "ipaTajik" = 'ес'
 WHERE id = 'cmqngcvui0007ee518emegklh' AND "ipaTajik" = 'йес';        -- Д1  Yes
UPDATE "Word" SET "ipaTajik" = 'ес'
 WHERE id = 'cmrge2tov00055nnrc5xnjp7g' AND "ipaTajik" = 'йес';        -- Д13 Yes
UPDATE "Word" SET "ipaTajik" = 'ёр'
 WHERE id = 'cmqngcvui000nee51mhsec3hf' AND "ipaTajik" = 'йор';        -- Д4  Your
UPDATE "Word" SET "ipaTajik" = 'ё уэлкам'
 WHERE id = 'cmqngcvui000dee51vhqacj5l' AND "ipaTajik" = 'йо уэлкам';  -- Д2  You're welcome
UPDATE "Word" SET "ipaTajik" = 'ё уэлкам'
 WHERE id = 'cmrge2uoi00095nnrt1204qm9' AND "ipaTajik" = 'йо уэлкам';  -- Д13 You're welcome
UPDATE "Word" SET "ipaTajik" = 'вуман'
 WHERE id = 'cmqngcvui000tee518qgfwr20' AND "ipaTajik" = 'ууман';      -- Д5  Woman

-- ─── 3 · Explanations that contained no Tajik at all ───────────────────────
UPDATE "GrammarExercise" SET explanation = 'Тартиб: фоил (I) → феъл (am) → артикл (a) → исм (teacher).'
 WHERE id = 'cmqqkmwen001pdvu25ov6fel8';                               -- Д7  reorder
UPDATE "ComprehensionQuestion" SET explanation = 'Матн: His name is Karim. — Номи ӯ Карим аст.'
 WHERE id = 'cmsd0vth7000910cpwj5mmr22';                               -- Д9  q1
UPDATE "ComprehensionQuestion" SET explanation = 'Матн: He is a teacher. — Ӯ муаллим аст.'
 WHERE id = 'cmsd0vto6000b10cp206zhgv1';                               -- Д9  q2
UPDATE "ComprehensionQuestion" SET explanation = 'Матн: My name is Anna. — Номи ман Анна аст.'
 WHERE id = 'cmr4vkr3h0002g4jrap7ns4tm';                               -- Д10 q1
UPDATE "ComprehensionQuestion" SET explanation = 'Матн: I am a teacher. — Ман муаллим ҳастам.'
 WHERE id = 'cmr4vkr3h0003g4jrtu0yrf0t';                               -- Д10 q2
UPDATE "ComprehensionQuestion" SET explanation = 'Матн: This is my friend Tom. — Ин дӯсти ман Том аст.'
 WHERE id = 'cmr4vkr3h0004g4jr627ww62e';                               -- Д10 q3
UPDATE "ComprehensionQuestion" SET explanation = 'Матн: He is a student. — Ӯ донишҷӯ аст.'
 WHERE id = 'cmr4vkr3i0005g4jroopmkhu7';                               -- Д10 q4

-- ─── 4 · Register: ту → шумо ───────────────────────────────────────────────
-- The Д7 topic explanation is deliberately NOT touched: it quotes «ту ҳастӣ»
-- because the Tajik paradigm is the thing being taught there.
UPDATE "Word" SET "exampleTrans" = 'Номи шумо чист?'
 WHERE id = 'cmqngcvui000nee51mhsec3hf' AND "exampleTrans" = 'Номи ту чист?';
UPDATE "GrammarExample" SET translation = 'Шумо дӯсти ман ҳастед.'
 WHERE id = 'cmqqkmt3h0017dvu2arrr34ps' AND translation = 'Ту дӯсти ман ҳастӣ.';
UPDATE "GrammarExercise" SET "promptTranslated" = 'Шумо дӯсти ман ҳастед.'
 WHERE id = 'cmqqkmvns001ldvu2107onc77' AND "promptTranslated" = 'Ту дӯсти ман ҳастӣ.';

-- ─── 5 · Emoji collisions ──────────────────────────────────────────────────
-- Unicode 6.0/9.0 glyphs only — Unicode-14 emoji (🫵) still render as tofu on
-- the older Android builds much of the audience runs.
-- None of these newly enables the picture exercise: every word below is a
-- pronoun/determiner/interjection, so _isPicturable stays false.
UPDATE "Word" SET emoji = '🥺' WHERE id = 'cmqngcvui000aee51frg8p545';  -- Д2  Please (was 🙏, collided with Thank you)
UPDATE "Word" SET emoji = '🥺' WHERE id = 'cmrge2u6p00075nnrwywph27o';  -- Д13 Please (kept in step)
UPDATE "Word" SET emoji = '👉' WHERE id = 'cmqngcvui000hee51q64il1e9';  -- Д3  You  (was 👤)
UPDATE "Word" SET emoji = '🎒' WHERE id = 'cmqngcvui000iee5122xmnta7';  -- Д3  My   (was 👤)
UPDATE "Word" SET emoji = '👉' WHERE id = 'cmrge2v6c000b5nnrir750cif';  -- Д13 You  (kept in step)
UPDATE "Word" SET emoji = '👜' WHERE id = 'cmqngcvui000nee51mhsec3hf';  -- Д4  Your (was 👤, freeing 👤 for «I» in Д3)
UPDATE "Word" SET emoji = '🤷' WHERE id = 'cmqngcvui000pee511kolgzra';  -- Д4  Who  (was ❔, indistinguishable from What ❓)

-- ─── 6 · Dialogue speaker names ────────────────────────────────────────────
-- Named by role rather than А/Б: DialogueLine.isUser already marks which side
-- the learner speaks, so the label can say so.
UPDATE "DialogueLine" SET speaker = 'Ҳамсуҳбат' WHERE id = 'cmqp81u210002v8u46aueyr6x';
UPDATE "DialogueLine" SET speaker = 'Шумо'      WHERE id = 'cmqp81u210003v8u44cp7nae7';
UPDATE "DialogueLine" SET speaker = 'Ҳамсуҳбат' WHERE id = 'cmqp81u210004v8u4s2gz5s0c';
UPDATE "DialogueLine" SET speaker = 'Шумо'      WHERE id = 'cmqp81u210005v8u4aafp0uvi';
UPDATE "DialogueLine" SET speaker = 'Ҳамсуҳбат' WHERE id = 'cmqp81u210006v8u433gabe4i';
UPDATE "DialogueLine" SET speaker = 'Шумо'      WHERE id = 'cmqp81u210007v8u41k16pb87';
UPDATE "DialogueLine" SET speaker = 'Ҳамсуҳбат' WHERE id = 'cmqp81u210008v8u4d68035jj';
UPDATE "DialogueLine" SET speaker = 'Шумо'      WHERE id = 'cmqp81u210009v8u4dyi90fv2';

-- ─── 7 · Final exam rebuilt on Module 1 vocabulary only ────────────────────
-- Every English word below is taught in Module 1, plus the proper names
-- already in the passage (Ali, Sara) and the am/is/are + He/She/It forms the
-- two grammar lessons teach. correctIndex is spread across 0/1/2 — the old set
-- could be cleared by always tapping the first option.
UPDATE "ComprehensionQuestion" SET
  question = 'My name is ___.',
  "questionTranslated" = 'Номи ман чист? (аз матн)',
  options = '["Ali","Sara","Hello"]'::jsonb,
  "correctIndex" = 0,
  explanation = 'Матн: My name is Ali. — Номи ман Алӣ аст.'
 WHERE id = 'cmqqxlbgj0001a32fyv4gc4ei';

UPDATE "ComprehensionQuestion" SET
  question = 'I am a ___.',
  "questionTranslated" = 'Ман кистам? (аз матн)',
  options = '["Girl","Woman","Boy"]'::jsonb,
  "correctIndex" = 2,
  explanation = 'Матн: I am a boy. — Ман писар ҳастам.'
 WHERE id = 'cmqqxlc010003a32fhl5p3gzo';

UPDATE "ComprehensionQuestion" SET
  question = 'Sara is a ___.',
  "questionTranslated" = 'Сара кист? (аз матн)',
  options = '["Man","Girl","Boy"]'::jsonb,
  "correctIndex" = 1,
  explanation = 'Матн: She is a girl. — Сара духтар аст.'
 WHERE id = 'cmqqxlcd50005a32fmdebdw0y';

UPDATE "ComprehensionQuestion" SET
  question = 'Sara is a girl. ___ is my friend.',
  "questionTranslated" = 'Ҷонишин барои зан кадом аст?',
  options = '["He","It","She"]'::jsonb,
  "correctIndex" = 2,
  explanation = 'Сара зан аст → She. (Ҷонишинҳои фоилӣ: She = ӯ, барои зан)'
 WHERE id = 'cmqqxlcq40007a32fj651bjke';

UPDATE "ComprehensionQuestion" SET
  question = 'I ___ Ali.',
  "questionTranslated" = 'Феъли to be: бо I кадом шакл меояд?',
  options = '["is","am","are"]'::jsonb,
  "correctIndex" = 1,
  explanation = 'Бо I ҳамеша am меояд. (Феъли To Be)'
 WHERE id = 'cmqqxld330009a32fcpig35ew';

UPDATE "ComprehensionQuestion" SET
  question = 'Салом = ?',
  "questionTranslated" = '«Салом» ба англисӣ чист?',
  options = '["Hello","Please","Goodbye"]'::jsonb,
  "correctIndex" = 0,
  explanation = 'Салом = Hello.'
 WHERE id = 'cmqqxldfy000ba32fbq06x3j4';

UPDATE "ComprehensionQuestion" SET
  question = 'Ташаккур = ?',
  "questionTranslated" = '«Ташаккур» ба англисӣ чист?',
  options = '["Sorry","You''re welcome","Thank you"]'::jsonb,
  "correctIndex" = 2,
  explanation = 'Ташаккур = Thank you.'
 WHERE id = 'cmqqxldt1000da32fwrf5q5nq';

UPDATE "ComprehensionQuestion" SET
  question = 'Субҳ ба хайр = ?',
  "questionTranslated" = '«Субҳ ба хайр» ба англисӣ чист?',
  options = '["Good night","Good morning","Good evening"]'::jsonb,
  "correctIndex" = 1,
  explanation = 'Субҳ ба хайр = Good morning.'
 WHERE id = 'cmqqxle5z000fa32fz24zbcuz';

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
--  VERIFICATION — run after COMMIT. Expected result is noted on each line.
-- ═══════════════════════════════════════════════════════════════════════════
-- 1) Pronouns must now sort before Verb To Be:
--    expect: order 6 = Subject Pronouns, order 7 = Verb To Be
SELECT "order", title FROM "Lesson"
 WHERE id IN ('cmqqkhw04001zwyp45xyaky44','cmqqkhm69000zwyp4mg0lvce5') ORDER BY "order";

-- 2) No «й»-initial transcription and no «уу» left in Module 1: expect 0 rows
SELECT w.word, w."ipaTajik" FROM "Word" w
  JOIN "Lesson" l ON l.id = w."lessonId"
 WHERE l."moduleId" = 'cmqngcvui0001ee513prbg336'
   AND (w."ipaTajik" LIKE 'й%' OR w."ipaTajik" LIKE '%уу%');

-- 3) No explanation without Tajik in Module 1: expect 0 rows
SELECT q.id, q.question, q.explanation FROM "ComprehensionQuestion" q
  JOIN "Lesson" l ON l."comprehensionId" = q."exerciseId"
 WHERE l."moduleId" = 'cmqngcvui0001ee513prbg336'
   AND q.explanation IS NOT NULL AND q.explanation !~ '[А-Яа-яЁёӢӣӮӯҚқҲҳҶҷҒғ]';

-- 4) No «ту» left outside the lessons that teach the pronoun: expect 0 rows
SELECT w.id, w.word, w."exampleTrans" FROM "Word" w
  JOIN "Lesson" l ON l.id = w."lessonId"
 WHERE l."moduleId" = 'cmqngcvui0001ee513prbg336'
   AND w."exampleTrans" ~ '(^|[^[:alpha:]])ту([^[:alpha:]]|$)';

-- 5) No emoji used twice inside one Module 1 lesson: expect 0 rows
SELECT l."order" AS lesson, w.emoji, count(*), string_agg(w.word, ', ')
  FROM "Word" w JOIN "Lesson" l ON l.id = w."lessonId"
 WHERE l."moduleId" = 'cmqngcvui0001ee513prbg336' AND w.emoji <> ''
 GROUP BY l."order", w.emoji HAVING count(*) > 1;

-- 6) No untranslated speaker labels: expect 0 rows
SELECT id, speaker, text FROM "DialogueLine"
 WHERE "dialogueId" = 'cmqp81u210001v8u4eh89bt76' AND speaker ~ '[A-Za-z]';

-- 7) Exam answer key must not be all-zeros: expect three distinct values
SELECT "correctIndex", count(*) FROM "ComprehensionQuestion"
 WHERE "exerciseId" = 'cmqpfw88w0001pxxbus8ewu33'
 GROUP BY "correctIndex" ORDER BY "correctIndex";
