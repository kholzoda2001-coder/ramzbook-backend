"""Ёрдамчиҳои генераторҳои «Гуфтор»-и АРАБӢ (28.09.2026).

1. `translit()` — транскрипсияи ТОҶИКӢ аз матни ПУРРА ҳаракатдор. Хониш аз
   худи ҳаракот маълум аст, пас дастӣ навиштан лозим нест (ва хато намекунад):
   ҳаракот, танвин, шадда, «ал-»-и шамсӣ/қамарӣ, ҳамзаи васл, тои марбута,
   вақф (охири ҷумла бе ҳаракат → бе садонок).
   Қоидаҳо — ҳамон конвенсияи боби «التعارف» ва луғати курс:
     ع — дар аввали калима намеояд («али»), дар мобайн «ъ» («муъаллим»);
     ҳамза — байни садонокҳо намеояд («саиқ»), баъди/пеш аз сукун «ъ» («раъс»);
     ā → «а» («талиб»), ī → «и», ū → «у»; ح/ه → «ҳ», ق → «қ», ج → «ҷ»;
     «ал-» баъди калимаи садонокдор часпида: «маъа-с-салама», «фи-л-байт».
2. `check_text()` — қоидаҳои матн: ҳар калима ҳаракат дорад; охири ҷумла ВАҚФ
   (бе зам/касра/танвини зам-касра); аломатҳо арабӣ (؟ ، ؛).
3. `w`, `s`, `own`, `t`, `pack` — ҳамон сохтори англисӣ (`_en_packs_lib.py`).

Қарор (28.09.2026): дар ДОХИЛИ ҷумла эъроби пурра, дар ОХИР вақф — қоидаи
дурусти хондан ва услуби боби зиндаи «التعارف». Овоз: edge-tts Zariyah.
"""

import io, json, re

OUT = 'content/speaking/'

FATHA, DAMMA, KASRA = 'َ', 'ُ', 'ِ'
TAN_F, TAN_D, TAN_K = 'ً', 'ٌ', 'ٍ'
SHADDA, SUKUN, DAGGER = 'ّ', 'ْ', 'ٰ'
MARKS = set([FATHA, DAMMA, KASRA, TAN_F, TAN_D, TAN_K, SHADDA, SUKUN, DAGGER])
VOWEL = {FATHA: 'а', DAMMA: 'у', KASRA: 'и', DAGGER: 'а'}
TANWEEN = {TAN_F: 'ан', TAN_D: 'ун', TAN_K: 'ин'}
HAMZAS = set('أإؤئء')
SUN = set('تثدذرزسشصضطظلن')
CONS = {
    'ب': 'б', 'ت': 'т', 'ث': 'с', 'ج': 'ҷ', 'ح': 'ҳ', 'خ': 'х', 'د': 'д', 'ذ': 'з',
    'ر': 'р', 'ز': 'з', 'س': 'с', 'ش': 'ш', 'ص': 'с', 'ض': 'з', 'ط': 'т', 'ظ': 'з',
    'ع': 'ъ', 'غ': 'ғ', 'ف': 'ф', 'ق': 'қ', 'ك': 'к', 'ل': 'л', 'م': 'м',
    'ن': 'н', 'ه': 'ҳ',
}
# Номҳо ва калимаҳое, ки хониши тоҷикии МАЪМУЛ доранд (калид — бе ҳаракат).
SPECIAL = {
    'الله': 'аллоҳ', 'لله': 'лиллоҳ', 'طاجيكستان': 'тоҷикистон', 'دوشنبه': 'душанбе',
    'انشاءالله': 'иншааллоҳ', 'ماشاءالله': 'машааллоҳ',
    'أوزبكستان': 'ӯзбекистон', 'روسيا': 'русия',
    # Номҳои тоҷикӣ бо «ـوف» ва калимаҳои ворида — хониши маъмули тоҷикӣ (05.10.2026).
    'رحيموف': 'раҳимов', 'حسنوف': 'ҳасанов', 'كريموف': 'каримов', 'كريموفا': 'каримова',
    'زرينة': 'зарина', 'مترو': 'метро', 'المترو': 'ал-метро', 'إنترنت': 'интернет',
}
PUNCT = '،,؟?!.:؛;'


def strip_marks(s):
    return ''.join(c for c in s if c not in MARKS)


def units(word):
    """[(ҳарф, маҷмӯи ҳаракот)]"""
    out = []
    for c in word:
        if c in MARKS and out:
            out[-1][1].append(c)
        elif c not in MARKS:
            out.append([c, []])
    return [(c, m) for c, m in out]


def _vowel(marks):
    for m in marks:
        if m in TANWEEN:
            return TANWEEN[m]
        if m in VOWEL:
            return VOWEL[m]
    return ''


