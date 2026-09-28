"""Ёрдамчиҳои генераторҳои «Гуфтор»-и КОРЕЯГӢ (28.09.2026).

Ҳамон сохтори англисӣ/арабӣ (`w`, `s`, `own`, `t`, `pack`). Транскрипсияи тоҷикӣ
(`literal`) ин ҷо НАВИШТА НАМЕШАВАД: онро `_ko-fill-literal.mjs` аз
`_ko-tajik.mjs` мегирад — ҳамон функсияе, ки корти калима, алифбо ва дарси
шиносоии курсро месозад (7 қоидаи хониш, ~200 мисоли худсанҷиш). Пас хониш дар
ҳама ҷо якхела аст ва дастӣ хато карда намешавад.

Қоидаҳои мазмун:
  • сатҳи 해요체 (-요), ба мисли курс; фармони бригадир — -(으)세요;
  • рақамҳо бо ҲАРФ (세 개, 삼천 원), на бо рақам — Azure-ро муҳаррик мефаҳмад;
  • `{name}` НЕСТ (номи кириллӣ дар ҷумлаи кореягӣ); `{job}` = касб БО пайвандак
    («저는 {job}.» → «저는 건설 노동자예요.», ниг. `speaking_persona.dart`);
  • слоти «___» — калимаи ҷудо («제 이름은 ___.»), на бо пасванд.
"""

import io, json, re

OUT = 'content/speaking/'
PROBLEMS = []
HANGUL = re.compile('[가-힣]')


def _chk(label, t):
    if not t:
        return
    if re.search(r'[0-9]', t):
        PROBLEMS.append(f'{label} «{t}»: рақам бо ҳарф нависед (세 개, 삼천 원)')
    if re.search(r'[A-Za-z]', re.sub(r'\{[a-z_]+\}', '', t)):  # «{job}» — ҷойгузор, на матн
        PROBLEMS.append(f'{label} «{t}»: ҳарфи лотинӣ')
    if '___' in t and re.search(r'___[가-힣]|[가-힣]___', t):
        PROBLEMS.append(f'{label} «{t}»: слоти «___» бояд калимаи ҷудо бошад')


def w(text, tr, note=None):
    _chk('text', text)
    return {"kind": "word", "text": text, "translation": tr, "literal": None, "note": note,
            "cue": None, "cueTranslation": None}


def s(text, tr, note=None, cue=None, cue_tr=None, swaps=None):
    _chk('text', text); _chk('cue', cue)
    d = {"kind": "sentence", "text": text, "translation": tr, "literal": None, "note": note,
         "cue": cue, "cueTranslation": cue_tr}
    if swaps:
        d["swaps"] = swaps
    return d


def own(text, tr, note, cue, cue_tr, intent):
    _chk('text', text); _chk('cue', cue)
    return {"kind": "own", "text": text, "translation": tr, "literal": None, "note": note,
            "cue": cue, "cueTranslation": cue_tr, "intent": intent}


def t(cue, cue_tr, intent, text, tr, accepts, note=None):
    _chk('cue', cue); _chk('text', text)
    for a in accepts:
        _chk('accepts', a)
    return {"kind": "turn", "cue": cue, "cueTranslation": cue_tr, "intent": intent,
            "text": text, "accepts": accepts, "translation": tr, "literal": None, "note": note}


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
    d = {"slug": slug, "targetLanguage": "ko", "nativeLanguage": "tg",
         "category": {"title": title, "titleTranslated": title_tg, "scenario": scenario,
                      "emoji": emoji, "order": order, "goals": goals,
                      "isPremium": False, "isActive": True},
         "lessons": out}
    io.open(OUT + slug + '.json', 'w', encoding='utf-8').write(
        json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    return slug


def finish(made):
    if PROBLEMS:
        raise SystemExit('⛔ мушкили матни кореягӣ:\n  ' + '\n  '.join(PROBLEMS))
    print(' '.join(made))
