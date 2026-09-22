// Имлои туркӣ → IPA ва → хониши тоҷикӣ.
//
// Туркӣ қариб пурра ФОНЕТИКӢ аст: ҳар ҳарф ҳамеша як садо медиҳад. Бинобар ин
// ҳарду сатр (IPA ва хониши тоҷикӣ) аз ХУДИ ИМЛО ҳисоб карда мешаванд — на
// дастӣ навишта. Ҳамин як файл дар ҳама ҷо истифода мешавад (корти калима,
// алифбо, дарси шиносоӣ), вагарна хонанда дар як ҷо як хел ва дар ҷои дигар
// хели дигар мебинад.
//
// ⚠️ Чаро ин лозим шуд: билди аввал `ipaToTajik = (ipa) => ipa` дошт, яъне
// сутуни «хониши тоҷикӣ» худи IPA-ро нигоҳ медошт ва хонанда «/byjyc/» мебинад.
//
// Услуб (ҳамон услуби олмонӣ, ниг. `_de-tajik.mjs`):
//   «:» = садоноки дароз (ğ баъди садонок)  ·  «́» = зада
//   ö → «ё», ü → «ю» (ин ду садо барои тоҷик навтаринанд)
//   ı → «ы» — ЯГОНА ҳарфи ғайритоҷикӣ, ки қасдан иҷозат дода шуд: /ɯ/ дар туркӣ
//   як садоноки алоҳида аст (kız ≠ kiz) ва хонандаи тоҷик «ы»-ро аз русӣ
//   мешиносад. Агар ба ҷои он «и» гузорем, ду калимаи гуногун як хел мешаванд.
//
//   node prisma/_tr-tajik.mjs        # худсанҷиш

const FRONT = new Set('eiöüEİÖÜ');
const VOWEL = new Set('aeıioöuüAEIİOÖUÜ');

// ҳарф → [IPA, тоҷикӣ]; садонокҳо ва ҳамсадоҳои оддӣ
const MAP = {
  a: ['a', 'а'], e: ['e', 'э'], ı: ['ɯ', 'ы'], i: ['i', 'и'],
  o: ['o', 'о'], ö: ['œ', 'ё'], u: ['u', 'у'], ü: ['y', 'ю'],
  b: ['b', 'б'], c: ['dʒ', 'ҷ'], ç: ['tʃ', 'ч'], d: ['d', 'д'],
  f: ['f', 'ф'], h: ['h', 'ҳ'], j: ['ʒ', 'ж'], l: ['l', 'л'],
  m: ['m', 'м'], n: ['n', 'н'], p: ['p', 'п'], r: ['ɾ', 'р'],
  s: ['s', 'с'], ş: ['ʃ', 'ш'], t: ['t', 'т'], v: ['v', 'в'],
  y: ['j', 'й'], z: ['z', 'з'],
};

/** Ҳарфи хурди туркӣ (İ → i, I → ı — дар туркӣ ин ду ҳарфи ГУНОГУНАНД). */
const lower = (ch) => (ch === 'İ' ? 'i' : ch === 'I' ? 'ı' : ch.toLowerCase());

/** Ҳиҷоҳо аз рӯи садонокҳо: зада дар туркӣ одатан ба ҳиҷои ОХИРИН меафтад. */
function lastVowelIndex(letters) {
  for (let i = letters.length - 1; i >= 0; i--) if (VOWEL.has(letters[i])) return i;
  return -1;
}

