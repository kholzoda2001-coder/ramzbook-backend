// Қоидаҳои хониши олмонӣ (de → tg) — корти «📘 Қоидаҳо» дар экрани Алифбо.
//
// Услуб АЙНАН ҳамон аст, ки барои англисӣ тасдиқ шуд:
//   сарлавҳа: «Ҳарфи X — N ҳолат»
//   ҳар ҳолат ЯК сатр:  шароит → «садо»:  калима (хониш), калима (хониш)
// Ҳеҷ параграфи дароз, ҳеҷ назария. Навомӯз дар лаҳзаи хониш намепурсад
// «ин ҳиҷо кушода аст?» — мепурсад «ин ҳарфро чӣ гуна гӯям?».
//
// Мисолҳо то ҷои имкон аз ҲАМИН курс гирифта шудаанд ва хонишашон бо кортҳои
// калима як хел аст — қадами 0 инро худкор месанҷад, пас корт ва қоида ҳеҷ гоҳ
// ба ҳам зид намешаванд.
//
// ⚠️ Рендер `Text`-и оддист — markdown кор НАМЕКУНАД, вале `\n` кор мекунад.
// «:» дар транскрипсия = садоноки дароз, «́» = зада.
//
//   node prisma/_de-alphabet-rules.mjs          # кӯҳнаҳоро ҳазф + аз нав сабт
//   node prisma/_de-alphabet-rules.mjs --check  # танҳо санҷиш
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const BASE = 'https://admin.ramz.tj';
const DE = 'cmqdhvfj200001z591mfrnj4z';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const COURSE = 'cmqdhwb5q00021z597df2767m';
const CHECK_ONLY = process.argv.includes('--check');

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

