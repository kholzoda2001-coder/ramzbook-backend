"""Ёрдамчиҳои генераторҳои «Гуфтор»-и ОЛМОНӢ (29.09.2026) — нусхаи `_tr_packs_lib.py`.

Транскрипсияи тоҷикӣ (`literal`) ин ҷо НАВИШТА НАМЕШАВАД: `_de-fill-literal.mjs` онро аз
луғати КУРС (Word.ipaTajik, 698 калима + боби кӯҳнаи «Kennenlernen») ва IPA-и дастии
калимаҳои нав (`ipaToTajik` аз `_de-tajik.mjs`) месозад — ҳамон хониши корти калимаи курс.

Қоидаҳои мазмун:
  • рақамҳо бо ҲАРФ (drei Säcke, fünfhundert Euro) — Azure «3 Säcke», «500 Euro»-ро
    менависад, муҳаррики барнома ҳарду шаклро як медонад;
  • вақт: «um sieben Uhr» (Azure: «um 7 Uhr»); «halb acht» ҳам мешавад (Azure «07:30 Uhr»);
  • бригадир (Polier/Chef) ба коргар — «du»; коргар ба бригадир, духтур, идора — «Sie»;
  • `{name}` НЕСТ; `{job}` = касб бе артикл («Ich bin {job}.» → «Ich bin Bauarbeiter.»).
"""

import io, json, re

OUT = 'content/speaking/'
PROBLEMS = []


def _chk(label, t):
    if not t:
        return
    if re.search(r'[0-9%]', t):
        PROBLEMS.append(f'{label} «{t}»: рақам бо ҳарф нависед (drei, fünfhundert)')
    if re.search('[Ѐ-ӿ]', t):
        PROBLEMS.append(f'{label} «{t}»: ҳарфи кириллӣ дар матни олмонӣ')
    if '’' in t:
        PROBLEMS.append(f"{label} «{t}»: апостроф танҳо ASCII (')")
    if '___' in t and re.search(r"___\w|\w___", t):
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
    d = {"slug": slug, "targetLanguage": "de", "nativeLanguage": "tg",
         "category": {"title": title, "titleTranslated": title_tg, "scenario": scenario,
                      "emoji": emoji, "order": order, "goals": goals,
                      # Санҷиши зинда (29.09.2026): Azure tr-TR-ро ВОҚЕАН баҳо медиҳад (90–100 барои
                      # ибораи дуруст, «Kiz» ба ҷои «Kız» → 9) — ҷадвали ҳуҷҷати Microsoft кӯҳна буд.
                      "isPremium": False, "isActive": True},
         "lessons": out}
    io.open(OUT + slug + '.json', 'w', encoding='utf-8').write(
        json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    return slug


def finish(made):
    if PROBLEMS:
        raise SystemExit('⛔ мушкили матни олмонӣ:\n  ' + '\n  '.join(PROBLEMS))
    print(' '.join(made))
