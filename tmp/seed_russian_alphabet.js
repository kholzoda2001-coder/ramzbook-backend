// seed_russian_alphabet.js — алифбои ПУРРАИ русӣ аз сифр + ҷонишинҳо
// Курси русӣ A1: cmq95o7ic0001qsy5l76202bw, Модули 0: cmqan0u4g008fs2t1vjktmjgj
const https = require('https');
const API_KEY = 'fed7e7577c761a598966f5a3f04a5b36fb3cea6fb4b6aca9a002a75f47a7f574d5fe49645fd78b75b3e53ff1fad892ad';
const MODULE_ID = 'cmqan0u4g008fs2t1vjktmjgj';

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body), 'utf8') : null;
    const req = https.request({
      hostname: 'admin.ramz.tj', path, method,
      headers: { 'x-admin-api-key': API_KEY, 'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': payload.length } : {}) },
    }, res => {
      let d = Buffer.alloc(0);
      res.on('data', c => d = Buffer.concat([d, c]));
      res.on('end', () => { try { resolve(JSON.parse(d.toString('utf8'))); } catch(e){ resolve(d.toString('utf8')); } });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Дарсҳои мавҷудаи Модули 0 — бояд ба поён тела дода шаванд (order +3)
const SHIFT = [
  { id: 'cmqan0un9008hs2t1qsjo8apb', order: 3 }, // Ҳарфҳои хоси русӣ
  { id: 'cmqan0vch008rs2t1d0txnxc6', order: 4 }, // Калимаҳои аввали русӣ
  { id: 'cmqan0vw30093s2t1yebuyhc0', order: 5 }, // Талаффуз: редуксия
  { id: 'cmqan0wck0095s2t1zrsblqpt', order: 6 }, // Ҷонишинҳои шахсӣ (холӣ → пур мекунем)
];
const PRONOUN_LESSON = 'cmqan0wck0095s2t1zrsblqpt';

// 3 дарси нав — алифбои пурраи русӣ (33 ҳарф)
const ALPHABET = [
  {
    title: 'Алифбо: садонокҳо (А, Е, Ё, И, О, У, Ы, Э, Ю, Я)',
    emoji: '🔤', order: 0,
    words: [
      { w: 'А а', t: 'Ҳарфи А — садои [а]', e: '🅰️', ipa: '/a/', ex: 'Мама', exT: 'Модар' },
      { w: 'Е е', t: 'Ҳарфи Е — садои [йэ]', e: '🌲', ipa: '/je/', ex: 'Небо', exT: 'Осмон' },
      { w: 'Ё ё', t: 'Ҳарфи Ё — садои [йо] (ҳамеша зада)', e: '🎄', ipa: '/jo/', ex: 'Ёлка', exT: 'Арчаи солинавӣ' },
      { w: 'И и', t: 'Ҳарфи И — садои [и]', e: '📛', ipa: '/i/', ex: 'Имя', exT: 'Ном' },
      { w: 'О о', t: 'Ҳарфи О — садои [о]', e: '⭕', ipa: '/o/', ex: 'Окно', exT: 'Тиреза' },
      { w: 'У у', t: 'Ҳарфи У — садои [у]', e: '🌅', ipa: '/u/', ex: 'Утро', exT: 'Субҳ' },
      { w: 'Ы ы', t: 'Ҳарфи Ы — садои [ы] (дар тоҷикӣ нест!)', e: '👦', ipa: '/ɨ/', ex: 'Сын', exT: 'Писар' },
      { w: 'Э э', t: 'Ҳарфи Э — садои [э]', e: '👉', ipa: '/ɛ/', ex: 'Это', exT: 'Ин аст' },
      { w: 'Ю ю', t: 'Ҳарфи Ю — садои [йу]', e: '🧭', ipa: '/ju/', ex: 'Юг', exT: 'Ҷануб' },
      { w: 'Я я', t: 'Ҳарфи Я — садои [йа] (ва маънои «ман»)', e: '🙋', ipa: '/ja/', ex: 'Я', exT: 'Ман' },
    ],
  },
  {
    title: 'Алифбо: ҳамсадоҳо — 1 (Б, В, Г, Д, Ж, З, Й, К, Л, М, Н)',
    emoji: '🔡', order: 1,
    words: [
      { w: 'Б б', t: 'Ҳарфи Б — садои [б]', e: '👦', ipa: '/b/', ex: 'Брат', exT: 'Бародар' },
      { w: 'В в', t: 'Ҳарфи В — садои [в]', e: '💧', ipa: '/v/', ex: 'Вода', exT: 'Об' },
      { w: 'Г г', t: 'Ҳарфи Г — садои [г]', e: '🏙️', ipa: '/g/', ex: 'Город', exT: 'Шаҳр' },
      { w: 'Д д', t: 'Ҳарфи Д — садои [д]', e: '🏠', ipa: '/d/', ex: 'Дом', exT: 'Хона' },
      { w: 'Ж ж', t: 'Ҳарфи Ж — садои [ж]', e: '👰', ipa: '/ʐ/', ex: 'Жена', exT: 'Ҳамсар (зан)' },
      { w: 'З з', t: 'Ҳарфи З — садои [з]', e: '❄️', ipa: '/z/', ex: 'Зима', exT: 'Зимистон' },
      { w: 'Й й', t: 'Ҳарфи Й — нимсадонок [й]', e: '🍵', ipa: '/j/', ex: 'Чай', exT: 'Чой' },
      { w: 'К к', t: 'Ҳарфи К — садои [к]', e: '🐱', ipa: '/k/', ex: 'Кот', exT: 'Гурба' },
      { w: 'Л л', t: 'Ҳарфи Л — садои [л]', e: '🌲', ipa: '/l/', ex: 'Лес', exT: 'Ҷангал' },
      { w: 'М м', t: 'Ҳарфи М — садои [м]', e: '👩', ipa: '/m/', ex: 'Мама', exT: 'Модар' },
      { w: 'Н н', t: 'Ҳарфи Н — садои [н]', e: '🌙', ipa: '/n/', ex: 'Ночь', exT: 'Шаб' },
    ],
  },
  {
    title: 'Алифбо: ҳамсадоҳо — 2 ва аломатҳо (П…Щ, Ъ, Ь)',
    emoji: '🔠', order: 2,
    words: [
      { w: 'П п', t: 'Ҳарфи П — садои [п]', e: '👨', ipa: '/p/', ex: 'Папа', exT: 'Падар' },
      { w: 'Р р', t: 'Ҳарфи Р — садои [р]', e: '✋', ipa: '/r/', ex: 'Рука', exT: 'Даст' },
      { w: 'С с', t: 'Ҳарфи С — садои [с]', e: '🧀', ipa: '/s/', ex: 'Сыр', exT: 'Панир' },
      { w: 'Т т', t: 'Ҳарфи Т — садои [т]', e: '🪑', ipa: '/t/', ex: 'Стол', exT: 'Миз' },
      { w: 'Ф ф', t: 'Ҳарфи Ф — садои [ф]', e: '📷', ipa: '/f/', ex: 'Фото', exT: 'Акс' },
      { w: 'Х х', t: 'Ҳарфи Х — садои [х]', e: '🍞', ipa: '/x/', ex: 'Хлеб', exT: 'Нон' },
      { w: 'Ц ц', t: 'Ҳарфи Ц — садои [тс]', e: '🏷️', ipa: '/ts/', ex: 'Цена', exT: 'Нарх' },
      { w: 'Ч ч', t: 'Ҳарфи Ч — садои [ч]', e: '🕐', ipa: '/tɕ/', ex: 'Час', exT: 'Соат' },
      { w: 'Ш ш', t: 'Ҳарфи Ш — садои [ш]', e: '🏫', ipa: '/ʂ/', ex: 'Школа', exT: 'Мактаб' },
      { w: 'Щ щ', t: 'Ҳарфи Щ — [щ] (ш-и нарму дароз)', e: '🍲', ipa: '/ɕː/', ex: 'Щи', exT: 'Шӯрбои карам' },
      { w: 'Ъ ъ', t: 'Аломати САХТ — садо надорад, ҷудо мекунад', e: '🚧', ipa: '—', ex: 'Объект', exT: 'Объект' },
      { w: 'Ь ь', t: 'Аломати НАРМ — ҳамсадоро нарм мекунад', e: '🕊️', ipa: '—', ex: 'День', exT: 'Рӯз' },
    ],
  },
];

// Ҷонишинҳои шахсӣ — пур кардани дарси холӣ
const PRONOUNS = [
  { w: 'я',   t: 'ман',            e: '🙋', ipa: '/ja/',   ex: 'Я студент.',   exT: 'Ман донишҷӯ ҳастам.' },
  { w: 'ты',  t: 'ту',            e: '👉', ipa: '/tɨ/',   ex: 'Ты дома?',      exT: 'Ту дар хона ҳастӣ?' },
  { w: 'он',  t: 'вай (мард)',    e: '👨', ipa: '/on/',   ex: 'Он мой брат.',  exT: 'Вай бародари ман аст.' },
  { w: 'она', t: 'вай (зан)',     e: '👩', ipa: '/ɐˈna/', ex: 'Она моя мама.', exT: 'Вай модари ман аст.' },
  { w: 'оно', t: 'вай (ашё/бечиз)', e: '📦', ipa: '/ɐˈno/', ex: 'Оно тут.',     exT: 'Он (ашё) ин ҷост.' },
  { w: 'мы',  t: 'мо',            e: '👥', ipa: '/mɨ/',   ex: 'Мы друзья.',    exT: 'Мо дӯстем.' },
  { w: 'вы',  t: 'шумо (эҳтиром/ҷамъ)', e: '🤝', ipa: '/vɨ/', ex: 'Вы откуда?', exT: 'Шумо аз куҷоед?' },
  { w: 'они', t: 'онҳо',          e: '👨‍👩‍👧‍👦', ipa: '/ɐˈni/', ex: 'Они здесь.',   exT: 'Онҳо ин ҷоянд.' },
];

async function run() {
  console.log('🇷🇺 Русӣ — алифбои пурра аз сифр + ҷонишинҳо\n');

  // 1) Дарсҳои мавҷударо ба поён тела медиҳем
  console.log('⏳ Тартиби дарсҳои кӯҳнаро тағйир медиҳем...');
  for (const s of SHIFT) {
    const r = await api('PUT', `/api/admin/lessons/${s.id}`, { order: s.order });
    console.log(`   ${s.id} → order ${s.order}  ${r.lesson ? '✅' : '⚠️ '+JSON.stringify(r)}`);
  }

  // 2) 3 дарси алифбо месозем
  console.log('\n⏳ Дарсҳои алифбо месозем...');
  for (const L of ALPHABET) {
    const lr = await api('POST', '/api/admin/lessons', {
      moduleId: MODULE_ID,
      title: L.title,
      titleTranslated: L.title,
      type: 'vocab',
      emoji: L.emoji,
      cefrLevel: 'A1',
      skillType: 'vocab',
      xpReward: 50,
      duration: 6,
      order: L.order,
      isPremium: false,
      isActive: true,
    });
    if (!lr.lesson) { console.error('   ❌', JSON.stringify(lr)); continue; }
    const lessonId = lr.lesson.id;
    const wr = await api('POST', '/api/admin/words/bulk', {
      lessonId, mode: 'replace',
      words: L.words.map((x, i) => ({
        word: x.w, translation: x.t, emoji: x.e, ipa: x.ipa,
        example: x.ex, exampleTrans: x.exT, difficulty: 1, order: i,
      })),
    });
    console.log(`   ✅ "${L.title.slice(0,28)}…" — ${wr.count ?? L.words.length} ҳарф`);
  }

  // 3) Дарси ҷонишинҳои холиро пур мекунем
  console.log('\n⏳ Дарси «Ҷонишинҳои шахсӣ»-ро пур мекунем...');
  const pr = await api('POST', '/api/admin/words/bulk', {
    lessonId: PRONOUN_LESSON, mode: 'replace',
    words: PRONOUNS.map((x, i) => ({
      word: x.w, translation: x.t, emoji: x.e, ipa: x.ipa,
      example: x.ex, exampleTrans: x.exT, difficulty: 1, order: i,
    })),
  });
  console.log(`   ✅ Ҷонишинҳо — ${pr.count ?? PRONOUNS.length} калима`);

  console.log('\n✅ Тамом! Курси русӣ акнун аз алифбои пурра (33 ҳарф) оғоз мешавад.');
  console.log('🔗 https://admin.ramz.tj/admin/courses/cmq95o7ic0001qsy5l76202bw');
}

run().catch(console.error);