const R = [
  // ── ТАБИ «АЛФАВИТ» ────────────────────────────────────────────────────────
  ['general', 'Аввал ин се чизро донед',
    '1. Ҳарф як НОМ дорад ва дар калима садои дигар медиҳад. W номаш «вэ», дар калима «в».\n' +
    '2. Олмонӣ мисли англисӣ не: чӣ навишта шудааст, қариб ҳамон хонда мешавад.\n' +
    '3. Ҳамагӣ чанд ҷуфти ҳарф садои нав медиҳанд: ei, ie, eu, au, ch, sch, sp, st.\n' +
    'Дар мисолҳои мо «:» садоноки дарозро нишон медиҳад: gut (гу:т).'],
  ['general', 'Қоидаи №1: садонок дароз ё кӯтоҳ',
    'Садонок + ЯК ҳамсадо → ДАРОЗ:  gut (гу:т), rot (ро:т), lesen (лэ́:зэн)\n' +
    'Садонок + ДУ ҳамсадо → КӮТОҲ:  Wann (ван), essen (э́сэн), links (линкс)\n' +
    'Садонок + h → ДАРОЗ, h хонда намешавад:  gehen (гэ́:эн), nah (на:)\n' +
    'Садоноки дукарата → ДАРОЗ:  Tee (те:), Boot (бо:т)\n' +
    'Дарозӣ маънои калимаро иваз мекунад: Stadt (штат — шаҳр), Staat (шта:т — давлат).'],
  ['general', 'Қоидаи №2: b, d, g дар охири калима',
    'b дар охир → «п»:  gelb (гэлп), halb (ҳалп)\n' +
    'd дар охир → «т»:  das Kind (кинт), das Hemd (ҳэмт), das Geld (гэлт)\n' +
    'g дар охир → «к»:  der Mittag (ми́та:к), Montag (мо́:нта:к)\n' +
    'Дар мобайни калима садои худро нигоҳ медоранд:  lieben (ли́:бэн), oben (о́:бэн)'],
  ['general', 'Қоидаи №3: -e ва -er дар охири калима',
    '-e дар охир → «э»-и суст:  Bitte (би́тэ), heute (ҳо́йтэ), die Tasche (та́шэ)\n' +
    '-er дар охир → «а», «р» шунида намешавад:  der Vater (фа́:та), die Mutter (му́та), der Bruder (бру́:да)\n' +
    'Ҳамин тавр -r баъди садоноки дароз:  vier (фи:а), wir (ви:а), er (э:а)'],
  ['general', 'Дар ҳар калима ҳиҷои АВВАЛ баландтар хонда мешавад',
    'AR-beiten (а́рбайтэн), MON-tag (мо́:нта:к), ZWAN-zig (цва́нцихь)\n' +
    'Истисно — пешвандҳои be-, ge-, ver-, er-:  bezahlen (бэца́:лэн), verstehen (фаштэ́:э)\n' +
    'Дар калимаҳои иқтибосӣ зада ба охир меафтад:  das Hotel (ҳотэ́л), das Café (кафэ́:)'],
  ['general', 'Ҳамаи исмҳо бо ҳарфи КАЛОН навишта мешаванд',
    'der Vater, die Mutter, das Haus, die Schule — ҳамеша бо ҳарфи калон.\n' +
    'Ich lerne Deutsch. — «Deutsch» дар мобайни ҷумла ҳам бо ҳарфи калон.\n' +
    'Ин ба шумо кӯмак мекунад: ҳарфи калон дар мобайни ҷумла = ин исм аст.'],

  // ── ТАБИ «САДОНОКҲО» ──────────────────────────────────────────────────────
  ['vowel', 'Ҳарфи A — 2 ҳолат',
    'A + ду ҳамсадо → «а»-и кӯтоҳ:  Wann (ван), acht (ахт), alt (алт)\n' +
    'A + як ҳамсадо, aa ё ah → «а»-и дароз:  der Vater (фа́:та), Tag (та:к), nah (на:)'],
  ['vowel', 'Ҳарфи E — 4 ҳолат',
    'E + ду ҳамсадо → «э»-и кӯтоҳ:  essen (э́сэн), elf (элф), jetzt (йэцт)\n' +
    'E + як ҳамсадо, ee ё eh → «э»-и дароз:  lesen (лэ́:зэн), zehn (цэ:н), sehen (зэ́:эн)\n' +
    'E дар охири калима → «э»-и суст:  Bitte (би́тэ), die Schule (шу́:лэ)\n' +
    '-er дар охири калима → «а»:  der Bruder (бру́:да), die Schwester (швэ́ста)'],
  ['vowel', 'Ҳарфи I — 2 ҳолат',
    'I + ҳамсадо → «и»-и кӯтоҳ:  das Kind (кинт), links (линкс), ich (ихь)\n' +
    'ie, ih, ieh → «и»-и дароз:  lieben (ли́:бэн), sieben (зи́:бэн), vier (фи:а)\n' +
    'Диққат: ie ҳамеша «и»-и дароз аст, ҳеҷ гоҳ «иэ».'],
  ['vowel', 'Ҳарфи O — 2 ҳолат',
    'O + ду ҳамсадо → «о»-и кӯтоҳ:  kommen (ко́мэн), Sonntag (зо́нта:к), orange (ора́нжэ)\n' +
    'O + як ҳамсадо, oo ё oh → «о»-и дароз:  rot (ро:т), oben (о́:бэн), Wo (во:)'],
  ['vowel', 'Ҳарфи U — 2 ҳолат',
    'U + ду ҳамсадо → «у»-и кӯтоҳ:  hundert (ҳу́ндат), kurz (курц), die Mutter (му́та)\n' +
    'U + як ҳамсадо ё uh → «у»-и дароз:  gut (гу:т), du (ду:), die Schule (шу́:лэ)'],
  ['vowel', 'Ä, Ö, Ü — се садои НАВ',
    'Ä → «э»:  März (мэрц), spät (шпэ:т)\n' +
    'Ö → «э» гӯед, лабро мисли «о» мудаввар кунед:  schön (шё:н), hören (ҳё́:рэн), zwölf (цвёлф)\n' +
    'Ü → «и» гӯед, лабро мисли «у» мудаввар кунед:  fünf (фюнф), grün (грю:н), Tschüss (чюс)\n' +
    'Машқ: «и»-ро кашед ва бе қатъи садо лабро мудаввар кунед — Ü ҳосил мешавад.'],
  ['vowel', 'Ду садонок якҷоя — ин чортаро аз ёд кунед',
    'ei ва ai → «ай» (НА «эй»):  Nein (найн), klein (клайн), drei (драй)\n' +
    'ie → «и»-и дароз (НА «иэ»):  lieben (ли́:бэн), vier (фи:а), sieben (зи́:бэн)\n' +
    'eu ва äu → «ой»:  neu (ной), neun (нойн), teuer (то́йа)\n' +
    'au → «ау»:  das Haus (ҳаус), blau (блау), kaufen (ка́уфэн)\n' +
    'Ин ҷо навомӯзон бештар хато мекунанд: ei = ай, ie = и.'],
  ['vowel', 'Ҳарфи Y — 2 ҳолат',
    'Y дар мобайни калима → мисли Ü:  Typ (тю:п), System (зюстэ́:м), Physik (фюзи́:к)\n' +
    'Y дар аввали калима → «й»:  Yoga (йо́:га), Yacht (йахт)\n' +
    'Y танҳо дар калимаҳои иқтибосӣ вомехӯрад.'],

  // ── ТАБИ «ҲАМСАДОҲО» ──────────────────────────────────────────────────────
  ['consonant', 'Ҳарфи C — 4 ҳолат',
    'ch баъди a, o, u, au → «х»:  Mittwoch (ми́тво:х), die Nacht (нахт), acht (ахт)\n' +
    'ch баъди i, e, ä, ö, ü ё ҳамсадо → «хь»-и нарм:  ich (ихь), schlecht (шлэхьт), sprechen (шпрэ́хьэн)\n' +
    'chs → «кс»:  sechs (зэкс), Fuchs (фукс)\n' +
    'ck → «к»:  die Jacke (йа́кэ), Ecke (э́кэ)\n' +
    'C танҳо намеояд — ҳамеша бо ҳарфи дигар.'],
  ['consonant', 'Ҳарфи S — 3 ҳолат',
    'S пеш аз садонок → «з»:  sehen (зэ́:эн), sieben (зи́:бэн), Sie (зи:)\n' +
    'S дар охир ё пеш аз ҳамсадо → «с»:  das Haus (ҳаус), eins (айнс), links (линкс)\n' +
    'ss ва ß → ҳамеша «с»:  essen (э́сэн), weiß (вайс), groß (гро:с)'],
  ['consonant', 'sch, sp, st — се ҷуфти муҳим',
    'sch → «ш»:  die Schule (шу́:лэ), schön (шё:н), die Schwester (швэ́ста)\n' +
    'sp дар АВВАЛи калима → «шп»:  sprechen (шпрэ́хьэн), Sport (шпорт)\n' +
    'st дар АВВАЛи калима ё ҳиҷо → «шт»:  aufstehen (а́уфштэ:эн), Stadt (штат)\n' +
    'Дар мобайн ва охир одӣ мемонанд:  gestern (гэ́стан), Dienstag (ди́:нста:к)'],
  ['consonant', 'Ҳарфи H — 2 ҳолат',
    'H дар аввали калима ё ҳиҷо → «ҳ»:  das Haus (ҳаус), heute (ҳо́йтэ), hören (ҳё́:рэн)\n' +
    'H баъди садонок → ХОМӮШ, танҳо садонокро дароз мекунад:  gehen (гэ́:эн), sehen (зэ́:эн), die Schuhe (шу́:э)'],
  ['consonant', 'Ҳарфи R — 2 ҳолат',
    'R дар аввали калима ё ҳиҷо → «р»-и ГУЛӮӢ:  rot (ро:т), rosa (ро́:за), rechts (рэхьц)\n' +
    'R дар охири калима ва дар -er → «а»:  der Vater (фа́:та), vier (фи:а), wir (ви:а)\n' +
    '«Р»-и гулӯӣ: нӯги забон намеларзад, садо аз таҳи гулӯ меояд.\n' +
    'Агар ҳанӯз ҳосил нашавад — «р»-и тоҷикӣ гӯед, шуморо мефаҳманд.'],
  ['consonant', 'Ҳарфи V — 2 ҳолат',
    'V дар калимаҳои аслии олмонӣ → «ф»:  vier (фи:а), vierzig (фи́рцихь), viel (фи:л)\n' +
    'V дар калимаҳои иқтибосӣ → «в»:  Vase (ва́:зэ), Video (ви́:део)'],
  ['consonant', 'Ҳарфи W — ҳамеша «в»',
    'warm (варм), wir (ви:а), Wo (во:), weiß (вайс), Wann (ван)\n' +
    'W ҳеҷ гоҳ мисли w-и англисӣ хонда намешавад.'],
  ['consonant', 'Ҳарфи Z — ҳамеша «ц»',
    'zehn (цэ:н), zwei (цвай), zwanzig (цва́нцихь), März (мэрц)\n' +
    'tz низ «ц»:  jetzt (йэцт), sitzen (зи́цэн)\n' +
    'Z ҳеҷ гоҳ «з» нест.'],
  ['consonant', 'Ҳарфи J — «й»',
    'Ja (йа:), die Jacke (йа́кэ), Januar (йа́нуа:а), Juni (йу́:ни)\n' +
    'Дар транскрипсияи мо «ю» ва «ё» ҳамеша Ü ва Ö-ро нишон медиҳанд, на j.'],
  ['consonant', 'Ҳарфи G — 3 ҳолат',
    'G дар аввал ва мобайн → «г»:  gut (гу:т), gehen (гэ́:эн), groß (гро:с)\n' +
    'G дар охири калима → «к»:  der Mittag (ми́та:к), Montag (мо́:нта:к)\n' +
    '-ig дар охири калима → «ихь»:  billig (би́лихь), zwanzig (цва́нцихь), achtzig (а́хцихь)'],
  ['consonant', 'Q ва X',
    'qu → «кв»:  Quelle (кве́лэ), Qualität (квалитэ́:т)\n' +
    'x → «кс»:  Text (тэкст), Taxi (та́кси)\n' +
    'Q ҳеҷ гоҳ танҳо намеояд — ҳамеша бо u.'],
  ['consonant', 'NG ва NK — садои БИНӢ',
    'ng → садо аз бинӣ мебарояд, «г» алоҳида шунида намешавад:  lang (ланг), die Wohnung (во́:нунг)\n' +
    'nk →  Danke (да́нкэ), trinken (три́нкэн), die Bank (банк), links (линкс)'],
  ['consonant', 'Ду ҳарф — як садо',
    'sch → «ш»:  die Schule (шу́:лэ)\n' +
    'tsch → «ч»:  Deutsch (дойч), Tschüss (чюс)\n' +
    'pf → «пф», ҳарду садо якҷоя:  Apfel (а́пфэл), Kopf (копф)\n' +
    'th → «т», h хонда намешавад:  Theater (теа́:та), Thema (тэ́:ма)\n' +
    'ph → «ф»:  Physik (фюзи́:к), Foto (фо́:то)'],
  ['consonant', 'Ҳамсадои дукарата — як садо',
    'die Mutter (му́та), kommen (ко́мэн), essen (э́сэн), Willkommen (вилко́мэн)\n' +
    'Ду ҳарф як садо медиҳад. Дукарата навишта мешавад, то садоноки пеш аз он КӮТОҲ монад.\n' +
    'Муқоиса:  Stadt (штат) — кӯтоҳ,  Staat (шта:т) — дароз.'],
  ['consonant', 'Ҳарфи ß (эсцэт) — ҳамеша «с»',
    'weiß (вайс), groß (гро:с), dreißig (дра́йсихь), die Größe (грё́:сэ)\n' +
    'ß баъди садоноки ДАРОЗ меояд; баъди кӯтоҳ ба ҷои он ss:  essen (э́сэн)\n' +
    'ß ҳеҷ гоҳ дар аввали калима намеояд.\n' +
    'Ҳарфи калонаш ẞ аст, вале одатан SS менависанд:  STRASSE'],
];

