// Қадами 1: матни калимаҳои онбординг (дарси кӯтоҳи пеш аз саҳифаи асосӣ).
//  а) Транскрипсияи тоҷикии РУСӢ ислоҳ мешавад — «спасибо»/«да» танҳо нусхаи
//     худи калима буданд, ки ҳеҷ чиз намеомӯзонд. Барои тоҷик ду чизи муҳим:
//     ҶОИ ЗАДА ва «о»-и безада, ки [а] талаффуз мешавад. Зада бо ҲАРФИ КАЛОН.
//  б) Панҷ забони холӣ (хитоӣ, туркӣ, олмонӣ, арабӣ, ҷопонӣ) пур мешаванд —
//     онҳо 0 калима доштанд, яъне хонанда рост ба саҳифаи асосӣ мегузашт.
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const BASE = 'https://admin.ramz.tj';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

// Вариантҳои якхела барои ҳар се маъно (ҷавоби дуруст ҳамеша аввал навишта,
// барнома худаш мехлут мекунад).
const OPT = {
  salom: ['Салом', 'Хайр', 'Бале', 'Ташаккур'],
  tashakkur: ['Ташаккур', 'Салом', 'Бале', 'Не'],
  bale: ['Бале', 'Не', 'Шояд', 'Хайр'],
};

// ── а) Транскрипсияи РУСӢ (id-ҳо аз базаи ҷорӣ гирифта мешаванд) ──
const RU_FIX = {
  'Привет':   { transcriptionTajik: 'привЕт',  note: 'зада ба «е»' },
  'Спасибо':  { transcriptionTajik: 'спасИба', note: 'зада ба «и»; «о»-и охир [а] хонда мешавад' },
  'Да':       { transcriptionTajik: 'да',      note: 'ҳамон тавр хонда мешавад' },
};

// ── б) Панҷ забони нав ──
const NEW = {
  // Хитоӣ — иероглиф + пиньин; транскрипсияи тоҷикӣ ҳатмист, чун хат нотанишест.
  'cmqdse2sw0000p7emq64xbcy5': { code: 'zh', words: [
    ['你好', 'Салом', 'nǐ hǎo', 'ни хАо', '👋', OPT.salom],
    ['谢谢', 'Ташаккур', 'xièxie', 'сйе сйе', '🙏', OPT.tashakkur],
    ['是', 'Бале', 'shì', 'ший', '✅', OPT.bale],
  ]},
  // Туркӣ — хати лотинӣ; барои тоҷик ҳарфҳои ş/ü/ç нав.
  'cmqdgus870000c7nfz5z16xbx': { code: 'tr', words: [
    ['Merhaba', 'Салом', 'mer-ha-BA', 'мерҳабА', '👋', OPT.salom],
    ['Teşekkürler', 'Ташаккур', 'te-şe-kkür-LER', 'тешеккюрлЕр', '🙏', OPT.tashakkur],
    ['Evet', 'Бале', 'e-VET', 'эвЕт', '✅', OPT.bale],
  ]},
  // Олмонӣ
  'cmqdhvfj200001z591mfrnj4z': { code: 'de', words: [
    ['Hallo', 'Салом', 'HA-llo', 'ҲАло', '👋', OPT.salom],
    ['Danke', 'Ташаккур', 'DAN-ke', 'дАнке', '🙏', OPT.tashakkur],
    ['Ja', 'Бале', 'ja', 'йа', '✅', OPT.bale],
  ]},
  // Арабӣ — хати аз рост ба чап; транскрипсия ҳатмист.
  'cmqdqfuxi00001rcsseeq42fi': { code: 'ar', words: [
    ['مرحبا', 'Салом', 'marhaban', 'мАрҳабан', '👋', OPT.salom],
    ['شكرا', 'Ташаккур', 'shukran', 'шУкран', '🙏', OPT.tashakkur],
    ['نعم', 'Бале', "na'am", 'нАъам', '✅', OPT.bale],
  ]},
  // Ҷопонӣ — кана; транскрипсия ҳатмист.
  'cmqe2wgkn0000mja0v7o9ehvb': { code: 'ja', words: [
    ['こんにちは', 'Салом', 'konnichiwa', 'конничивА', '👋', OPT.salom],
    ['ありがとう', 'Ташаккур', 'arigatō', 'аригатО', '🙏', OPT.tashakkur],
    ['はい', 'Бале', 'hai', 'ҳай', '✅', OPT.bale],
  ]},
};

// ─── а) РУСӢ: ислоҳи транскрипсия ───
const RU = 'cmpqk40yz00009rhl1uazdfi3';
const cur = await (await fetch(`${BASE}/api/admin/onboarding?targetLanguageId=${RU}&nativeLanguageId=${TG}`, { headers: H })).json();
const ruWords = cur.words || cur;
console.log('РУСӢ — ислоҳи транскрипсия:');
for (const w of ruWords) {
  const fix = RU_FIX[w.word];
  if (!fix) continue;
  const res = await fetch(`${BASE}/api/admin/onboarding`, {
    method: 'PUT', headers: H,
    body: JSON.stringify({ ...w, transcriptionTajik: fix.transcriptionTajik }),
  });
  console.log(`  ${res.ok ? '✓' : '✗'} ${w.word}: «${w.transcriptionTajik}» → «${fix.transcriptionTajik}»  (${fix.note})`);
}

// ─── б) Панҷ забони нав ───
console.log('\nЗабонҳои нав:');
for (const [langId, { code, words }] of Object.entries(NEW)) {
  const ex = await (await fetch(`${BASE}/api/admin/onboarding?targetLanguageId=${langId}&nativeLanguageId=${TG}`, { headers: H })).json();
  if ((ex.words || ex).length > 0) { console.log(`  ${code}: аллакай ${(ex.words || ex).length} калима дорад — гузашт`); continue; }
  let ok = 0;
  for (let i = 0; i < words.length; i++) {
    const [word, translation, transcription, transcriptionTajik, emoji, options] = words[i];
    const res = await fetch(`${BASE}/api/admin/onboarding`, {
      method: 'POST', headers: H,
      body: JSON.stringify({
        targetLanguageId: langId, nativeLanguageId: TG,
        word, translation, transcription, transcriptionTajik, emoji, options,
        example: '', exampleTrans: '', audioUrl: '', order: i,
      }),
    });
    if (res.ok) ok++; else console.log(`    ✗ ${word}: ${(await res.text()).slice(0, 90)}`);
  }
  console.log(`  ${code}: ${ok}/${words.length} сохта шуд`);
}
console.log('\nҚадами 1 тамом.');
