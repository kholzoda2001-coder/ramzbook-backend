// Бартараф кардани такрори мавзӯъ дар A1.
//
// Аудит чор такрори ҲАҚИҚӢ ёфт (на такрори спиралии дарсҳои «Writing/Review»,
// ки дуруст аст). Ба ҷои НЕСТ КАРДАНИ дарсҳо, калимаҳои такрориро бо
// калимаҳои НАВИ мувофиқи ҳамон мавзӯъ иваз мекунем — ҳам такрор мебарояд,
// ҳам луғати хонанда зиёд мешавад.
//
// 1) M2 «Numbers 1-20 Review and Usage» — 20 калима, ки АЙНАН M4 Дарсҳои 1-2-ро
//    такрор мекунанд, вале ПЕШ аз модули рақамҳо меоянд. Пас ин «такрор» не,
//    балки омӯзиши дукарата аст. Дарс ба «Personal Information» табдил меёбад —
//    маҳз он чи модули «About Me» надошт (ному насаб, суроға, телефон, касб).
// 2) M3 «People Around Me» — 5 аз 6 калима M1 «People»-ро такрор мекунанд.
// 3) M3 «Age And Family» — Young/Old/Birthday-и M2 «Age Basics»-ро такрор.
// 4) M9 «Direction Words» — Near/Next To/Between-и M7 «Places And Positions».
import { SignJWT } from 'jose';
import { readFileSync, writeFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const BASE = 'https://admin.ramz.tj';
const TG = 'cmpk1cr9o0000bo0h1mheyoad', EN = 'cmppaul1k0001xrdbc2woi3fj';

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('3h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };
const j = async p => (await fetch(`${BASE}/api/mobile${p}`)).json();

// [калимаи кӯҳна] → [нав, тарҷума, эмоҷӣ, hissa, ipaTajik, мисол, тарҷумаи мисол]
const M2_PERSONAL = [
  ['One',       ['Name',        'Ном',              '🏷',  'noun', 'нейм',        'My name is Ali.',            'Номи ман Алӣ аст.']],
  ['Two',       ['Surname',     'Насаб',            '📛',  'noun', 'сӯрнейм',     'My surname is Karimov.',     'Насаби ман Каримов аст.']],
  ['Three',     ['Address',     'Суроға',           '🏠',  'noun', 'адрес',       'What is your address?',      'Суроғаи шумо чист?']],
  ['Four',      ['Street',      'Кӯча',             '🛣',  'noun', 'стрит',       'I live on Rudaki Street.',   'Ман дар кӯчаи Рӯдакӣ зиндагӣ мекунам.']],
  ['Five',      ['Phone',       'Телефон',          '📱',  'noun', 'фоун',        'This is my phone number.',   'Ин рақами телефони ман аст.']],
  ['Six',       ['Email',       'Почтаи электронӣ', '📧',  'noun', 'имейл',       'My email is ali@mail.com.',  'Почтаи ман ali@mail.com аст.']],
  ['Seven',     ['Job',         'Кор, касб',        '💼',  'noun', 'ҷоб',         'What is your job?',          'Касби шумо чист?']],
  ['Eight',     ['Work',        'Кор кардан',       '🧑‍🏭', 'verb', 'ворк',        'I work in a bank.',          'Ман дар бонк кор мекунам.']],
  ['Nine',      ['Doctor',      'Духтур',           '🩺',  'noun', 'доктор',      'My father is a doctor.',     'Падари ман духтур аст.']],
  ['Ten',       ['Teacher',     'Муаллим',          '👩‍🏫', 'noun', 'тичер',       'She is a teacher.',          'Вай муаллима аст.']],
  ['Eleven',    ['Engineer',    'Муҳандис',         '👷',  'noun', 'инҷиниёр',    'He is an engineer.',         'Вай муҳандис аст.']],
  ['Twelve',    ['Driver',      'Ронанда',          '🚕',  'noun', 'драйвер',     'My uncle is a driver.',      'Амаки ман ронанда аст.']],
  ['Thirteen',  ['Cook',        'Ошпаз',            '👨‍🍳', 'noun', 'кук',         'He is a cook.',              'Вай ошпаз аст.']],
  ['Fourteen',  ['Nurse',       'Ҳамшираи тиббӣ',   '👩‍⚕', 'noun', 'нёрс',        'My sister is a nurse.',      'Хоҳари ман ҳамшираи тиббӣ аст.']],
  ['Fifteen',   ['Farmer',      'Деҳқон',           '🧑‍🌾', 'noun', 'фармер',      'My grandfather is a farmer.','Бобои ман деҳқон аст.']],
  ['Sixteen',   ['Married',     'Оиладор',          '💍',  'adjective', 'мэрид',   'My brother is married.',     'Бародари ман оиладор аст.']],
  ['Seventeen', ['Single',      'Муҷаррад',         '🙋',  'adjective', 'сингл',   'I am single.',               'Ман муҷаррад ҳастам.']],
  ['Eighteen',  ['Neighbour',   'Ҳамсоя',           '🏘',  'noun', 'нейбор',      'My neighbour is kind.',      'Ҳамсояи ман меҳрубон аст.']],
  ['Nineteen',  ['Classmate',   'Ҳамсинф',          '🧑‍🎓', 'noun', 'класмейт',    'He is my classmate.',        'Вай ҳамсинфи ман аст.']],
  ['Twenty',    ['Guest',       'Меҳмон',           '🚪',  'noun', 'гест',        'We have a guest today.',     'Имрӯз мо меҳмон дорем.']],
];

const M3_PEOPLE = [
  ['Man',    ['Stranger',  'Бегона',       '🚶', 'noun', 'стрейнҷер', 'Do not talk to a stranger.', 'Бо бегона гап назан.']],
  ['Woman',  ['Colleague', 'Ҳамкор',       '🤝', 'noun', 'колиг',     'She is my colleague.',       'Вай ҳамкори ман аст.']],
  ['Boy',    ['Group',     'Гурӯҳ',        '👨‍👩‍👦', 'noun', 'груп',   'We are a group of friends.', 'Мо гурӯҳи дӯстон ҳастем.']],
  ['Girl',   ['Team',      'Даста',        '⚽', 'noun', 'тим',       'Our team is strong.',        'Дастаи мо пурзӯр аст.']],
  ['Friend', ['Everyone',  'Ҳама',         '🙌', 'pronoun', 'эвривон', 'Everyone is here.',        'Ҳама ин ҷо ҳастанд.']],
];

const M3_AGE = [
  ['Young',    ['Teenager',    'Наврас',      '🧒', 'noun', 'тинейҷер',  'My son is a teenager.',   'Писари ман наврас аст.']],
  ['Old',      ['Grandparent', 'Бобову бибӣ', '👴', 'noun', 'грендперент','I visit my grandparents.','Ман ба назди бобову бибиям меравам.']],
  ['Birthday', ['Grown-up',    'Калонсол',    '🧔', 'noun', 'гроунап',   'He is a grown-up now.',   'Вай ҳоло калонсол аст.']],
];

const M9_DIR = [
  ['Near',     ['Traffic light', 'Чароғаки роҳ', '🚦', 'noun', 'трефик лайт', 'Stop at the traffic light.', 'Дар чароғаки роҳ истед.']],
  ['Next To',  ['Crossroads',    'Чорраҳа',      '🛤', 'noun', 'кросроудз',   'Turn at the crossroads.',    'Дар чорраҳа гардед.']],
  ['Between',  ['Bridge',        'Пул',          '🌉', 'noun', 'бриҷ',        'Go over the bridge.',        'Аз болои пул гузаред.']],
];

// ── ёфтани дарсҳо ──
const a1 = (await j(`/courses?targetLanguageId=${EN}&nativeLanguageId=${TG}`)).courses.find(c => c.level === 'A1');
const find = (modOrder, title) => {
  const m = a1.modules.find(x => x.order === modOrder - 1);
  return m?.lessons.find(l => l.title === title);
};

const jobs = [
  { les: find(2, 'Numbers 1-20 Review and Usage'), map: M2_PERSONAL,
    retitle: { title: 'Personal Information', titleTranslated: 'Маълумоти шахсӣ', emoji: '🪪' } },
  { les: find(3, 'People Around Me'), map: M3_PEOPLE },
  { les: find(3, 'Age And Family'),   map: M3_AGE },
  { les: find(9, 'Lesson 4: Direction Words'), map: M9_DIR },
];

const made = [];
for (const job of jobs) {
  if (!job.les) { console.log('✗ дарс ёфт нашуд'); continue; }
  const L = (await j(`/lessons/${job.les.id}`)).lesson ?? await j(`/lessons/${job.les.id}`);
  const words = L.words || [];
  console.log(`\n▌${L.title}`);

  for (const [oldWord, [w, tr, emoji, pos, ipaTj, ex, exTr]] of job.map) {
    const rec = words.find(x => (x.word || '').toLowerCase() === oldWord.toLowerCase());
    if (!rec) { console.log(`  ✗ «${oldWord}» ёфт нашуд`); continue; }
    const res = await fetch(`${BASE}/api/admin/words/${rec.id}`, {
      method: 'PUT', headers: H,
      body: JSON.stringify({
        word: w, translation: tr, emoji, partOfSpeech: pos, ipaTajik: ipaTj,
        example: ex, exampleTrans: exTr, ipa: '', audioUrl: '',
      }),
    });
    if (res.ok) { made.push({ id: rec.id, word: w }); console.log(`  ✓ ${oldWord} → ${w}`); }
    else console.log(`  ✗ ${oldWord}: ${res.status} ${(await res.text()).slice(0, 80)}`);
  }

  if (job.retitle) {
    const r = await fetch(`${BASE}/api/admin/lessons/${job.les.id}`, {
      method: 'PUT', headers: H, body: JSON.stringify(job.retitle),
    });
    console.log(`  ${r.ok ? '✓' : '✗'} сарлавҳа → «${job.retitle.title}»`);
  }
}

writeFileSync(new URL('./_a1-dedupe-new.json', import.meta.url), JSON.stringify(made, null, 1));
console.log(`\nИваз шуд: ${made.length} калима. Акнун аудиои онҳо лозим (_a1-dedupe-audio.mjs).`);
