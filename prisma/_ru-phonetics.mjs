// Муҳаррики ТАЛАФФУЗИ русӣ → навишти тоҷикхон (барои сутуни `Word.ipaTajik`).
//
// ЧАРО: `ipa` (`/zdrɐˈstvujtʲɪ/`) барои хонандаи тоҷик хати бегона аст. Вале
// русӣ ва тоҷикӣ ЯК алифбо доранд, пас талаффузро бо ҳамон кириллик навиштан
// мумкин аст. Он чи тоҷик аз навишти русӣ ДИДА НАМЕТАВОНАД, се чиз аст:
//   1) ҶОИ ЗАДА — дар тоҷикӣ қариб ҳамеша ҳиҷои охир, дар русӣ бетартиб;
//   2) РЕДУКСИЯ — о-и безада [а], е/я-и безада [и];
//   3) ҲАРФИ ХОНДАНАШАВАНДА ва беҷарангшавии охири калима.
//
// Ҳар қоидаи ин ҷо ба як қоидаи МАВҶУДИ `AlphabetRule`-и русӣ мувофиқ аст —
// пас корти калима маҳз ҳамонро такрор мекунад, ки экрани Алифбо мегӯяд:
//   qoida #8  → о-и безада → а          (Москва → Масква)
//   qoida #9  → е/я-и безада → и        (пятёрка → питёрка)
//   qoida #6  → я/е/ё/ю дар аввал → й+  (Ягода → Йагада)
//   qoida #12 → охири калима беҷаранг    (друг → друк)
//   qoida #16 → ж/ш/ц ҳамеша сахт        (жить → жыт)
//
// ҲУДУДИ ДОНИСТА: зада дар русӣ аз навишт ҲОСИЛ НАМЕШАВАД — вай луғатист.
// Пас калимаи бисёрҳиҷогие ки дар луғат нест, ҚАСДАН холӣ мемонад ва скрипт
// онро ҷудо рӯйхат мекунад. Тахмин кардани зада хатои таълимӣ медиҳад.

const ACUTE = '́';
const VOWELS = 'аеёиоуыэюя';
const ALWAYS_HARD = 'жшц'; // қоидаи #16
const VOICED = { б: 'п', в: 'ф', г: 'к', д: 'т', ж: 'ш', з: 'с' }; // қоидаи #12

/** Калимаҳое ки ҳеҷ қоида намегирад — талаффузи пурра дастӣ навишта шудааст. */
export const PHONETIC_OVERRIDE = {
  здравствуйте: 'здра́ствуйти', // «в» хонда намешавад
  что: 'што',
  конечно: 'канешна',
  сегодня: 'сево́дня', // г → в
  его: 'ево́',
  него: 'нево́',
  ничего: 'ничево́',
  солнце: 'со́нце', // «л» хонда намешавад
  поздно: 'по́зно', // «д» хонда намешавад
  пожалуйста: 'пажа́луйста',
  сейчас: 'сича́с',
  'счастливый': 'щасли́вый',
};

const isVowel = (c) => VOWELS.includes(c);

/**
 * ИБОРАҲОИ пурра, ки ҳамчун як воҳид талаффуз мешаванд. Дар инҳо зада ЯК бор
 * меафтад ва калимаи хизматӣ садои худро гум мекунад, пас сохтани калима-ба-калима
 * натиҷаи ғалат медиҳад («не за что» → «не за што», дуруст «не́ за шта»).
 */
export const PHRASE_OVERRIDE = {
  'не за что': 'не́ за шта',
};

/** Токенро ба {ch, stressed} мешиканад; аломати акут ба ҳарфи ПЕШ тааллуқ дорад. */
function parse(tok) {
  const out = [];
  for (const ch of tok) {
    if (ch === ACUTE) { if (out.length) out[out.length - 1].stressed = true; continue; }
    out.push({ ch, stressed: false });
  }
  // «ё» ҳамеша зада мегирад (қоидаи #4) — аломат намехоҳад.
  for (const c of out) if (c.ch === 'ё') c.stressed = true;

  // Калимаи ЯКҲИҶОГӢ аломати акут намегирад (меъёри русӣ), вале садоноки
  // ягонаи он ҲАТМАН задашуда аст. Бе ин шарт редуксия ба он ҳам мерасид ва
  // «нет» → «нит», «кто» → «кта», «мой» → «май» медод — талаффузи ҒАЛАТ.
  const vs = out.filter((c) => isVowel(c.ch));
  if (vs.length === 1 && !vs[0].stressed) vs[0].stressed = true;

  return out;
}

/**
 * Як ТОКЕНИ задагузошта → навишти талаффуз.
 * Токен бояд аллакай хурдҳарф ва бо акут бошад (ё якҳиҷогӣ).
 */