// ── 0. Санҷиш: хониши мисолҳо бо кортҳои калима мувофиқ аст? ────────────────
// Ҳар «калима (хониш)»-ро мебарорем ва бо `Word.ipaTajik`-и ҳамон калима
// муқоиса мекунем. Агар қоида як хел гӯяд ва корти калима хели дигар, хонанда
// онро мебинад ва бовариашро гум мекунад.
{
  const rows = await sql.query(
    `SELECT w.word, w."ipaTajik" FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
     JOIN "Module" m ON l."moduleId"=m.id WHERE m."courseId"='${COURSE}'`);
  const byWord = new Map();
  for (const r of rows) {
    byWord.set(r.word, r.ipaTajik);
    // «die Mutter» → «Mutter»: артикл ҳам аз калима, ҳам аз хониш ҷудо мешавад.
    const m = r.word.match(/^(der|die|das)\s+(.+)$/);
    if (m) byWord.set(m[2], r.ipaTajik.replace(/^(дэ:а|ди:|дас)\s+/, ''));
  }

  let bad = 0, checked = 0;
  for (const [, title, body] of R) {
    for (const m of body.matchAll(/([A-Za-zÄÖÜäöüß]+)\s+\(([^)]+)\)/g)) {
      const [, word, reading] = m;
      const known = byWord.get(word);
      if (!known) continue;                       // калимаи берун аз курс
      checked++;
      if (known !== reading) {
        bad++;
        console.log(`  ✗ «${title}»: ${word} → қоида «${reading}», корти калима «${known}»`);
      }
    }
  }
  if (bad) { console.error(`\n${bad} номувофиқатӣ — навишта нашуд.`); process.exit(1); }
  console.log(`✓ Мувофиқати хониш: ${checked} мисол бо кортҳои калима як хел`);
}

