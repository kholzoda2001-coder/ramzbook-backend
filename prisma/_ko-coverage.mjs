// Се санҷиши мазмуни кореягӣ, ки билд ПЕШ аз навиштан иҷро мекунад (модулҳо бо `KNOWN_FROM`):
//
//   1. ЛУҒАТ — ҳар калимаи ҳангул дар ҷумлаҳо, саволҳо ва вариантҳо бояд аз
//      модулҳои пешина, ҳамин модул ё номҳо бошад. Калима метавонад нишона дошта
//      бошад (은/는/이/가/도/의, 이에요/예요, 입니다…). Хатои M1: 의사 бе омӯзиш омада буд.
//   2. ҚАҲРАМОНҲО — агар ҷумлаи ХАБАРӢ гӯяд «N ... 사람이에요» ё «N ... 의사예요»,
//      кишвар/касб бояд ба `CHARACTERS` мувофиқ бошад; инкор («… 이/가 아니에요») —
//      баръакс. Саволҳо («안나 씨는 간호사예요?») даъво нестанд ва санҷида намешаванд.
//      Хатои M1: Карим гоҳ муаллим, гоҳ донишҷӯ.
//   3. ОИЛА (M3) — ҷадвали `FAMILY`: кӣ кадом хешро дорад ва касби ӯ. «… 누나가 있어요»
//      бояд дар ҷадвал бошад, «… 형제가 없어요» — набошад. Ва ЧИНСИ ГӮЯНДА: 형/누나-ро
//      танҳо писар мегӯяд, 오빠/언니-ро танҳо духтар (`CHARACTERS[*].gender`).
//
// ⚠️ Санҷиши луғат ҳамшаклҳоро намебинад: 저 = «ман» (M1) ва 저 = «он» (이/그/저, M4) як
// навишт доранд. Ҷонишинҳои ишоратӣ (이/그/저 + исм) то M4 ДАСТӢ набояд оянд.
// Унвонҳо санҷида намешаванд (хонанда тарҷумаи тоҷикиро мебинад).

