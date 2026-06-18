// seed_russian_alphabet_fix.js — ислоҳи талаффузи дубора:
// targetWord-и алифборо ба ЯК ҲАРФИ ягона табдил медиҳем (на «Ё ё»),
// то TTS ҳарфро як бор хонад.  Курс: cmq95o7ic..., Модул 0: cmqan0u4g008fs2t1vjktmjgj
const https = require('https');
const API_KEY = 'fed7e7577c761a598966f5a3f04a5b36fb3cea6fb4b6aca9a002a75f47a7f574d5fe49645fd78b75b3e53ff1fad892ad';
const MODULE_ID = 'cmqan0u4g008fs2t1vjktmjgj';

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body), 'utf8') : null;
    const req = https.request({ hostname: 'admin.ramz.tj', path, method,
      headers: { 'x-admin-api-key': API_KEY, 'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': payload.length } : {}) } }, res => {
      let d = Buffer.alloc(0);
      res.on('data', c => d = Buffer.concat([d, c]));
      res.on('end', () => { try { resolve(JSON.parse(d.toString('utf8'))); } catch(e){ resolve(d.toString('utf8')); } });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// калидҳо аз рӯи order-и дарс
const BYORDER = {
  0: [ // садонокҳо
    { w:'А', t:'Ҳарфи А/а — садои [а]', e:'🅰️', ipa:'[а]', ex:'Мама', exT:'Модар' },
    { w:'Е', t:'Ҳарфи Е/е — садои [йэ]', e:'🌲', ipa:'[йэ]', ex:'Небо', exT:'Осмон' },
    { w:'Ё', t:'Ҳарфи Ё/ё — садои [йо] (ҳамеша зада)', e:'🎄', ipa:'[йо]', ex:'Ёлка', exT:'Арчаи солинавӣ' },
    { w:'И', t:'Ҳарфи И/и — садои [и]', e:'📛', ipa:'[и]', ex:'Имя', exT:'Ном' },
    { w:'О', t:'Ҳарфи О/о — садои [о]', e:'⭕', ipa:'[о]', ex:'Окно', exT:'Тиреза' },
    { w:'У', t:'Ҳарфи У/у — садои [у]', e:'🌅', ipa:'[у]', ex:'Утро', exT:'Субҳ' },
    { w:'Ы', t:'Ҳарфи Ы/ы — садои [ы] (дар тоҷикӣ нест!)', e:'👦', ipa:'[ы]', ex:'Сын', exT:'Писар' },
    { w:'Э', t:'Ҳарфи Э/э — садои [э]', e:'👉', ipa:'[э]', ex:'Это', exT:'Ин аст' },
    { w:'Ю', t:'Ҳарфи Ю/ю — садои [йу]', e:'🧭', ipa:'[йу]', ex:'Юг', exT:'Ҷануб' },
    { w:'Я', t:'Ҳарфи Я/я — садои [йа] (ва маънои «ман»)', e:'🙋', ipa:'[йа]', ex:'Я', exT:'Ман' },
  ],
  1: [ // ҳамсадоҳо 1
    { w:'Б', t:'Ҳарфи Б/б — садои [б]', e:'👦', ipa:'[бэ]', ex:'Брат', exT:'Бародар' },
    { w:'В', t:'Ҳарфи В/в — садои [в]', e:'💧', ipa:'[вэ]', ex:'Вода', exT:'Об' },
    { w:'Г', t:'Ҳарфи Г/г — садои [г]', e:'🏙️', ipa:'[гэ]', ex:'Город', exT:'Шаҳр' },
    { w:'Д', t:'Ҳарфи Д/д — садои [д]', e:'🏠', ipa:'[дэ]', ex:'Дом', exT:'Хона' },
    { w:'Ж', t:'Ҳарфи Ж/ж — садои [ж]', e:'👰', ipa:'[жэ]', ex:'Жена', exT:'Ҳамсар (зан)' },
    { w:'З', t:'Ҳарфи З/з — садои [з]', e:'❄️', ipa:'[зэ]', ex:'Зима', exT:'Зимистон' },
    { w:'Й', t:'Ҳарфи Й/й — нимсадонок [й]', e:'🍵', ipa:'[й]', ex:'Чай', exT:'Чой' },
    { w:'К', t:'Ҳарфи К/к — садои [к]', e:'🐱', ipa:'[ка]', ex:'Кот', exT:'Гурба' },
    { w:'Л', t:'Ҳарфи Л/л — садои [л]', e:'🌲', ipa:'[эл]', ex:'Лес', exT:'Ҷангал' },
    { w:'М', t:'Ҳарфи М/м — садои [м]', e:'👩', ipa:'[эм]', ex:'Мама', exT:'Модар' },
    { w:'Н', t:'Ҳарфи Н/н — садои [н]', e:'🌙', ipa:'[эн]', ex:'Ночь', exT:'Шаб' },
  ],
  2: [ // ҳамсадоҳо 2 + аломатҳо
    { w:'П', t:'Ҳарфи П/п — садои [п]', e:'👨', ipa:'[пэ]', ex:'Папа', exT:'Падар' },
    { w:'Р', t:'Ҳарфи Р/р — садои [р]', e:'✋', ipa:'[эр]', ex:'Рука', exT:'Даст' },
    { w:'С', t:'Ҳарфи С/с — садои [с]', e:'🧀', ipa:'[эс]', ex:'Сыр', exT:'Панир' },
    { w:'Т', t:'Ҳарфи Т/т — садои [т]', e:'🪑', ipa:'[тэ]', ex:'Стол', exT:'Миз' },
    { w:'Ф', t:'Ҳарфи Ф/ф — садои [ф]', e:'📷', ipa:'[эф]', ex:'Фото', exT:'Акс' },
    { w:'Х', t:'Ҳарфи Х/х — садои [х]', e:'🍞', ipa:'[ха]', ex:'Хлеб', exT:'Нон' },
    { w:'Ц', t:'Ҳарфи Ц/ц — садои [тс]', e:'🏷️', ipa:'[цэ]', ex:'Цена', exT:'Нарх' },
    { w:'Ч', t:'Ҳарфи Ч/ч — садои [ч]', e:'🕐', ipa:'[чэ]', ex:'Час', exT:'Соат' },
    { w:'Ш', t:'Ҳарфи Ш/ш — садои [ш]', e:'🏫', ipa:'[ша]', ex:'Школа', exT:'Мактаб' },
    { w:'Щ', t:'Ҳарфи Щ/щ — [щ] (ш-и нарму дароз)', e:'🍲', ipa:'[ща]', ex:'Щи', exT:'Шӯрбои карам' },
    { w:'Ъ', t:'Аломати САХТ — садо надорад, ҷудо мекунад', e:'🚧', ipa:'—', ex:'Объект', exT:'Объект' },
    { w:'Ь', t:'Аломати НАРМ — ҳамсадоро нарм мекунад', e:'🕊️', ipa:'—', ex:'День', exT:'Рӯз' },
  ],
};

// Дарси мавҷудаи «Ҳарфҳои хоси русӣ» — ҳамоно ба як ҳарф табдил медиҳем
const SPECIAL_ID = 'cmqan0un9008hs2t1qsjo8apb';
const SPECIAL = [
  { w:'Э', t:'Садоноки Э/э — [э]', e:'👉', ipa:'[э]', ex:'Это', exT:'Ин аст' },
  { w:'Ы', t:'Садоноки Ы/ы — [ы] (дар тоҷикӣ нест)', e:'👦', ipa:'[ы]', ex:'Сын', exT:'Писар' },
  { w:'Ё', t:'Ҳарфи Ё/ё — [йо]', e:'🎄', ipa:'[йо]', ex:'Ёлка', exT:'Арчаи солинавӣ' },
  { w:'Ю', t:'Ҳарфи Ю/ю — [йу]', e:'🧭', ipa:'[йу]', ex:'Юг', exT:'Ҷануб' },
  { w:'Я', t:'Ҳарфи Я/я — [йа] (ва «ман»)', e:'🙋', ipa:'[йа]', ex:'Я', exT:'Ман' },
  { w:'Щ', t:'Ҳарфи Щ/щ — [щ] (ш-и нарм)', e:'🍲', ipa:'[ща]', ex:'Щи', exT:'Шӯрбои карам' },
  { w:'Ъ', t:'Аломати сахт — садо надорад', e:'🚧', ipa:'—', ex:'Объект', exT:'Объект' },
  { w:'Ц', t:'Ҳарфи Ц/ц — [тс]', e:'🏷️', ipa:'[цэ]', ex:'Цена', exT:'Нарх' },
];

async function fill(lessonId, words, label) {
  const r = await api('POST', '/api/admin/words/bulk', {
    lessonId, mode: 'replace',
    words: words.map((x, i) => ({
      word: x.w, translation: x.t, emoji: x.e, ipa: x.ipa || undefined,
      example: x.ex, exampleTrans: x.exT, difficulty: 1, order: i,
    })),
  });
  console.log('  ' + (r.error ? '❌ ' + JSON.stringify(r) : '✅ ' + label + ' — ' + (r.count ?? words.length) + ' ҳарф'));
}

async function run() {
  console.log('🇷🇺 Ислоҳи талаффузи дубораи алифбо (як ҳарф = як хониш)\n');
  const les = await api('GET', '/api/admin/lessons?moduleId=' + MODULE_ID);
  const arr = (les.lessons || les);

  for (const order of [0, 1, 2]) {
    const lesson = arr.find(l => l.order === order && (l.titleTranslated || l.title || '').startsWith('Алифбо'));
    if (!lesson) { console.error('  ⚠️  Дарси order=' + order + ' ёфт нашуд'); continue; }
    await fill(lesson.id, BYORDER[order], (lesson.titleTranslated || lesson.title).slice(0, 26));
  }
  await fill(SPECIAL_ID, SPECIAL, 'Ҳарфҳои хоси русӣ');

  console.log('\n✅ Тамом! Акнун ҳар ҳарф як бор бо овози ru-RU хонда мешавад.');
}
run().catch(console.error);
