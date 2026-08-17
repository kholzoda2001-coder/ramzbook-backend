// Сатҳсанҷии олмонӣ (de → tg) — ТАНҲО ДУ САТҲ: A1 ва A2.
//
// Чаро ду сатҳ: муҳаррики `lib/placement.ts` аз сатҳи пасттарин боло мебарояд
// ва дар аввалин сатҳи афтода меистад; сатҳҳои бесавол тамоман сарфи назар
// мешаванд. Пас 10 саволи A1 + 10 саволи A2 маҳз ду натиҷа медиҳад: A1 ё A2.
// Дар забонҳои дигар 3–4 сатҳ ҳаст, вале дар олмонӣ ҳоло танҳо курси A1 сохта
// мешавад — саволи B1/B2 бе курс маъно надорад.
//
// Таносуби маҳоратҳо ҳамон аст, ки англисӣ/арабӣ доранд:
//   A1 = 5 grammar + 3 vocab + 2 reading   A2 = 6 grammar + 3 vocab + 1 reading
// Ҳадди гузариш 0.85 (`DEFAULT_PASS_THRESHOLD`) → 9 аз 10.
//
//   node prisma/_de-placement.mjs          # месозад ва месанҷад
//   node prisma/_de-placement.mjs --check  # танҳо месанҷад
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const BASE = 'https://admin.ramz.tj';
const DE = 'cmqdhvfj200001z591mfrnj4z';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const CHECK_ONLY = process.argv.includes('--check');

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