export function respellToken(tok) {
  const low = tok.toLowerCase();
  const bare = low.replace(new RegExp(ACUTE, 'g'), '');
  if (PHONETIC_OVERRIDE[bare]) return PHONETIC_OVERRIDE[bare];

  const cs = parse(low);
  const out = [];

  for (let i = 0; i < cs.length; i++) {
    const { ch, stressed } = cs[i];
    const prev = i > 0 ? cs[i - 1].ch : null;
    const prevIsVowel = prev !== null && isVowel(prev);
    const prevIsSign = prev === 'ъ' || prev === 'ь';
    const prevHard = prev !== null && ALWAYS_HARD.includes(prev);

    if (!isVowel(ch)) { out.push(ch); continue; }

    // ── я/е/ё/ю дар мавқеи «й»-дор: аввали калима, баъди садонок, баъди ъ/ь ──
    if ('яеёю'.includes(ch) && (i === 0 || prevIsVowel || prevIsSign)) {
      if (ch === 'ё') { out.push('йо', ACUTE); continue; }          // ҳамеша зада
      if (ch === 'ю') { out.push('йу'); if (stressed) out.push(ACUTE); continue; }
      if (stressed) { out.push(ch === 'я' ? 'йа' : 'йе', ACUTE); continue; }
      // Безада: дар ОХИРИ калима садоноки суст ба [ə] меравад, ки ба «а»
      // наздик аст, на ба «и» — «свида́нийа», «до́брайа». Дар дигар мавқеъ
      // қоидаи #9 амал мекунад: «йизы́к».
      out.push(i === cs.length - 1 ? 'йа' : 'йи');
      continue;
    }

    // ── садоноки задашуда: ҳамон тавр мемонад ──
    if (stressed) {
      // қоидаи #16: баъди ж/ш/ц садоноки нарм сахт хонда мешавад
      if (prevHard && ch === 'е') { out.push('э', ACUTE); continue; }
      if (prevHard && ch === 'и') { out.push('ы', ACUTE); continue; }
      out.push(ch, ACUTE); continue;
    }

    // ── редуксияи садоноки БЕЗАДА ──
    if (prevHard) {
      // жить → жыт, шесть → шэст, цирк → цырк
      if (ch === 'и') { out.push('ы'); continue; }
      if (ch === 'е') { out.push('ы'); continue; }
      if (ch === 'о') { out.push('а'); continue; }
      out.push(ch); continue;
    }
    if (ch === 'о') { out.push('а'); continue; }   // қоидаи #8
    // Охири калима: -я-и безада ба [ə] меравад («и́ма», на «и́ми»), вале
    // -е-и безада [ɪ] мемонад — вай асосан бандаки феълист («извини́ти»).
    if (ch === 'я' && i === cs.length - 1) { out.push('а'); continue; }
    if (ch === 'е' || ch === 'я') { out.push('и'); continue; } // қоидаи #9
    out.push(ch);
  }

  let s = out.join('');

  // Дар боло садоноки ягонаи калимаи якҳиҷогӣ «задашуда» эълон шуд — ин барои
  // ПЕШГИРИИ РЕДУКСИЯ лозим буд. Вале дар НАВИШТ калимаи якҳиҷогӣ ҳеҷ гоҳ
  // аломати акут намегирад (меъёри русӣ: «дом», на «до́м») — пас онро бармедорем.
  if ([...bare].filter(isVowel).length === 1) s = s.replace(new RegExp(ACUTE, 'g'), '');

  // ── қоидаи #17: -тся / -ться → «ца» ──
  s = s.replace(/т[ьс]?ся$/, 'ца').replace(/тся$/, 'ца');

  // ── қоидаи #12: беҷарангшавии охири калима ──
  // (ь-и охирин садо надорад — ҳамсадои пеш аз он санҷида мешавад)
  const m = s.match(/^(.*?)([бвгджз])(ь?)$/);
  if (m) s = m[1] + VOICED[m[2]] + m[3];

  return s;
}

/**
 * Ибораи пурра (як ё чанд калима) → навишти талаффуз.
 * `stressOf(bare)` шакли задагузоштаро бармегардонад, ё `null` агар надонад.
 * Агар ЯГОН калимаи бисёрҳиҷогӣ зада надошта бошад → `null` (қасдан холӣ).
 */
export function respellPhrase(phrase, stressOf) {
  // Ибораҳое ки ҳамчун ЯК воҳид талаффуз мешаванд (зада як бор меафтад ва
  // калимаи хизматӣ суст мешавад) — калима-ба-калима сохтан онҳоро вайрон мекунад.
  const whole = PHRASE_OVERRIDE[phrase.toLowerCase().trim()];
  if (whole) return { text: whole, unknown: null };

  const tokens = phrase.match(/[А-Яа-яЁё]+|[^А-Яа-яЁё]+/g) ?? [];
  const parts = [];
  let unknown = null;

  for (const t of tokens) {
    if (!/[А-Яа-яЁё]/.test(t)) { parts.push(t); continue; }
    const bare = t.toLowerCase();
    const syllables = [...bare].filter(isVowel).length;

    if (PHONETIC_OVERRIDE[bare]) { parts.push(PHONETIC_OVERRIDE[bare]); continue; }

    const stressed = stressOf(bare);
    if (!stressed && syllables > 1) { unknown ??= bare; parts.push(bare); continue; }
    parts.push(respellToken(stressed ?? bare));
  }

  if (unknown) return { text: null, unknown };

  const text = parts.join('');
  const plain = phrase.toLowerCase();
  // Агар талаффуз айнан ба навишт баробар бошад — ҳеҷ чиз намеомӯзонад.
  if (text === plain) return { text: null, unknown: null, identical: true };
  return { text, unknown: null };
}