// 에 (вақт / самт) — аз M5 (일곱 시에, 학교에 가요).
const ENDINGS = ['은', '는', '이', '가', '도', '요', '의', '에', '이에요', '예요', '입니다', '입니까'];
const PUNCT = /[.,!?…—–«»"'()_:]/g;
const HANGUL = /[가-힣]/;
const COUNTRIES = ['타지키스탄', '우즈베키스탄', '카자흐스탄', '러시아', '한국', '미국', '중국', '일본', '영국'];
const JOBS = ['회사원', '의사', '간호사', '경찰', '요리사', '운전기사', '가수', '배우', '기자', '은행원', '주부', '농부', '선생님', '학생'];

// Хешҳо ва ҳайвоноти хонагӣ — бо тартиби ДАРОЗ → КӮТОҲ (남동생 пеш аз 동생).
const RELATIONS = ['할아버지', '할머니', '아버지', '어머니', '부모님', '외삼촌', '삼촌', '고모', '이모',
  '남동생', '여동생', '동생', '형제', '오빠', '언니', '누나', '형', '남편', '아내', '아들', '딸', '아기', '아이',
  '강아지', '고양이'];
const MALE_SPEAKER = new Set(['형', '누나']);
const FEMALE_SPEAKER = new Set(['오빠', '언니']);
const SIBLINGS = ['형', '오빠', '누나', '언니', '남동생', '여동생', '동생'];

export const tokensOf = (s) => s.replace(PUNCT, ' ').split(/\s+/).filter(Boolean);

function knownSet(content, prior) {
  const set = new Set(content.EXTRA_KNOWN ?? []);
  for (const c of [...prior, content]) {
    for (const l of c.VOCAB) for (const w of l.words) for (const t of tokensOf(w.word)) set.add(t);
    for (const n of c.NAMES ?? []) set.add(n);
  }
  return set;
}

// Рақами хитоию кореягии мураккаб (삼천, 오천오백, 이십육) «омӯхта» аст, агар ҲАР ҳиҷояш
// (일…구, 십, 백, 천, 만) дар луғат бошад — вагарна ҳар нарх калимаи наомӯхта мешуд (M4).
const NUM_TOKEN = /^[공일이삼사오육칠팔구십백천만]+$/; // 공 = 0 дар рақами телефон (공일공)
const knownBase = (b, set) => set.has(b) || (NUM_TOKEN.test(b) && [...b].every(ch => set.has(ch)));

function isKnown(tok, set) {
  if (knownBase(tok, set) || ENDINGS.includes(tok)) return true; // варианти «이에요» худ нишона аст
  for (const e of ENDINGS) if (tok.endsWith(e) && knownBase(tok.slice(0, -e.length), set)) return true;
  return false;
}

/** Асоси токен бе нишона (누나가 → 누나, 형은 → 형). */
function baseOf(tok) {
  for (const e of [...ENDINGS].sort((a, b) => b.length - a.length)) {
    if (tok.length > e.length && tok.endsWith(e)) return tok.slice(0, -e.length);
  }
  return tok;
}

/** Ҳар матни ҳангулие, ки хонанда мебинад — бо нишонаи ҷояш. */
function textsOf(content) {
  const out = [];
  const add = (where, text, speaker) => { if (text && HANGUL.test(text)) out.push({ where, text, speaker }); };
  for (const l of content.VOCAB) for (const w of l.words) add(`мисоли «${w.word}»`, w.example);
  for (const g of content.GRAMMAR) {
    for (const e of g.examples) add(`мисоли грамматика «${g.title}»`, e.sentence);
    for (const x of g.exercises) {
      const full = x.type === 'reorder' ? x.answer : x.prompt.replace('___', x.answer);
      add(`машқи «${x.promptTranslated}»`, full);
      if (x.type !== 'reorder') for (const o of x.options) add(`варианти «${x.promptTranslated}»`, o);
    }
  }
  for (const c of content.COMPREHENSIONS) {
    add(`матни «${c.title}»`, c.passage, c.speaker);
    for (const q of c.questions) {
      add(`саволи «${q.questionTranslated}»`, q.question);
      for (const o of q.options) add(`варианти «${q.questionTranslated}»`, o);
    }
  }
  for (const ln of content.DIALOGUE.lines) add(`муколама (${ln.speaker})`, ln.text, ln.speaker);
  return out;
}

export function checkCoverage(content, prior) {
  const set = knownSet(content, prior);
  const P = [];
  for (const { where, text } of textsOf(content)) {
    const unknown = tokensOf(text).filter(t => HANGUL.test(t) && !isKnown(t, set));
    if (unknown.length) P.push(`калимаи наомӯхта дар ${where}: ${unknown.join(', ')} — «${text}»`);
  }
  return P;
}

/** Оё [fam] хеши [rel]-ро дорад (형제 = ягон бародару хоҳар, 동생 = ҳар хурдӣ, 부모님 = падар ё модар). */
function hasRel(fam, rel) {
  if (rel === '형제') return SIBLINGS.some(r => fam[r]);
  if (rel === '동생') return !!(fam['동생'] || fam['남동생'] || fam['여동생']);
  if (rel === '부모님') return !!(fam['부모님'] || fam['아버지'] || fam['어머니']);
  if (rel === '아이') return !!(fam['아이'] || fam['아들'] || fam['딸'] || fam['아기']);
  return !!fam[rel];
}

export function checkCharacters(content) {
  const C = content.CHARACTERS ?? {};
  const F = content.FAMILY ?? {};
  const names = Object.keys(C);
  const P = [];
  for (const { where, text, speaker } of textsOf(content)) {
    // Ҷумла бо аломати охираш — савол («…?») даъво нест.
    for (const raw of text.match(/[^.?!]+[.?!]?/g) ?? []) {
      const sent = raw.trim();
      if (!sent || sent.endsWith('?')) continue;
      const inSent = names.filter(n => sent.includes(n));
      let who = inSent.length === 1 ? inSent[0] : null;
      if (!who && inSent.length === 0 && speaker && C[speaker] && /^(저는|저의|제 |제$|저도|우리)/.test(sent)) who = speaker;
      if (!who) continue;
      const me = C[who];

      // ── Оила: агар ҷумла хешро номбар кунад, фоил ҳамон хеш аст, на қаҳрамон.
      const rels = tokensOf(sent).map(baseOf).filter(b => RELATIONS.includes(b));
      if (rels.length) {
        for (const r of rels) {
          if (me.gender === 'f' && MALE_SPEAKER.has(r)) P.push(`${where}: «${sent}» — ${who} духтар аст, «${r}»-ро писар мегӯяд (${r === '형' ? '오빠' : '언니'} лозим)`);
          if (me.gender === 'm' && FEMALE_SPEAKER.has(r)) P.push(`${where}: «${sent}» — ${who} писар аст, «${r}»-ро духтар мегӯяд (${r === '오빠' ? '형' : '누나'} лозим)`);
        }
        const fam = F[who];
        if (!fam) continue; // оилаи ин қаҳрамон муайян нашудааст — даъвои касбро санҷида намешавад
        for (const r of rels) {
          const exists = new RegExp(`${r}(이|가) (있어요|계세요|있습니다|계십니다)`).test(sent);
          const absent = new RegExp(`${r}(이|가) 없어요`).test(sent);
          if (exists && !hasRel(fam, r)) P.push(`${where}: «${sent}» — ${who} ${r} надорад (ҷадвали FAMILY)`);
          if (absent && hasRel(fam, r)) P.push(`${where}: «${sent}» — ${who} ${r} дорад (ҷадвали FAMILY)`);
          if (!exists && !absent && !['형제', '동생', '부모님'].includes(r) && !fam[r]) P.push(`${where}: «${sent}» — хеши «${r}»-и ${who} дар ҷадвали FAMILY нест`);
        }
        const subj = rels[0];
        const rel = fam[subj];
        for (const j of JOBS) {
          const neg = new RegExp(`${j}(이|가) 아니에요`).test(sent);
          const pos = new RegExp(`${j}(이에요|예요|입니다)`).test(sent);
          if (pos && rel && rel.job !== j) P.push(`${where}: «${sent}» — ${subj}-и ${who} ${rel.job ?? '(бе касб)'} аст, на ${j}`);
          if (neg && rel && rel.job === j) P.push(`${where}: «${sent}» — ${subj}-и ${who} ҳамин ${j} аст, инкор хато`);
        }
        continue;
      }

      for (const j of JOBS) {
        const neg = new RegExp(`${j}(이|가) 아니에요`).test(sent);
        const pos = new RegExp(`${j}(이에요|예요|입니다)`).test(sent);
        if (pos && j !== me.job) P.push(`${where}: «${sent}» — ${who} ${me.job} аст, на ${j}`);
        if (neg && j === me.job) P.push(`${where}: «${sent}» — ${who} ҳамин ${j} аст, инкор хато`);
      }
      for (const k of COUNTRIES) {
        if (new RegExp(`${k} 사람(이에요|입니다)`).test(sent) && k !== me.country) P.push(`${where}: «${sent}» — ${who} аз ${me.country} аст, на ${k}`);
        if (new RegExp(`${k} 사람이 아니에요`).test(sent) && k === me.country) P.push(`${where}: «${sent}» — ${who} аз ҳамин ${k} аст, инкор хато`);
      }
    }
  }
  return P;
}
