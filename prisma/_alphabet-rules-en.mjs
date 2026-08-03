// English reading rules for the Alphabet screen (en → tg) — letter by letter.
//
// The first version of this file explained the THEORY (open vs closed
// syllables, stress, schwa). Correct, but useless at the moment a beginner is
// staring at a word: they don't ask "is this syllable open?", they ask "this A
// — how do I say it?". So every rule here is now one LETTER and all the
// situations it appears in, each with the reading spelled out in Tajik letters
// and two or three real words. Read top to bottom, a learner can decode any A1
// word without knowing a single grammatical term.
//
// The body is rendered by a plain Text widget: no markdown, but newlines work,
// so each situation gets its own line.

const KEY = 'fed7e7577c761a598966f5a3f04a5b36fb3cea6fb4b6aca9a002a75f47a7f574d5fe49645fd78b75b3e53ff1fad892ad';
const BASE = 'https://admin.ramz.tj/api/admin';
const EN = 'cmppaul1k0001xrdbc2woi3fj';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';

async function api(path, method = 'GET', body) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-api-key': KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status}: ${JSON.stringify(d)}`);
  return d;
}

const RULES = [
  // ── Таби АЛФАВИТ: се чизи асосӣ, ҳамин ва бас ──
  ['general', 'Аввал ин се чизро донед',
    '1. Ҳарф як ном дорад ва садои дигар. A номаш «эй», вале дар cat «а» мешавад.\n' +
    '2. Ҳамон ҳарф дар калимаҳои гуногун гуногун хонда мешавад.\n' +
    '3. Барои ҳамин ҳамеша тамоми калимаро бубинед, на як ҳарфро.'],
  ['general', 'Қоидаи №1: E-и охирин',
    'E дар охири калима худаш хонда НАМЕШАВАД, вале садоноки пеш аз худро иваз мекунад:\n' +
    'hat (ҳэт) → hate (ҳейт)\n' +
    'bit (бит) → bite (байт)\n' +
    'not (нот) → note (ноут)\n' +
    'cut (кат) → cute (кют)\n' +
    'Ин муҳимтарин қоидаи хониши англисист.'],
  ['general', 'Қоидаи №2: ҳарфи R',
    'R баъд аз садонок садоро тамоман дигар мекунад:\n' +
    'car (кар), her (ҳё), bird (бёд), for (фо), turn (тён)\n' +
    'Дар ин ҳолат қоидаҳои дигар кор намекунанд.'],
  ['general', 'Ҳар садонок ду садои асосӣ дорад',
    'КӮТОҲ — вақте баъд аз он ҳамсадо истад: cat, pen, sit, dog, cup\n' +
    'НОМИ ХУД — вақте калима бо e тамом шавад ё садонок дар охир бошад: name, he, like, note, my'],
  ['general', 'Дар ҳар калима як ҳиҷо баландтар хонда мешавад',
    'TEA-cher, com-PU-ter, a-BOUT\n' +
    'Ҳиҷои дигар суст ва норавшан мешавад. Барои ҳамин doctor «ДОКтэ» шунида мешавад, на «доктор».'],

  // ── Таби САДОНОКҲО: ҳарф ба ҳарф ──
  ['vowel', 'Ҳарфи A — 4 ҳолат',
    'A + ҳамсадо → «а»:  cat (кэт), bag (бэг), man (мэн)\n' +
    'A + ҳамсадо + e → «эй»:  name (нейм), cake (кейк), late (лейт)\n' +
    'A + r → «а»-и дароз:  car (кар), park (парк), star (стар)\n' +
    'A + l ё w → «о»:  ball (бол), all (ол), water (вотэ)'],
  ['vowel', 'Ҳарфи E — 4 ҳолат',
    'E + ҳамсадо → «е»:  pen (пен), red (ред), bed (бед)\n' +
    'E дар охири калима → ХОМӮШ:  name (нейм), like (лайк), nose (ноуз)\n' +
    'E + r → «ё»:  her (ҳё), term (тём), person (пёсн)\n' +
    'ee ё ea → «и»-и дароз:  see (си), tea (ти), week (вик)'],
  ['vowel', 'Ҳарфи I — 3 ҳолат',
    'I + ҳамсадо → «и»:  sit (сит), big (биг), fish (фиш)\n' +
    'I + ҳамсадо + e → «ай»:  like (лайк), time (тайм), nice (найс)\n' +
    'I + r → «ё»:  bird (бёд), girl (гёл), first (фёст)'],
  ['vowel', 'Ҳарфи O — 4 ҳолат',
    'O + ҳамсадо → «о»:  dog (дог), hot (ҳот), box (бокс)\n' +
    'O + ҳамсадо + e → «оу»:  note (ноут), home (ҳоум), nose (ноуз)\n' +
    'O + r → «о»-и дароз:  for (фо), short (шот), morning (монин)\n' +
    'Баъзе калимаҳо → «а»:  son (сан), love (лав), money (мани)'],
  ['vowel', 'Ҳарфи U — 4 ҳолат',
    'U + ҳамсадо → «а»:  cup (кап), bus (бас), sun (сан)\n' +
    'U + ҳамсадо + e → «ю»:  tube (тюб), cute (кют), use (юз)\n' +
    'U + r → «ё»:  turn (тён), burn (бён), nurse (нёс)\n' +
    'Баъзе калимаҳо → «у»:  put (пут), full (фул), push (пуш)'],
  ['vowel', 'Ҳарфи Y — 3 ҳолат',
    'Y дар АВВАЛИ калима → «й»:  yes (йес), you (ю), yellow (йелоу)\n' +
    'Y дар охири калимаи КӮТОҲ → «ай»:  my (май), fly (флай), why (вай)\n' +
    'Y дар охири калимаи ДАРОЗ → «и»:  happy (ҳэпи), city (сити), study (стади)'],
  ['vowel', 'Ду садонок якҷоя',
    'ee → «и»:  see (си), tree (три), green (грин)\n' +
    'ea → «и»:  tea (ти), eat (ит), read (рид)\n' +
    'ai ва ay → «эй»:  rain (рейн), day (дей), wait (вейт)\n' +
    'oa → «оу»:  boat (боут), road (роуд), coat (коут)\n' +
    'oo → «у»:  moon (мун), food (фуд)  /  кӯтоҳ:  book (бук), good (гуд)\n' +
    'ou ва ow → «ау»:  house (ҳаус), now (нау), down (даун)'],

  // ── Таби ҲАМСАДОҲО: ҳарф ба ҳарф ──
  ['consonant', 'Ҳарфи C — 2 ҳолат',
    'C пеш аз a, o, u → «к»:  cat (кэт), cup (кап), come (кам)\n' +
    'C пеш аз e, i, y → «с»:  city (сити), ice (айс), face (фейс)\n' +
    'ck → «к»:  black (блэк), duck (дак)'],
  ['consonant', 'Ҳарфи G — 2 ҳолат',
    'G пеш аз a, o, u → «г»:  go (гоу), game (гейм), gun (ган)\n' +
    'G пеш аз e, i, y → «ҷ»:  age (эйҷ), page (пейҷ), giant (ҷайэнт)\n' +
    'Истисно (ҳамеша «г»):  get (гет), give (гив), girl (гёл)'],
  ['consonant', 'Ҳарфи S — 2 ҳолат',
    'S дар аввали калима → «с»:  sun (сан), see (си), school (скул)\n' +
    'S байни садонокҳо ё дар охир баъд аз садои ҷарангдор → «з»:  his (ҳиз), music (мюзик), dogs (догз)'],
  ['consonant', 'TH — садое ки дар тоҷикӣ нест',
    'Нӯги забонро сабук байни дандонҳо мемонед.\n' +
    'Ҷарангдор (наздик ба «з»):  this (зис), that (зэт), the (зэ), mother (мазэ)\n' +
    'Беҷаранг (наздик ба «с»):  think (синк), three (сри), bath (бас)\n' +
    'Ҳатман бишнавед — «з» ва «с»-и тоҷикӣ айнан ҳамон нестанд.'],
  ['consonant', 'Ду ҳарф — як садо',
    'sh → «ш»:  she (ши), fish (фиш), shop (шоп)\n' +
    'ch → «ч»:  chair (чеэ), lunch (ланч), teacher (тичэ)\n' +
    'ph → «ф»:  phone (фоун), photo (фоуто)\n' +
    'wh → «в»:  what (вот), where (веэ), white (вайт)\n' +
    'qu → «кв»:  question (квесчэн), quick (квик)'],
  ['consonant', 'NG ва NK — садои бинӣ',
    'ng → садо аз бинӣ мебарояд, «г»-и охир қариб шунида намешавад:\n' +
    'sing (син), long (лон), morning (монин)\n' +
    'nk → think (синк), thank (сэнк), drink (дринк)'],
  ['consonant', 'Ҳарфҳое ки навишта мешаванд, вале хонда намешаванд',
    'k пеш аз n:  know (ноу), knife (найф)\n' +
    'w пеш аз r:  write (райт), wrong (рон)\n' +
    'l:  talk (ток), walk (вок), half (ҳаф)\n' +
    'h:  hour (ауэ), honest (онист)\n' +
    'b дар охир баъд аз m:  comb (коум), thumb (сам)'],
  ['consonant', 'Ҳамсадои дукарата — як садо',
    'letter (летэ), dinner (динэ), happy (ҳэпи), summer (самэ)\n' +
    'Ду ҳарф як садо медиҳад. Дукарата навишта мешавад, то садоноки пеш аз он КӮТОҲ монад.'],
  ['consonant', 'Бандаки -s дар охири калима',
    'Баъд аз садои беҷаранг (p, t, k, f) → «с»:  cats (кэтс), books (букс)\n' +
    'Баъд аз садои ҷарангдор ва садонок → «з»:  dogs (догз), boys (бойз), friends (френдз)\n' +
    'Баъд аз s, sh, ch, x → «из»:  buses (басиз), watches (вочиз)'],
  ['consonant', 'Бандаки -ed дар охири феъл',
    'Баъд аз t ё d → «ид»:  wanted (вонтид), needed (нидид)\n' +
    'Баъд аз садои беҷаранг → «т»:  worked (вокт), helped (ҳелпт)\n' +
    'Дар ҳамаи ҳолатҳои дигар → «д»:  played (плейд), lived (ливд)'],
];

// Idempotent: clear whatever is there for this pair, then write the set fresh.
const existing = (await api(`/alphabet-rules?targetLanguageId=${EN}&nativeLanguageId=${TG}`)).rules;
for (const r of existing) await api(`/alphabet-rules?id=${r.id}`, 'DELETE');
if (existing.length) console.log(`қоидаҳои кӯҳна ҳазф шуд: ${existing.length}`);

const counters = { general: 0, vowel: 0, consonant: 0 };
for (const [category, title, body] of RULES) {
  await api('/alphabet-rules', 'POST', {
    targetLanguageId: EN, nativeLanguageId: TG,
    category, title, body, order: counters[category]++,
  });
  console.log(`  ✓ [${category}] ${title}`);
}
console.log(`\n✅ ${RULES.length} қоида — Алфавит ${counters.general}, Садонокҳо ${counters.vowel}, Ҳамсадоҳо ${counters.consonant}`);
