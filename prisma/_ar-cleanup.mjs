// Ислоҳҳои мазмуни курси арабӣ, ки аз гузаштани ҳар 12 модул баромаданд.
// Ҳар қадам идемпотентӣ аст ва бо `--dry` танҳо нишон дода мешавад.
//
//   node prisma/_ar-cleanup.mjs --dry
//   node prisma/_ar-cleanup.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const DRY = process.argv.includes('--dry');
const COURSE = 'cmqdqfv7300021rcswj4fy6vf';
let changes = 0;
const say = m => console.log(`  ${DRY ? '~' : '✓'} ${m}`);
const run = async (t, p) => { changes++; if (!DRY) await q(t, p); };

// ── 1. partOfSpeech ─────────────────────────────────────────────────────────
// Бе ин майдон корти калима ҳеҷ гоҳ расм намегирад (`_showIntroPhoto` аввал
// «исм аст?» мепурсад). 30 калимаи фаъол онро надошт: хешовандӣ ва рақамҳо.
console.log('\n1. partOfSpeech');
{
  const rows = await q(`SELECT w.id, w.word, w.translation FROM "Word" w
    JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
    WHERE m."courseId"='${COURSE}' AND m."isActive" AND l."isActive"
      AND (w."partOfSpeech" IS NULL OR w."partOfSpeech"='')`);
  for (const w of rows) {
    // Рақами арабӣ дар матн (٢, ١٠) ё худи калимаи ҳисобӣ → numeral, боқӣ исм.
    const isNum = /[٠-٩]/.test(w.word) || /^(مئة|ألف)/.test(w.word);
    const pos = isNum ? 'numeral' : 'noun';
    await run(`UPDATE "Word" SET "partOfSpeech"=$1 WHERE id=$2`, [pos, w.id]);
  }
  say(`${rows.length} калима partOfSpeech гирифт (numeral/noun)`);
}

// ── 2. highlight ────────────────────────────────────────────────────────────
// `highlight` бояд зерсатри АЙНАН дохили ҷумла бошад — вагарна экран чизеро
// равшан намекунад. Ду мисол сатри «тавзеҳӣ» дошт, на порчаи ҷумла.
console.log('\n2. highlight-и мисолҳои грамматика');
{
  const rows = await q(`SELECT x.id, x.sentence, x.highlight FROM "GrammarExample" x
    JOIN "GrammarTopic" t ON x."topicId"=t.id
    WHERE t."courseId"='${COURSE}' AND x.highlight IS NOT NULL AND x.highlight<>''
      AND position(x.highlight in x.sentence)=0`);
  for (const x of rows) {
    // Калимаи аввали highlight-ро мегирем ва ҳамонро дар ҷумла меёбем.
    const first = x.highlight.split(/[\s…]+/).filter(Boolean)[0] ?? '';
    const fix = first && x.sentence.includes(first) ? first : null;
    if (!fix) { console.log(`  ⚠ «${x.sentence}»: ивази худкор нашуд (highlight «${x.highlight}»)`); continue; }
    await run(`UPDATE "GrammarExample" SET highlight=$1 WHERE id=$2`, [fix, x.id]);
    say(`«${x.highlight}» → «${fix}»  (${x.sentence})`);
  }
}

// ── 3. Вариантҳои аз ҳам фарқнакунанда ──────────────────────────────────────
// Дар машқи артикл дистрактори «كتاب» (бе танвин) айнан ҳамон ҷавоби «كتابٌ»
// буд — ду варианти якхела дар як рӯйхат. Ба ҷои он шакли ҶАМЪ мегузорем, ки
// маънои дигар дорад ва хонанда онро фарқ карда метавонад.
console.log('\n3. Дистрактори такрорӣ дар машқи артикл');
{
  const rows = await q(`SELECT e.id, e.answer, e.options FROM "GrammarExercise" e
    JOIN "GrammarTopic" t ON e."topicId"=t.id
    WHERE t."courseId"='${COURSE}' AND t."titleTranslated" LIKE 'Артикли%'`);
  for (const e of rows) {
    const opts = (Array.isArray(e.options) ? e.options : []).map(String);
    if (!opts.includes('كتاب')) continue;
    const next = opts.map(o => o === 'كتاب' ? 'كُتُبٌ' : o);
    await run(`UPDATE "GrammarExercise" SET options=$1::jsonb WHERE id=$2`, [JSON.stringify(next), e.id]);
    say(`[${opts.join(' | ')}] → [${next.join(' | ')}]`);
  }
}