/** Як калимаи туркиро ба {ipa, tajik} мегардонад. */
function oneWord(raw) {
  const letters = [...raw];
  const low = letters.map(lower);
  const stressAt = lastVowelIndex(low);
  let ipa = '', tj = '';
  for (let i = 0; i < low.length; i++) {
    const ch = low[i];
    const prev = low[i - 1];
    const next = low[i + 1];

    if (ch === 'ğ') {
      // ğ ҳеҷ гоҳ садои худӣ надорад: байни ду садоноки пеш /j/, вагарна
      // садоноки пешинаро ДАРОЗ мекунад (dağ → да:, öğrenci → ё:рэнҷи).
      if (VOWEL.has(prev) && VOWEL.has(next) && FRONT.has(prev)) { ipa += 'j'; tj += 'й'; }
      else if (VOWEL.has(prev)) { ipa += 'ː'; tj += ':'; }
      continue;
    }
    if (ch === 'k') {
      // k пеш аз садоноки пеш палаталӣ мешавад (/c/), вале дар тоҷикӣ ҳарду «к».
      const soft = FRONT.has(next) || (next === undefined && FRONT.has(prev));
      ipa += soft ? 'c' : 'k'; tj += 'к';
      if (VOWEL.has(ch)) { /* нест */ }
      continue;
    }
    if (ch === 'g') {
      const soft = FRONT.has(next) || (next === undefined && FRONT.has(prev));
      ipa += soft ? 'ɟ' : 'ɡ'; tj += 'г';
      continue;
    }
    const hit = MAP[ch];
    if (!hit) {
      // фосила, аломат ва рақам ҳамон тавр мемонанд
      ipa += ch; tj += ch;
      continue;
    }
    ipa += hit[0];
    tj += hit[1];
    if (VOWEL.has(ch) && i === stressAt) tj += '́';
  }
  return { ipa, tajik: tj };
}

/** «Hoş geldin» → { ipa: '/hoʃ ɟeldin/', tajik: 'ҳо́ш гэлди́н' } */
export function transcribe(text) {
  const parts = String(text).trim().split(/(\s+)/);
  let ipa = '', tajik = '';
  for (const p of parts) {
    if (/^\s+$/.test(p)) { ipa += ' '; tajik += ' '; continue; }
    // Аломатҳо (?, !, …) ба транскрипсия дохил намешаванд.
    const core = p.replace(/[?!.,;:()'"]/g, '');
    if (!core) continue;
    const r = oneWord(core);
    ipa += r.ipa; tajik += r.tajik;
  }
  return { ipa: `/${ipa.trim()}/`, tajik: tajik.trim().replace(/\s+/g, ' ') };
}

export const toIpa = (t) => transcribe(t).ipa;
export const toTajik = (t) => transcribe(t).tajik;

/** Ҳарфҳое, ки хониши тоҷикӣ дошта метавонад. «ы» қасдан ҳаст (ниг. боло). */
export const ALLOWED = /^[абвгдеёжзийклмнопрстуфхчшъыэюяғқҳҷӣӯ:́ \-\/]+$/i;

const CASES = [
  ['Merhaba', 'мэрҳаба́'],
  ['Evet', 'эвэ́т'],
  ['Hayır', 'ҳайы́р'],
  ['Kız', 'кы́з'],
  ['Kim', 'ки́м'],
  ['Büyük', 'бюйю́к'],
  ['Öğrenci', 'ё:рэнҷи́'],
  ['Sağ', 'са́:'],
  ['Teşekkür ederim', 'тэшэккю́р эдэри́м'],
  ['Gitar', 'гита́р'],
  ['Kirli', 'кирли́'],
  ['Vize', 'визэ́'],
  ['Çay', 'ча́й'],
  ['Yağmur', 'йа:му́р'],
  ['Değil', 'дэйи́л'],
  ['Adam', 'ада́м'],
  ['Günaydın', 'гюнайды́н'],
];

export function selfTest() {
  const bad = [];
  for (const [word, want] of CASES) {
    const got = toTajik(word);
    if (got !== want) bad.push(`${word}: «${got}» ≠ «${want}»`);
    if (!ALLOWED.test(got)) bad.push(`${word}: аломати иҷозатнадода дар «${got}»`);
  }
  if (bad.length) { bad.forEach((b) => console.error('  ✗ ' + b)); throw new Error(`${bad.length}/${CASES.length} худсанҷиш ноком`); }
  return CASES.length;
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  console.log(`✓ ${selfTest()} худсанҷиш`);
  for (const [w] of CASES) {
    const r = transcribe(w);
    console.log(`  ${w.padEnd(18)} ${r.ipa.padEnd(26)} ${r.tajik}`);
  }
}
