// Мутобиқати ҷинси грамматикӣ дар тамоми матни арабии курс.
//
// Чаро: аудити сохторӣ ин хелро НАМЕБИНАД — ҳама майдонҳо пуранд, аудио ҳаст,
// ҷавоб дар вариантҳо ҳаст, вале ҷумла ғалат аст. Мисоли ёфтшуда дар имтиҳони
// модули 1: «هذا صديقتي سارة» — бояд «هَذِهِ» бошад, чунки «صديقة» занона аст.
// Маҳз ҳамин модул هذا/هذه-ро меомӯзонад, пас хато дуҷанда аст.
//
// Санҷиш: калимаи баъди ишорат/ҷонишин занона аст ё мардона.
//   занона  = бо ة тамом мешавад, ё дар рӯйхати истиснои занона
//   мардона = боқӣ
//
//   node prisma/_ar-gender-check.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = t => sql.query(t);
const COURSE = 'cmqdqfv7300021rcswj4fy6vf';

const bare = s => s.replace(/[ً-ٰٟۖ-ۭـ]/g, '');
const strip = w => bare(w).replace(/^(وال|فال|بال|كال|ال|و|ف|ب|ل)/, '');

// ⚠️ Санҷиш ҚАСДАН танг аст. Кӯшиши аввал «ҳар исмро» месанҷид ва 37 ҳушдор
// дод, ки 36-тояш ХАТО буд:
//   • пешоянду ҳиссача (من، في، بجانب، لا) исм нестанд;
//   • ҷамъи ҷондор набуда дар арабӣ «هذه» мегирад — طَمَاطِم، تَوَابِل، قَطَرَات;
//   • калимаи занона бо пасванди соҳибӣ ة-и худро ба ت иваз мекунад:
//     أخت+ي، صديقة+ي → أختي، صديقتي — ҳамон занона.
// Барои ҳамин ин ҷо ТАНҲО калимаҳое санҷида мешаванд, ки ҷинсашон бешубҳа аст.
const FEM = new Set([
  'أم', 'أخت', 'بنت', 'امرأة', 'زوجة', 'صديقة', 'معلمة', 'طالبة', 'طبيبة', 'جدة',
  'عمة', 'خالة', 'ابنة', 'زميلة', 'مديرة', 'ممرضة', 'أميرة', 'سيدة',
]);
const MASC = new Set([
  'رجل', 'ولد', 'صديق', 'أب', 'أخ', 'ابن', 'معلم', 'طالب', 'طبيب', 'جد', 'عم',
  'خال', 'زوج', 'مهندس', 'زميل', 'مدير', 'سائق', 'بائع', 'جار', 'ضيف', 'طفل',
]);
// Ҳамон калимаҳо бо пасванди соҳибӣ: أخت+ي → أختي, صديقة+ي → صديقتي.
const SUF = '(ي|ك|كِ|ه|ها|نا|كم|هم)?';
const reFem = new RegExp(`^(${[...FEM].map(w => bare(w).replace(/ة$/, '(ة|ت)')).join('|')})${SUF}$`);
const reMasc = new RegExp(`^(${[...MASC].map(bare).join('|')})${SUF}$`);

const genderOf = w => {
  const b = strip(w);
  if (reFem.test(b)) return 'f';
  if (reMasc.test(b)) return 'm';
  return null;   // номаълум — санҷида НАМЕШАВАД
};

// Ҷуфти «ишорат/ҷонишин → ҷинси интизорӣ»
const MARKERS = [
  ['هذا', 'm', 'هَذِهِ'], ['هذه', 'f', 'هَذَا'],
  ['ذلك', 'm', 'تِلْكَ'], ['تلك', 'f', 'ذَلِكَ'],
  ['هو', 'm', 'هِيَ'], ['هي', 'f', 'هُوَ'],
];

// Ҳама матни арабии курс — аз ҳар ҷое, ки хонанда мебинад.
const sources = [];
const push = (where, text) => { if (text && String(text).trim()) sources.push([where, String(text)]); };

for (const r of await q(`SELECT w.word, w.example, l."titleTranslated" les FROM "Word" w
  JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
  WHERE m."courseId"='${COURSE}' AND m."isActive"=true AND l."isActive"=true`)) push(`калимаи «${r.word}» (${r.les})`, r.example);

for (const r of await q(`SELECT c."titleTranslated" t, c.passage FROM "ComprehensionExercise" c WHERE c."courseId"='${COURSE}'`))
  push(`матни «${r.t}»`, r.passage);

for (const r of await q(`SELECT d."titleTranslated" t, x.text, x."order" FROM "DialogueLine" x
  JOIN "Dialogue" d ON x."dialogueId"=d.id WHERE d."courseId"='${COURSE}'`))
  push(`муколамаи «${r.t}» сатри ${r.order}`, r.text);

for (const r of await q(`SELECT t."titleTranslated" t, x.sentence FROM "GrammarExample" x
  JOIN "GrammarTopic" t ON x."topicId"=t.id WHERE t."courseId"='${COURSE}'`))
  push(`мисоли грамматикаи «${r.t}»`, r.sentence);

for (const r of await q(`SELECT t."titleTranslated" t, e.prompt, e.answer, e.options FROM "GrammarExercise" e
  JOIN "GrammarTopic" t ON e."topicId"=t.id WHERE t."courseId"='${COURSE}'`)) {
  push(`машқи «${r.t}» (савол)`, r.prompt);
  push(`машқи «${r.t}» (ҷавоб)`, r.answer);
  // ⚠️ Вариантҳои машқ ҚАСДАН метавонанд ғалат бошанд («Кадомаш дуруст аст?»
  // маҳз аз хонанда мехоҳад, ки «هَذَا اِمْرَأَةٌ»-ро рад кунад), пас онҳо
  // санҷида НАМЕШАВАНД — танҳо савол ва ҷавоби дуруст.
}

for (const r of await q(`SELECT c."titleTranslated" t, x.question, x.options FROM "ComprehensionQuestion" x
  JOIN "ComprehensionExercise" c ON x."exerciseId"=c.id WHERE c."courseId"='${COURSE}'`)) {
  push(`саволи «${r.t}»`, r.question);
  // Ҳамон сабаб: варианти ғалат қасдан ғалат аст.
}

console.log(`матнҳои санҷидашуда: ${sources.length}`);

const problems = [];
for (const [where, text] of sources) {
  const words = bare(text).split(/[\s،.,!?؟:;«»"()]+/).filter(Boolean);
  for (let i = 0; i < words.length - 1; i++) {
    const mk = MARKERS.find(([m]) => bare(m) === words[i] || m === words[i]);
    if (!mk) continue;
    const next = words[i + 1];
    if (!/^[ء-ي]{2,}$/.test(next)) continue;
    const g = genderOf(next);
    if (!g) continue;                     // ҷинсаш бешубҳа нест — намесанҷем
    if (g === mk[1]) continue;
    problems.push(`${where}: «${words[i]} ${next}» — «${next}» ${g === 'f' ? 'ЗАНОНА' : 'МАРДОНА'} аст, бояд «${mk[2]}» бошад\n      ${text.slice(0, 100)}`);
  }
}

if (!problems.length) console.log('✓ номутобиқатии ҷинс ёфт нашуд.');
else {
  console.log(`\n${problems.length} номутобиқатии эҳтимолӣ:\n`);
  for (const p of problems) console.log(`  • ${p}`);
}