// ── 0б. Санҷиши шакл ────────────────────────────────────────────────────────
{
  let bad = 0;
  const seen = new Set();
  for (const [cat, title, body] of R) {
    const e = [];
    if (!['general', 'vowel', 'consonant'].includes(cat)) e.push(`категорияи номаълум: ${cat}`);
    if (!title.trim()) e.push('сарлавҳа холӣ');
    if (/\*\*|__|^#/m.test(body)) e.push('markdown — рендер онро намефаҳмад');
    if (seen.has(title)) e.push('сарлавҳаи такрорӣ');
    seen.add(title);
    // Сатри дароз дар телефон печида мешавад ва қоидаро душворхон мекунад.
    for (const line of body.split('\n')) {
      if (line.length > 110) e.push(`сатри аз ҳад дароз (${line.length}): «${line.slice(0, 40)}…»`);
    }
    if (body.split('\n').length > 6) e.push(`${body.split('\n').length} сатр — аз 6 зиёд`);
    seen.add(title);
    if (e.length) { bad++; console.log(`  ✗ ${title}: ${e.join(', ')}`); }
  }
  if (bad) { console.error(`\n${bad} хато — навишта нашуд.`); process.exit(1); }
  const cats = R.reduce((a, r) => ((a[r[0]] = (a[r[0]] ?? 0) + 1), a), {});
  console.log(`✓ Шакл тоза: ${R.length} қоида ${JSON.stringify(cats)}`);
}

const list = async () => (await (await fetch(
  `${BASE}/api/admin/alphabet-rules?targetLanguageId=${DE}&nativeLanguageId=${TG}`, { headers: H })).json()).rules;

// ── 1. Аз нав сабт кардан ───────────────────────────────────────────────────
if (!CHECK_ONLY) {
  console.log('\n== Қадами 1: сабт ==');
  const old = await list();
  for (const r of old) await fetch(`${BASE}/api/admin/alphabet-rules?id=${r.id}`, { method: 'DELETE', headers: H });
  if (old.length) console.log(`  кӯҳна ҳазф шуд: ${old.length}`);
  let ok = 0;
  for (let i = 0; i < R.length; i++) {
    const [category, title, body] = R[i];
    const res = await fetch(`${BASE}/api/admin/alphabet-rules`, {
      method: 'POST', headers: H,
      body: JSON.stringify({ targetLanguageId: DE, nativeLanguageId: TG, category, title, body, order: i + 1 }),
    });
    if (res.ok) ok++; else console.log(`  ✗ ${title}: ${(await res.text()).slice(0, 120)}`);
  }
  console.log(`  сабт шуд: ${ok}/${R.length}`);
}

// ── 2. Он чи ба барнома меравад ─────────────────────────────────────────────
console.log('\n== Қадами 2: /api/mobile/alphabet ==');
const mob = await (await fetch(`${BASE}/api/mobile/alphabet?targetLanguageId=${DE}&nativeLanguageId=${TG}`)).json();
const rules = mob.rules ?? [];
const cats = rules.reduce((a, r) => ((a[r.category] = (a[r.category] ?? 0) + 1), a), {});
console.log(`  қоидаҳо: ${rules.length} ${JSON.stringify(cats)}`);
const ord = rules.map(r => r.order);
console.log(`  ${ord.every((v, i) => i === 0 || ord[i - 1] < v) ? '✓' : '✗'} тартиб афзоянда`);
for (const [tab, filter] of [['Алфавит', 'general'], ['Садонокҳо', 'vowel'], ['Ҳамсадоҳо', 'consonant']]) {
  console.log(`\n  ── таби «${tab}» ──`);
  for (const r of rules.filter(r => r.category === filter)) console.log(`   • ${r.title}`);
}