const Q = [
  // ── A1: sein, ҷонишинҳо, артиклҳо, калимаҳои савол, рақамҳо ──────────────
  { level: 'A1', skill: 'grammar', order: 1,
    prompt: 'Ich ___ Student.', promptTranslated: 'Ман донишҷӯ ҳастам.',
    options: ['bin', 'bist', 'ist', 'sind'], answer: 'bin',
    explanation: 'Бо «ich» ҳамеша «bin» меояд.' },
  { level: 'A1', skill: 'vocab', order: 2,
    prompt: 'Was heißt «китоб» auf Deutsch?', promptTranslated: '«Китоб» ба забони олмонӣ чӣ мешавад?',
    options: ['das Buch', 'das Auto', 'das Haus', 'die Schule'], answer: 'das Buch',
    explanation: '«Das Buch» = китоб.' },
  { level: 'A1', skill: 'grammar', order: 3,
    prompt: 'Du ___ mein Freund.', promptTranslated: 'Ту дӯсти ман ҳастӣ.',
    options: ['bist', 'bin', 'ist', 'seid'], answer: 'bist',
    explanation: 'Бо «du» шакли «bist» меояд.' },
  { level: 'A1', skill: 'vocab', order: 4,
    prompt: 'Was bedeutet «Danke»?', promptTranslated: '«Danke» чӣ маъно дорад?',
    options: ['хайр', 'ташаккур', 'салом', 'лутфан'], answer: 'ташаккур',
    explanation: '«Danke» = ташаккур.' },
  { level: 'A1', skill: 'grammar', order: 5,
    prompt: 'Anna ___ Lehrerin.', promptTranslated: 'Анна муаллима аст.',
    options: ['ist', 'bin', 'bist', 'sind'], answer: 'ist',
    explanation: 'Бо шахси сеюми танҳо «ist» меояд.' },
  { level: 'A1', skill: 'grammar', order: 6,
    prompt: '___ heißt du?', promptTranslated: 'Номи ту чист?',
    options: ['Wie', 'Wo', 'Wer', 'Was'], answer: 'Wie',
    explanation: 'Дар олмонӣ ном бо «Wie heißt du?» пурсида мешавад, на бо «Was».' },
  { level: 'A1', skill: 'grammar', order: 7,
    prompt: '___ Buch ist neu.', promptTranslated: 'Китоб нав аст.',
    options: ['Das', 'Der', 'Die', 'Den'], answer: 'Das',
    explanation: '«Buch» ҷинси миёна дорад → артикли «das».' },
  { level: 'A1', skill: 'vocab', order: 8,
    prompt: 'Was heißt «панҷ» auf Deutsch?', promptTranslated: '«Панҷ» ба забони олмонӣ чӣ мешавад?',
    options: ['fünf', 'vier', 'sechs', 'sieben'], answer: 'fünf',
    explanation: '«Fünf» = панҷ (vier = чор, sechs = шаш, sieben = ҳафт).' },
  { level: 'A1', skill: 'reading', order: 9,
    prompt: 'Ich heiße Lena. Ich bin zehn Jahre alt.\nWie alt ist Lena?',
    promptTranslated: 'Лена чандсола аст?',
    options: ['10', '7', '9', '12'], answer: '10',
    explanation: '«Zehn Jahre alt» = даҳсола.' },
  { level: 'A1', skill: 'reading', order: 10,
    prompt: 'Das ist mein Haus. Es ist klein und weiß.\nWie ist das Haus?',
    promptTranslated: 'Хона чӣ гуна аст?',
    options: ['хурд ва сафед', 'калон ва сурх', 'нав ва кабуд', 'кӯҳна ва сиёҳ'], answer: 'хурд ва сафед',
    explanation: '«Klein» = хурд, «weiß» = сафед.' },

  // ── A2: замони ҳозира ва гузашта, феъли модалӣ, Akkusativ, муқоиса ───────
  { level: 'A2', skill: 'grammar', order: 11,
    prompt: 'Ich ___ jeden Tag in die Schule.', promptTranslated: 'Ман ҳар рӯз ба мактаб меравам.',
    options: ['gehe', 'gehst', 'geht', 'gegangen'], answer: 'gehe',
    explanation: 'Präsens бо «ich» — бандаки «-e»: gehe.' },
  { level: 'A2', skill: 'grammar', order: 12,
    prompt: 'Er ___ jeden Morgen Kaffee.', promptTranslated: 'Ӯ ҳар субҳ қаҳва менӯшад.',
    options: ['trinkt', 'trinke', 'trinken', 'trinkst'], answer: 'trinkt',
    explanation: 'Präsens, шахси сеюми танҳо — бандаки «-t»: trinkt.' },
  { level: 'A2', skill: 'grammar', order: 13,
    prompt: 'Gestern ___ ich einen Film gesehen.', promptTranslated: 'Дирӯз ман филм дидам.',
    options: ['habe', 'hat', 'bin', 'ist'], answer: 'habe',
    explanation: 'Perfekt бо «haben» сохта мешавад ва бо «ich» шакли «habe» мегирад.' },
  { level: 'A2', skill: 'grammar', order: 14,
    prompt: 'Ich ___ gut Deutsch sprechen.', promptTranslated: 'Ман олмониро хуб гуфта метавонам.',
    options: ['kann', 'kannst', 'können', 'gekonnt'], answer: 'kann',
    explanation: 'Феъли модалии «können» бо «ich» шакли «kann» мегирад.' },
  { level: 'A2', skill: 'grammar', order: 15,
    prompt: 'Ich habe ___ Bruder.', promptTranslated: 'Ман як бародар дорам.',
    options: ['einen', 'ein', 'eine', 'einem'], answer: 'einen',
    explanation: '«Bruder» мардона аст ва баъди «haben» падежи Akkusativ меояд → «einen».' },
  { level: 'A2', skill: 'grammar', order: 16,
    prompt: 'Sie ist ___ als ihr Bruder.', promptTranslated: 'Ӯ аз бародараш қадбаландтар аст.',
    options: ['größer', 'groß', 'am größten', 'mehr groß'], answer: 'größer',
    explanation: 'Дараҷаи қиёсӣ: groß → größer (бо «als»).' },
  { level: 'A2', skill: 'vocab', order: 17,
    prompt: 'Was bedeutet «schön»?', promptTranslated: '«Schön» чӣ маъно дорад?',
    options: ['бад', 'зебо / қашанг', 'калон', 'тез'], answer: 'зебо / қашанг',
    explanation: '«Schön» = зебо, қашанг.' },
  { level: 'A2', skill: 'vocab', order: 18,
    prompt: 'Was ist das Gegenteil von «heiß»?', promptTranslated: 'Муқобили «heiß» чист?',
    options: ['warm', 'kalt', 'kühl', 'dunkel'], answer: 'kalt',
    explanation: '«Heiß» (гарм) — муқобилаш «kalt» (хунук); «warm» ва «kühl» дараҷаҳои мобайнианд.' },
  { level: 'A2', skill: 'vocab', order: 19,
    prompt: 'Was bedeutet «teuer»?', promptTranslated: '«Teuer» чӣ маъно дорад?',
    options: ['қиматбаҳо', 'арзон', 'зебо', 'душвор'], answer: 'қиматбаҳо',
    explanation: '«Teuer» = қиматбаҳо; муқобилаш «billig» (арзон).' },
  { level: 'A2', skill: 'reading', order: 20,
    prompt: 'Ali arbeitet von Montag bis Freitag. Am Samstag besucht er seine Eltern.\nWas macht Ali am Samstag?',
    promptTranslated: 'Алӣ рӯзи шанбе чӣ мекунад?',
    options: ['ба назди волидайн меравад', 'кор мекунад', 'дар хона мехобад', 'ба мактаб меравад'],
    answer: 'ба назди волидайн меравад',
    explanation: '«Besucht seine Eltern» = ба назди волидайнаш меравад.' },
];