def _word(word, joined_prev):
    """Як калима → (транскрипсия, часпида ба пешина?). joined_prev = калимаи
    пешин бо садонок тамом шуд ва дар ҳамон ибора аст (барои васл)."""
    bare = strip_marks(word)
    if bare in SPECIAL:
        return SPECIAL[bare], False
    u = units(word)
    out = ''
    attach = False
    i = 0
    # ── пешвандҳо: وَ فَ بِ كَ لِ (як ҳарф бо садонок) ──
    pre = ''
    if len(u) > 2 and u[0][0] in 'وفبكل' and _vowel(u[0][1]) and u[1][0] in 'اٱل':
        pre = CONS.get(u[0][0], 'в') + _vowel(u[0][1])
        i = 1
    # ── артикл ──
    is_art = False
    # Артикл — алиф БЕ ҳаракат; «اِلْبَسْ» (феъли амр, алиф бо касра) артикл нест.
    if i < len(u) - 1 and u[i][0] in 'اٱ' and not u[i][1] and u[i + 1][0] == 'ل' and i + 2 < len(u):
        is_art, a0 = True, i + 2
    elif pre.startswith('л') and u[i][0] == 'ل' and i + 1 < len(u):  # لِلْ = li + al
        is_art, a0 = True, i + 1
    wasl_art = False
    if is_art:
        nxt, nm = u[a0]
        sun = SHADDA in nm and nxt in SUN
        # «الِاسْتِرَاحَة»: пас аз артикл ҳамзаи васл — садоноки «ли» мемонад
        wasl_art = nxt in 'اٱ'
        art = (CONS[nxt] if sun else 'л')
        if pre:
            out = pre + '-' + art + '-'
        elif joined_prev:
            out, attach = '-' + art + '-', True
        else:
            out = 'а' + art + '-'
        i = a0
        if sun:  # ҳарфи шамсӣ аллакай дар артикл дубора шуд
            first = True
        else:
            first = False
    else:
        out = pre
        first = False
    start = i
    # ── ҳамзаи васл дар аввал (اِسْم، اِثْنَان…) ──
    if i == 0 and u and u[0][0] in 'اٱ' and not is_art:
        v = _vowel(u[0][1]) or 'и'
        if joined_prev:
            out, attach = '-', True
        else:
            out = v
        i = 1
    while i < len(u):
        c, m = u[i]
        v = _vowel(m)
        word_start = (i == start) or (i == 1 and start == 0 and u[0][0] in 'اٱ')
        pm = u[i - 1][1] if i > 0 else []
        if c in 'اٱ' and wasl_art and i == start:
            out += 'и'  # ал-истираҳа
        elif c in 'اٱ':
            if TAN_F in m:
                # «حَسَناً»: танвин болои АЛИФ (ҳарфи пеш бе ҳаракат) ё болои ҳарфи пеш («حَسَنًا»)
                out += '' if TAN_F in pm else 'ан'
            elif v and (i == 0 or KASRA in m or DAMMA in m):
                out += v  # ҳамзаи васл бо ҳаракат: «الاِسْمُ» → ал-исму
            elif FATHA not in pm and TAN_F not in pm:
                out += 'а'
        elif c == 'ى':
            if not out.endswith('а'):
                out += 'а'
        elif c == 'آ':
            out += 'а'
        elif c in 'وي':
            cons = 'в' if c == 'و' else 'й'
            longv = 'у' if c == 'و' else 'и'
            if SHADDA in m and c == 'ي':
                # «ـِيَّة» → «ийя» (курс: «баладийя»), «سَيَّارَة» → «сайяра», «سَيِّد» → «саййид»
                out += 'й' + {'а': 'я', 'у': 'ю', 'и': 'йи'}.get(v[:1], 'й') + v[1:]
            elif SHADDA in m:
                out += cons + cons + v
            elif v:
                out += ({'а': 'я', 'у': 'ю'}.get(v[0], 'й' + v[0]) + v[1:]) if c == 'ي' else cons + v
            elif i == 0 or (i > 0 and SUKUN in pm):
                # пас аз сукун — ҳамсадо, на садоноки дароз: «عَفْواً» → афван
                out += cons
            elif SUKUN in m:
                # дифтонг: «يَوْم» → явм, «بَيْت» → байт
                out += cons if (FATHA in pm or out.endswith('а')) else ''
            else:
                # «يُوجَد» → «юҷад», на «юуҷад»: «ю»/«я» худ садоноки дарозро доранд.
                out += '' if out.endswith(longv) or (longv == 'у' and out.endswith('ю')) else longv
        elif c in HAMZAS:
            prev_sukun = i > 0 and (SUKUN in u[i - 1][1] or (not _vowel(u[i - 1][1]) and u[i - 1][0] not in 'اويى'))
            if i == 1 and u[0][0] == 'و' and _vowel(u[0][1]):
                out += '-' + (v or ('и' if c == 'إ' else 'а'))  # «وَأَنْتَ» → ва-анта
            elif i == 0 or word_start:
                out += v or ('и' if c == 'إ' else 'а')
            elif SUKUN in m or prev_sukun or TAN_F in m or TAN_D in m or TAN_K in m:
                out += 'ъ' + v  # «رَأْس» → раъс, «مَاءً» → маъан
            else:
                out += v
        elif c == 'ة':
            out += ('т' + v) if v else ''
        elif c in CONS:
            ch = CONS[c]
            if c == 'ع' and word_start:
                ch = ''
            elif c == 'ع' and i == 1 and u[0][0] == 'و' and _vowel(u[0][1]):
                ch = '-'  # «وَعَلَيْكُمُ» → ва-алайкуму
            if SHADDA in m and not first:
                ch = ch + ch
            first = False
            out += ch + v
        i += 1
    return out, attach


