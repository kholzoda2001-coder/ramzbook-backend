// ═══════════════════════════════════════════════════════════════════════════
// Фазаи 2-и «наҷоти A2» · банди 2 — Title Case-и англисӣ дар унвонҳои тоҷикӣ.
//
// «Module 4: Food And Cooking» ҳангоми тарҷума ҳарфи калони «And»-ро бо худ
// овард: «Модули 4: Хӯрок ва Пухтупаз». Дар тоҷикӣ баъд аз «ва» ҳарфи калон
// намеояд — дуруст «Хӯрок ва пухтупаз» аст.
//
//   node prisma/fix-en-a2-phase2-titles.mjs            # хушк
//   node prisma/fix-en-a2-phase2-titles.mjs --apply    # менависад
//
// ═══════ ДУ ДОМ, КИ ИН СКРИПТ ҚАСДАН ДУР МЕЗАНАД ═══════════════════════════
//
// ① ҲАРФИ КАЛОН БАЪД АЗ «—» ё «:» ХАТО НЕСТ.
//    «Дарси 11: Шунавоӣ — Сафар ба кӯҳҳо» — «Сафар» сарсатри пораи НАВ аст.
//    Детектори содда («ҳар калимаи ғайри-якуми калон») 91 унвон меёбад, ки
//    аксарашон ДУРУСТанд. Барои ҳамин мо танҳо баъд аз ПАЙВАНДАК мегардем.
//
// ② БАЪД АЗ «ва» ҲАМ НОМИ ХОС ШУДА МЕТАВОНАД.
//    Дар `ComprehensionExercise` унвони «Анвар ва Бек» ҳаст — «Бек» НОМ аст
//    ва хурд кардани он хато мебуд. Ҳамин доми «душанбе → Душанбе»-и
//    `p0-phase3-normalize.mjs` аст, танҳо баръакс. Ду сипар гузошта шуд:
//      • ҷадвалҳои ҳикоя (`ComprehensionExercise`, `Dialogue`) умуман даст
//        нахӯрдаанд — маҳз он ҷо номи қаҳрамонҳо зиндагӣ мекунад;
//      • рӯйхати ошкорои [PROTECTED] ҳатто дар ҷадвалҳои мавзӯӣ ном ва
//        ҷойномро нигоҳ медорад.
//    Ҳар унвони партофташуда дар лог НИШОН дода мешавад — хомӯш намемонад.
// ═══════════════════════════════════════════════════════════════════════════
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const APPLY = process.argv.includes('--apply');
const COURSE = 'cmrdzoby700018vk3td9vuag3';

// Пайвандакҳое, ки баъдашон дар тоҷикӣ ҳарфи калон НАМЕОЯД.
const CONJ = ['ва', 'ё'];

// Номи хос — ҳатто баъд аз «ва» хурд НАМЕШАВАД. Рӯйхат аз мазмуни ВОҚЕИИ
// худи курс гирифта шудааст (қаҳрамонҳои матнҳо) + ҷойномҳои маъмул.
const PROTECTED = new Set([
  'Анвар', 'Бек', 'Карим', 'Каримов', 'Малика', 'Нодира', 'Ситора',
  'Азиз', 'Фаррух', 'Нигора', 'Омад', 'Сара', 'Алӣ', 'Том', 'Зарина',
  'Далер', 'Фирӯза', 'Парвина', 'Рустам', 'Сафар',
  'Душанбе', 'Хуҷанд', 'Тоҷикистон', 'Русия', 'Англия', 'Амрико',
  'Лондон', 'Москва', 'Париж', 'Дубай', 'Ҳиндустон', 'Туркия',
]);

const UPPER = /[А-ЯЁҒҲҚҶӢӮЪЎ]/u;
const say = (s = '') => console.log(s);
const head = (t) => { say(); say('─'.repeat(76)); say(t); say('─'.repeat(76)); };

