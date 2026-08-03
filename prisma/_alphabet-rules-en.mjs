// English reading rules for the Alphabet screen (en → tg).
//
// The screen has had an empty "📘 Қоидаҳо" card since the feature was built:
// 26 letters were filled in, 0 rules. For a Tajik speaker this is the missing
// half — Tajik is read letter by letter, English is not, and nothing in the app
// said so. These 22 rules cover exactly the gap: why the letter's NAME differs
// from its SOUND, the short/long vowel split, and the consonant pairs (th, sh,
// ch, ng) that have no Tajik equivalent.
//
// Rendering is plain Text (no markdown), so the bodies use no ** markers —
// each is one short paragraph with real words and a Tajik reading hint.
// `category` places the rule on a tab: general = Алфавит, vowel = Садонокҳо,
// consonant = Ҳамсадоҳо.

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
  // ── Алфавит: how English reading works at all ──
  ['general', 'Номи ҳарф ва садои ҳарф ду чизи гуногунанд',
    'Ҳарфи A номаш «эй» аст, вале дар калимаи cat садои «а» медиҳад. Аз ин рӯ дар англисӣ аввал бояд бубинед, ки ҳарф дар кадом калима истодааст — баъд онро хонед.'],
  ['general', '26 ҳарф, вале 44 садо',
    'Ҳарфҳо аз садоҳо камтаранд. Барои ҳамин як ҳарф метавонад чанд садо диҳад, ва ду ҳарф якҷоя як садои тамоман нав созанд (th, sh, ch). Англисиро ҳарф-ба-ҳарф хондан мумкин нест — калимаро пурра бубинед.'],
  ['general', 'Ҳиҷои пӯшида ва кушода',
    'Агар баъд аз садонок ҳамсадо истад — садонок КӮТОҲ хонда мешавад: cat (кэт), sit (сит), dog (дог). Агар садонок дар охири ҳиҷо бошад — номи худро мегӯяд: he (ҳи), go (гоу), my (май).'],
  ['general', 'E-и хомӯш дар охири калима',
    'E-и охирин худаш хонда намешавад, вале садоноки пеш аз худро дароз мекунад: hat (ҳэт) → hate (ҳейт), bit (бит) → bite (байт), not (нот) → note (ноут), cut (кат) → cute (кют).'],
  ['general', 'Зада (ударение)',
    'Дар ҳар калимаи англисӣ як ҳиҷо баландтар ва равшантар хонда мешавад: TEAcher, comPUter, aBOUT. Ҳиҷои бе зада суст мешавад — ин барои фаҳмидани гуфтори табиӣ хеле муҳим аст.'],

  // ── Садонокҳо ──
  ['vowel', 'Панҷ садоноки кӯтоҳ',
    'a — cat (кэт), e — pen (пен), i — sit (сит), o — dog (дог), u — cup (кап). Ин садоҳо вақте меоянд, ки баъд аз садонок ҳамсадо истода бошад.'],
  ['vowel', 'Садоноки дароз — ҳарф номи худро мегӯяд',
    'Дар ҳиҷои кушода ё бо e-и хомӯш: a — name (нейм), e — he (ҳи), i — like (лайк), o — note (ноут), u — tube (тюб).'],
  ['vowel', 'Ду садонок паҳлӯи ҳам',
    'Одатан якум номи худро мегӯяд, дуюм хомӯш мемонад: ea — tea (ти), ee — see (си), ai — rain (рейн), oa — boat (боут), ay — day (дей).'],
  ['vowel', 'OO — ду садои гуногун',
    'Кӯтоҳ: book (бук), good (гуд), look (лук). Дароз: moon (мун), food (фуд), school (скул). Ин ҷо қоидаи қатъӣ нест — калимаҳоро бо шунидан ёд гиред.'],
  ['vowel', 'Y ҳам садонок шуда метавонад',
    'Дар охири калимаи кӯтоҳ — «ай»: my (май), fly (флай), why (вай). Дар охири калимаи дароз — «и»: happy (ҳэпи), city (сити), study (стади).'],
  ['vowel', 'R садоноки пеш аз худро тағйир медиҳад',
    'car (кар), her (ҳё), bird (бёд), for (фо), turn (тён). Дар ин ҳолат қоидаи кӯтоҳ/дароз кор намекунад — r садоро тамоман дигар мекунад.'],
  ['vowel', 'Садоноки бе зада норавшан мешавад',
    'Дар ҳиҷои бе зада ҳар садонок ба як садои сусти «э» табдил меёбад: teacher (ТИчэ), about (эБАУТ), doctor (ДОКтэ), banana (бэНАнэ).'],

  // ── Ҳамсадоҳо ──
  ['consonant', 'TH — садое ки дар тоҷикӣ нест',
    'Нӯги забонро байни дандонҳо мегузоред. Ду навъ дорад: ҷарангдор — this, that, the; беҷаранг — think, three, bath. «З» ва «С»-и тоҷикӣ наздиктаранд, вале айнан ҳамон нестанд — ҳатман бишнавед.'],
  ['consonant', 'SH ва CH',
    'sh — «ш»: she (ши), fish (фиш), shop (шоп). ch — «ч»: chair (чеэ), teacher (тичэ), lunch (ланч).'],
  ['consonant', 'C — ду садо',
    'Пеш аз a, o, u — «к»: cat (кэт), cup (кап), come (кам). Пеш аз e, i, y — «с»: city (сити), ice (айс), face (фейс).'],
  ['consonant', 'G — ду садо',
    'Пеш аз a, o, u — «г»: go (гоу), game (гейм), gun (ган). Пеш аз e, i, y — «ҷ»: age (эйҷ), page (пейҷ), giant (ҷайэнт). Истисно: get ва give «г» мемонанд.'],
  ['consonant', 'NG ва NK — садои бинӣ',
    'ng — садои бинӣ, «г»-и охир қариб шунида намешавад: sing (син), long (лон), morning (монин). nk — think (синк), thank (сэнк).'],
  ['consonant', 'PH, WH, QU',
    'ph — «ф»: phone (фоун), photo (фоуто). wh — «в»: what (вот), where (веэ), white (вайт). qu — «кв»: question (квесчэн), quick (квик).'],
  ['consonant', 'Ҳарфҳои хомӯш',
    'Баъзе ҳарфҳо навишта мешаванд, вале хонда намешаванд: know (ноу) — k хомӯш; write (райт) — w хомӯш; talk (ток) — l хомӯш; hour (ауэ) — h хомӯш.'],
  ['consonant', 'Ҳамсадои дукарата — як садо',
    'letter (летэ), dinner (динэ), happy (ҳэпи). Ду ҳарф як садо медиҳад, вале садоноки пеш аз он кӯтоҳ мемонад — маҳз барои ҳамин дукарата навишта мешавад.'],
  ['consonant', 'Бандаки -s дар охир',
    'Пас аз садои беҷаранг — «с»: cats (кэтс), books (букс). Пас аз садои ҷарангдор — «з»: dogs (догз), boys (бойз), friends (френдз).'],
  ['consonant', 'Бандаки -ed дар охир',
    'Пас аз t ё d — «ид»: wanted (вонтид), needed (нидид). Пас аз садои беҷаранг — «т»: worked (вокт), helped (ҳелпт). Дар дигар ҳолатҳо — «д»: played (плейд), lived (ливд).'],
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
console.log(`\n✅ ${RULES.length} қоида сохта шуд — general ${counters.general}, vowel ${counters.vowel}, consonant ${counters.consonant}`);