def translit(text):
    """Матни ҳаракатдор → транскрипсияи тоҷикӣ (вергул мемонад, ؟ . ! не)."""
    text = text.replace('إِنْ شَاءَ اللَّه', 'انشاءالله').replace('مَا شَاءَ اللَّه', 'ماشاءالله')
    parts = re.findall(r'[^\s،,؟?!.:؛;]+|[،,؟?!.:؛;]', text)
    res = ''
    prev_vowel = False
    for p in parts:
        if p in PUNCT:
            if p in '،,':
                res += ','
            prev_vowel = False
            continue
        if '_' in p:
            res += (' ' if res else '') + '___'
            prev_vowel = False
            continue
        o, attach = _word(p, prev_vowel)
        if attach:
            res += o
        else:
            res += (' ' if res else '') + o
        prev_vowel = bool(o) and o[-1] in 'аиуеоӣӯ'
    res = res.replace('таҷик', 'тоҷик')
    return re.sub(r'\s+', ' ', res).strip()


# ── Қоидаҳои матн ───────────────────────────────────────────────────────────
AR_LETTER = re.compile('[ء-يٱ]')


def check_text(t):
    """Рӯйхати мушкилот барои як матни арабӣ."""
    if not t or not AR_LETTER.search(t):
        return []
    probs = []
    for wd in re.findall('[ء-يٱً-ْٰ]+', t):
        if len(strip_marks(wd)) >= 2 and not any(c in MARKS for c in wd):
            probs.append('бе ҳаракат: ' + wd)
    if re.search(r'[?,;]', t):
        probs.append('аломати лотинӣ')
    # вақф: калимаи охири ҳар ҷумла (пеш аз . ؟ ! ё охир)
    for seg in re.split('[.؟!]', t):
        wds = re.findall('[ء-يٱً-ْٰ]+', seg)
        if not wds:
            continue
        last = wds[-1]
        tail = last[-1]
        if tail in (DAMMA, KASRA, TAN_D, TAN_K) or (len(last) > 1 and last[-2:] in (SHADDA + DAMMA, SHADDA + KASRA)):
            probs.append('вақф нест: ' + last)
    return probs


# ── Сохтори баста (ҳамон `_en_packs_lib`) ──────────────────────────────────
PROBLEMS = []


def lit(text):
    if '{' in text:
        return None
    for p in check_text(text):
        PROBLEMS.append(f'«{text}»: {p}')
    return translit(text)


def _chk(label, t):
    if t:
        for p in check_text(t):
            PROBLEMS.append(f'{label} «{t}»: {p}')


def w(text, tr, note=None):
    return {"kind": "word", "text": text, "translation": tr, "literal": lit(text), "note": note,
            "cue": None, "cueTranslation": None}


def s(text, tr, note=None, cue=None, cue_tr=None, swaps=None):
    _chk('cue', cue)
    d = {"kind": "sentence", "text": text, "translation": tr, "literal": lit(text), "note": note,
         "cue": cue, "cueTranslation": cue_tr}
    if swaps:
        for sw in swaps:
            _chk('swap', sw.split('|')[0])
        d["swaps"] = swaps
    return d


def own(text, tr, note, cue, cue_tr, intent):
    _chk('cue', cue)
    return {"kind": "own", "text": text, "translation": tr, "literal": lit(text), "note": note,
            "cue": cue, "cueTranslation": cue_tr, "intent": intent}


def t(cue, cue_tr, intent, text, tr, accepts, note=None):
    _chk('cue', cue)
    for a in accepts:
        _chk('accepts', a)
    return {"kind": "turn", "cue": cue, "cueTranslation": cue_tr, "intent": intent,
            "text": text, "accepts": accepts, "translation": tr, "literal": lit(text), "note": note}


STAGES = ["words", "dialogue", "chunks", "dialogue", "sentences", "dialogue",
          "sentences", "dialogue", "mission"]


def pack(slug, title, title_tg, emoji, order, goals, scenario, lessons, mission_mode=None):
    assert len(lessons) == 9, slug
    out = []
    for i, ((ltitle, items), stage) in enumerate(zip(lessons, STAGES)):
        for j2, it in enumerate(items):
            it["order"] = j2
        L = {"order": i, "stage": stage, "title": ltitle, "items": items}
        if stage == "mission" and mission_mode:
            L["mode"] = mission_mode
        out.append(L)
    d = {"slug": slug, "targetLanguage": "ar", "nativeLanguage": "tg",
         "category": {"title": title, "titleTranslated": title_tg, "scenario": scenario,
                      "emoji": emoji, "order": order, "goals": goals,
                      "isPremium": False, "isActive": True},
         "lessons": out}
    io.open(OUT + slug + '.json', 'w', encoding='utf-8').write(
        json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    return slug