// ── 4. Унвонҳои такрорӣ ─────────────────────────────────────────────────────
// Хонанда дар роҳнамо унвони ҶУЗЪро мебинад, на дарсро. Пас чор муколамаи
// «Гуфтугӯ ва Машқ» ва панҷ матни «Такрор» дар рӯйхат як хел менамуданд.
console.log('\n4. Унвонҳои такрорӣ');
{
  const dl = await q(`SELECT d.id, d."titleTranslated", m."order" mo, m."titleTranslated" mt
    FROM "Dialogue" d
    JOIN "Lesson" l ON l."dialogueId"=d.id JOIN "Module" m ON l."moduleId"=m.id
    WHERE d."courseId"='${COURSE}' AND d."titleTranslated"='Гуфтугӯ ва Машқ' ORDER BY m."order"`);
  // Номи модул дароз аст («Саломпурсӣ ва муоширати асосӣ») — дар рӯйхати дарс
  // танҳо қисми аввал ҷой мешавад.
  const short = s => s.split(/\s+ва\s+/)[0].trim();
  for (const d of dl) {
    const t = `Муколама: ${short(d.mt)}`;
    await run(`UPDATE "Dialogue" SET "titleTranslated"=$1 WHERE id=$2`, [t, d.id]);
    say(`муколамаи M${d.mo}: «Гуфтугӯ ва Машқ» → «${t}»`);
  }
  const cm = await q(`SELECT c.id, m."order" mo, m."titleTranslated" mt FROM "ComprehensionExercise" c
    JOIN "Lesson" l ON l."comprehensionId"=c.id JOIN "Module" m ON l."moduleId"=m.id
    WHERE c."courseId"='${COURSE}' AND c."titleTranslated"='Такрор' ORDER BY m."order"`);
  for (const c of cm) {
    const t = `Такрори модул: ${short(c.mt)}`;
    await run(`UPDATE "ComprehensionExercise" SET "titleTranslated"=$1 WHERE id=$2`, [t, c.id]);
    say(`матни M${c.mo}: «Такрор» → «${t}»`);
  }
}

// ── 5. Модул ва дарсҳои хомӯш ба бойгонӣ ────────────────────────────────────
// Чор модули хомӯш тартиби 6,7,8,9-ро бо модулҳои ФАЪОЛ мубодила мекарданд.
// Маълумот нест КАРДА НАМЕШАВАД (шояд боз лозим шавад) — танҳо тартибашон ба
// охир бурда мешавад, то занҷири фаъол 0..11-и тоза бимонад.
console.log('\n5. Бойгонии модулҳои хомӯш');
{
  const rows = await q(`SELECT id, "order", "titleTranslated" FROM "Module"
    WHERE "courseId"='${COURSE}' AND "isActive"=false AND "order" < 100 ORDER BY "order"`);
  let n = 100;
  for (const m of rows) {
    await run(`UPDATE "Module" SET "order"=$1 WHERE id=$2`, [n, m.id]);
    say(`«${m.titleTranslated}»: order ${m.order} → ${n}`);
    n++;
  }
  if (!rows.length) say('ҳамааш аллакай дар бойгонӣ');
}

// ── 6. Дарсҳои такрории хомӯш ───────────────────────────────────────────────
// «Рангҳо» ва «Сифатҳои асосӣ»-и модули 3 хомӯшанд, чунки ҳамон мавзӯъҳо дар
// модулҳои 1, 2 ва 9 бо ҳаракат ва аудио аз нав дода шудаанд. Онҳо ҳам танҳо
// ба охири модул бурда мешаванд, то тартиби дарсҳо сӯрох надошта бошад.
console.log('\n6. Дарсҳои хомӯши модули 3');
{
  const rows = await q(`SELECT l.id, l."order", l."titleTranslated", m."order" mo FROM "Lesson" l
    JOIN "Module" m ON l."moduleId"=m.id
    WHERE m."courseId"='${COURSE}' AND m."isActive" AND l."isActive"=false AND l."order" < 100`);
  let n = 100;
  for (const l of rows) {
    await run(`UPDATE "Lesson" SET "order"=$1 WHERE id=$2`, [n++, l.id]);
    say(`M${l.mo} «${l.titleTranslated}»: order ${l.order} → ${n - 1}`);
  }
  if (!rows.length) say('дарси хомӯши дар мобайн монда нест');
}

// ── Версияи мазмун ──────────────────────────────────────────────────────────
if (!DRY && changes) {
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  console.log('\ncontent_version ламс шуд.');
}
console.log(DRY ? `\n[--dry] ${changes} тағйир мешуд.` : `\n${changes} тағйир навишта шуд.`);