/// Ҳарфи калонро баъд аз пайвандак хурд мекунад.
/// Бармегардонад: { after, changed[], skipped[] }
function fixTitleCase(title) {
  const changed = [];
  const skipped = [];
  const conj = CONJ.join('|');
  // (пайвандак)(фосила)(эҳтимол қавс/нохунак)(ҲАРФИ КАЛОН)
  const re = new RegExp(`(^|[\\s(«"'])(${conj})(\\s+)([(«"']*)([А-ЯЁҒҲҚҶӢӮЪЎ])`, 'gu');
  const after = title.replace(re, (m, pre, c, sp, open, letter, offset, whole) => {
    // калимаи пурраро барои санҷиши [PROTECTED] ҷудо мекунем
    const rest = whole.slice(offset + m.length);
    const word = letter + (rest.match(/^[^\s]*/u) || [''])[0].replace(/[)»"'“”.,?!:;]+$/u, '');
    if (PROTECTED.has(word)) { skipped.push(word); return m; }
    changed.push(word);
    return pre + c + sp + open + letter.toLowerCase();
  });
  return { after, changed, skipped };
}

// Ҷадвалҳои МАВЗӮӢ — унвонашон мафҳум аст, на ҳикоя. Номи қаҳрамон ин ҷо
// намеояд, бинобар ин хурд кардан бехатар аст.
const TABLES = [
  { t: 'Module', label: 'Модул',
    sel: `SELECT id, "titleTranslated" tt, 'M'||("order"+1) tag FROM "Module"
          WHERE "courseId"='${COURSE}' ORDER BY "order"` },
  { t: 'Lesson', label: 'Дарс',
    sel: `SELECT l.id, l."titleTranslated" tt, 'M'||(m."order"+1)||'·Д'||(l."order"+1) tag
          FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
          WHERE m."courseId"='${COURSE}' ORDER BY m."order", l."order"` },
  { t: 'GrammarTopic', label: 'Мавзӯи грамматика',
    sel: `SELECT id, "titleTranslated" tt, 'GT'||"order" tag FROM "GrammarTopic"
          WHERE "courseId"='${COURSE}' ORDER BY "order"` },
];

let total = 0;
const allWords = new Map();

for (const spec of TABLES) {
  head(`${spec.label} (${spec.t})`);
  const rows = await q(spec.sel);
  let n = 0;
  for (const r of rows) {
    const { after, changed, skipped } = fixTitleCase(r.tt || '');
    if (skipped.length) say(`  ⊘ ${r.tag} НОМИ ХОС нигоҳ дошта шуд: ${JSON.stringify(skipped)} — «${r.tt}»`);
    if (after === r.tt) continue;
    say(`  ${r.tag}`);
    say(`      «${r.tt}»`);
    say(`   →  «${after}»`);
    for (const w of changed) allWords.set(w, (allWords.get(w) || 0) + 1);
    if (APPLY) await q(`UPDATE "${spec.t}" SET "titleTranslated"=$1 WHERE id=$2`, [after, r.id]);
    n++;
  }
  say(`  ${APPLY ? '✔ ислоҳ шуд' : '[хушк] ислоҳ МЕШУД'}: ${n} аз ${rows.length}`);
  total += n;
}

// ── Ҷадвалҳои ҲИКОЯ — қасдан даст нахӯрдаанд, вале НИШОН дода мешаванд ─────
head('Қасдан ДАСТ НАХӮРДА — унвони ҳикоя (номи қаҳрамон дорад)');
for (const [t, sel] of [
  ['ComprehensionExercise', `SELECT id, "titleTranslated" tt, kind tag FROM "ComprehensionExercise" WHERE "courseId"='${COURSE}' ORDER BY "order"`],
  ['Dialogue', `SELECT id, "titleTranslated" tt, 'DL' tag FROM "Dialogue" WHERE "courseId"='${COURSE}' ORDER BY "order"`],
]) {
  for (const r of await q(sel)) {
    const { after, changed, skipped } = fixTitleCase(r.tt || '');
    // ду ҳолат: (а) [PROTECTED] онро нигоҳ дошт, (б) баъд аз пайвандак аст,
    // вале ҷадвал ҳикоягӣ аст — ҳарду бояд ДИДА шаванд, на хомӯш монанд.
    if (skipped.length) say(`  ⊘ ${t} «${r.tt}» — ${JSON.stringify(skipped)} дар рӯйхати НОМҲО`);
    else if (after !== r.tt) say(`  ⊘ ${t} «${r.tt}» — «${changed.join(', ')}» эҳтимол НОМ аст, ҷадвали ҳикоя даст намехӯрад`);
  }
}

// Дар ин ду ҷадвал ҳарфи калон баъд аз ИЗОФА низ ҳаст («Рӯзи серкори Карим»),
// ки умуман ба қоидаи пайвандак намеафтад — вале ҳамон гурӯҳи хатар аст,
// пас алоҳида нишон дода мешавад.
const izafat = await q(`SELECT "titleTranslated" tt FROM "ComprehensionExercise"
  WHERE "courseId"='${COURSE}' AND "titleTranslated" ~ '\\s[А-ЯЁҒҲҚҶӢӮЪЎ]' ORDER BY "order"`);
if (izafat.length) {
  say(`\n  Боз ${izafat.length} унвони ҳикоя бо ҳарфи калон дар мобайн (номи қаҳрамон):`);
  izafat.forEach((r) => say(`      «${r.tt}»`));
}

if (APPLY && total) {
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  say('\ncontent_version ламс шуд.');
}

// ── Худсанҷӣ ───────────────────────────────────────────────────────────────
head('Худсанҷӣ');
say('  калимаҳое, ки хурд шуданд:');
[...allWords.entries()].sort().forEach(([w, n]) => say(`      ${String(n).padStart(3)}  ${w} → ${w[0].toLowerCase() + w.slice(1)}`));

for (const spec of TABLES) {
  const rows = await q(spec.sel);
  const left = rows.filter((r) => fixTitleCase(r.tt || '').after !== r.tt).length;
  say(`  ${spec.t}: ${left} унвони боқимонда   (ҳадаф 0)`);
}

say();
say(APPLY ? `✔ ТАМОМ — ${total} унвон ислоҳ шуд.`
          : `[хушк] ${total} унвон ислоҳ МЕШУД. Барои навиштан: --apply`);