// ── 0. Санҷиши мантиқии рӯйхат пеш аз навиштан ──────────────────────────────
{
  let bad = 0;
  const seen = new Set();
  for (const q of Q) {
    const errs = [];
    if (q.options.length !== 4) errs.push('4 вариант нест');
    if (new Set(q.options).size !== q.options.length) errs.push('варианти такрорӣ');
    if (!q.options.includes(q.answer)) errs.push('ҷавоб дар вариантҳо нест');
    if (!q.promptTranslated?.trim()) errs.push('тарҷумаи савол нест');
    if (!q.explanation?.trim()) errs.push('тавзеҳ нест');
    if (seen.has(q.prompt)) errs.push('саволи такрорӣ');
    seen.add(q.prompt);
    if (errs.length) { bad++; console.log(`  ✗ #${q.order}: ${errs.join(', ')}`); }
  }
  const byLevel = Q.reduce((a, q) => ((a[q.level] = (a[q.level] ?? 0) + 1), a), {});
  if (Object.keys(byLevel).length !== 2) { console.log(`  ✗ бояд маҳз 2 сатҳ бошад, ҳаст: ${Object.keys(byLevel)}`); bad++; }
  for (const [lvl, n] of Object.entries(byLevel)) if (n !== 10) { console.log(`  ✗ ${lvl}: ${n} савол (бояд 10)`); bad++; }
  if (bad) { console.error(`\nРӯйхат ${bad} хато дорад — навишта нашуд.`); process.exit(1); }
  console.log(`✓ Рӯйхат тоза: ${Q.length} савол, ${JSON.stringify(byLevel)}`);
}

const list = async () => (await (await fetch(
  `${BASE}/api/admin/placement?targetLanguageId=${DE}&nativeLanguageId=${TG}`, { headers: H })).json()).questions;

// ── 1. Навиштан ─────────────────────────────────────────────────────────────
if (!CHECK_ONLY) {
  console.log('\n== Қадами 1: сабт ==');
  const existing = new Set((await list()).map(q => q.prompt));
  for (const q of Q) {
    if (existing.has(q.prompt)) { console.log(`  = #${q.order} аллакай ҳаст`); continue; }
    const res = await fetch(`${BASE}/api/admin/placement`, {
      method: 'POST', headers: H,
      body: JSON.stringify({
        targetLanguageId: DE, nativeLanguageId: TG,
        cefrLevel: q.level, skill: q.skill, prompt: q.prompt,
        promptTranslated: q.promptTranslated, options: q.options, answer: q.answer,
        explanation: q.explanation, order: q.order, isActive: true,
      }),
    });
    console.log(res.ok ? `  ✓ ${q.level} #${q.order}` : `  ✗ ${q.level} #${q.order}: ${(await res.text()).slice(0, 140)}`);
  }
}

