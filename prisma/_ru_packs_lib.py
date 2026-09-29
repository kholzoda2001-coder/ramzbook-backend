"""Ёрдамчиҳои генераторҳои «Гуфтор»-и РУСӢ (29.09.2026) — нусхаи `_ru-build-a1-packs.py`.

Қоидаҳо: words/chunks ≤2 калима, sentences ≤4, навбат ≤8. Бригадир ба коргар «ты»,
коргар ба бригадир «вы» («Повторите», «Извините»). Транскрипсия (`literal`) барои русӣ
лозим нест (қарори корбар, 12.09.2026). Дар ҷавобҳои `accepts` рақам мумкин аст («В 7.»).
"""
import io, json

OUT = 'content/speaking/'  # аз ҷузвдони backend: python prisma/_ru-build-a1-packs.py


def w(text, tr, note=None):
    return {"kind": "word", "text": text, "translation": tr, "literal": None, "note": note,
            "cue": None, "cueTranslation": None}


def s(text, tr, note=None, cue=None, cue_tr=None, swaps=None):
    d = {"kind": "sentence", "text": text, "translation": tr, "literal": None, "note": note,
         "cue": cue, "cueTranslation": cue_tr}
    if swaps:
        d["swaps"] = swaps
    return d


def own(text, tr, note, cue, cue_tr, intent):
    return {"kind": "own", "text": text, "translation": tr, "literal": None, "note": note,
            "cue": cue, "cueTranslation": cue_tr, "intent": intent}


def t(cue, cue_tr, intent, text, tr, accepts, note=None):
    return {"kind": "turn", "cue": cue, "cueTranslation": cue_tr, "intent": intent,
            "text": text, "accepts": accepts, "translation": tr, "literal": None, "note": note}


STAGES = ["words", "dialogue", "chunks", "dialogue", "sentences", "dialogue",
          "sentences", "dialogue", "mission"]


def pack(slug, title, title_tg, emoji, order, goals, scenario, lessons, mission_mode=None):
    assert len(lessons) == 9
    out = []
    for i, ((ltitle, items), stage) in enumerate(zip(lessons, STAGES)):
        for j, it in enumerate(items):
            it["order"] = j
        L = {"order": i, "stage": stage, "title": ltitle, "items": items}
        if stage == "mission" and mission_mode:
            L["mode"] = mission_mode
        out.append(L)
    d = {"slug": slug, "targetLanguage": "ru", "nativeLanguage": "tg",
         "category": {"title": title, "titleTranslated": title_tg, "scenario": scenario,
                      "emoji": emoji, "order": order, "goals": goals,
                      "isPremium": False, "isActive": True},
         "lessons": out}
    io.open(OUT + slug + '.json', 'w', encoding='utf-8').write(
        json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    return slug