// ── 2. Санҷиши он чи хонанда мебинад ────────────────────────────────────────
console.log('\n== Қадами 2: чӣ ба барнома меравад ==');
const mob = await (await fetch(`${BASE}/api/mobile/placement?targetLanguageId=${DE}&nativeLanguageId=${TG}`)).json();
const qs = mob.questions ?? [];
console.log(`  саволҳо: ${qs.length} · тартиб: ${qs.map(q => q.cefrLevel).join(',')}`);
if (qs.some(q => q.answer !== undefined)) console.log('  ⚠ ҷавоби дуруст ба муштарӣ меравад!');
else console.log('  ✓ ҷавоби дуруст пинҳон аст (баҳогузорӣ дар сервер)');

// ── 3. Санҷиши баҳогузорӣ бо се сенария ─────────────────────────────────────
console.log('\n== Қадами 3: баҳогузорӣ ==');
const admin = await list();
const keyOf = new Map(admin.map(q => [q.id, q]));

async function score(pick, label, expect) {
  const answers = qs.map(q => {
    const full = keyOf.get(q.id);
    const wrong = (full.options ?? []).find(o => o !== full.answer) ?? '';
    return { questionId: q.id, selected: pick(full) ? full.answer : wrong };
  });
  const r = await (await fetch(`${BASE}/api/mobile/placement`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetLanguageId: DE, nativeLanguageId: TG, answers }),
  })).json();
  const ok = r.level === expect;
  console.log(`  ${ok ? '✓' : '✗'} ${label.padEnd(34)} → ${r.level} (интизор ${expect})  ${r.totalCorrect}/${r.totalQuestions}`);
  return ok;
}

// Ҳадди гузаришро аз ҷавоби худи сервер мегирем, на аз коди локалӣ: дар
// `lib/placement.ts` тағйири сабтнашуда ҳаст (0.85), вале сервер версияи
// сабтшударо бо 0.6 кор мекунад. Санҷиш бояд рафтори ВОҚЕЪИИ хонандаро тафтиш
// кунад, на нияти кодро.
const probe = await (await fetch(`${BASE}/api/mobile/placement`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetLanguageId: DE, nativeLanguageId: TG,
    answers: qs.map(q => ({ questionId: q.id, selected: keyOf.get(q.id).answer })),
  }),
})).json();
const TH = probe.passThreshold;
const pass = Math.ceil(TH * 10);      // камтарин шумораи ҷавоби дуруст барои гузаштан
console.log(`  ҳадди сервер: ${TH} → ${pass}/10 мегузарад, ${pass - 1}/10 не\n`);

let n = 0;
const scenario = async (a1n, a2n, expect) => {
  let a1 = 0, a2 = 0;
  const ok = await score(
    q => q.cefrLevel === 'A1' ? ++a1 <= a1n : ++a2 <= a2n,
    `A1 ${a1n}/10, A2 ${a2n}/10`, expect);
  if (!ok) n++;
};

await scenario(10, 10, 'A2');            // ҳамааш дуруст
await scenario(10, 0, 'A1');             // танҳо A1
await scenario(0, 0, 'A1');              // ҳамааш нодуруст → фарш
await scenario(10, pass, 'A2');          // маҳз дар ҳад
await scenario(10, pass - 1, 'A1');      // як ҷавоб камтар аз ҳад
// Муҳимтарин қоида: муваффақияти тасодуфӣ дар сатҳи боло, вақте сатҳи поён
// афтодааст, ба назар гирифта НАМЕШАВАД.
await scenario(pass - 1, 10, 'A1');

console.log(`\nМушкилот: ${n}`);
