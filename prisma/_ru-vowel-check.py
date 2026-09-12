# Оё НОМИ ҳарфи русӣ садоноки ДУРУСТ дорад? (на танҳо «садо ҳаст»).
#
# ЧАРО: 12.09.2026 корбар гуфт «ҳарфи О садои А мебарорад». Ченак тасдиқ кард:
# файли О ва файли А ЯК сабт буданд (ҳамбастагии мавҷ 0.961), форманти О =
# 776/1436 Ҳз, яъне [а]. Сабаб — ба TTS ҳарфи ЯГОНАИ «о» дода шуда буд, вале дар
# русӣ «о» пешоянди бе зада ҳам ҳаст → муҳаррик онро калима хонду редуксия кард.
# Доми ҳар алифбо: ҳарфро танҳо нафирист — ҷумлаи пурра («О.») ё SSML деҳ.
#
# ⚠️ ҶОИ ЧЕНАК муҳимтар аз худи ченак аст. «Фрейми баландтарин» кор НАМЕКУНАД:
# дар «я» ва «ю» баландтарин фрейм дар [й] аст, дар «ща» — дар фрикативи [щ],
# пас Я «садоноки пеш» ва Щ «[э]» ҳисоб мешуданд. Номи ҳарфи русӣ се сохт дорад
# ва садонок дар ҳар кадом дар ҶОИ ДИГАР аст:
#   FINAL (бэ, вэ, ка, ща, я, ю…) → садонок дар ОХИР      → 62–92% фосила
#   INIT  (эл, эм, эн, эр, эс, эф) → садонок дар АВВАЛ     → 10–40%
#   PURE  (а, о, у, и, ы, э)       → тамоми файл садонок   → 35–70%
#   Й Ъ Ь — номашон якчанд калима, санҷида намешаванд.
#
# Қоидаҳо ҚАСДАН дағаланд — танҳо хатои воқеиро мегиранд:
#   [a] А Я К Х Ш Щ  → F1 > 680
#   [o] О Ё          → F1 < 700 ва F2 < 1250      (маҳз ҳамин О-ро аз А ҷудо мекунад)
#   [u] У Ю          → F1 < 520 ва F2 < 1100
#   [i] И            → F2 > 2200
#   [ɨ] Ы            → 1250 < F2 < 2150           (ин Ы-ро аз И ҷудо мекунад)
#   [e] боқӣ + Э Е   → F2 > 1700 ва F1 < 800
#
#   PYTHONUTF8=1 python prisma/_ru-vowel-check.py <file.mp3> <ҳарф>
#   → як сатри JSON {"ok","letter","f1","f2","rule"}; коди баромад 1 = садоноки нодуруст.
import json, os, sys
import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ru_vowel_lib import poles  # ҳамон LPC барои ҳар ду абзор

FINAL = set('БВГДЖЗКПТХЦЧШЩЕЁЮЯ')
INIT = set('ЛМНРСФ')
A = set('АЯКХШЩ')
O = set('ОЁ')
U = set('УЮ')
SKIP = set('ЙЪЬ')


def _window(letter):
    if letter in FINAL:
        return 0.62, 0.92
    if letter in INIT:
        return 0.10, 0.40
    return 0.35, 0.70


def formants(path, letter):
    x, sr = sf.read(path)
    x = x.mean(axis=1) if x.ndim > 1 else x
    fr, hop = int(sr * 0.030), int(sr * 0.005)
    e = np.array([np.sqrt(np.mean(x[i:i + fr] ** 2)) for i in range(0, max(1, len(x) - fr), hop)])
    if len(e) == 0 or e.max() < 0.02:
        return None
    v = np.where(e > e.max() * 0.18)[0]
    if len(v) == 0:
        return None
    lo, hi = _window(letter)
    a = v[0] + (v[-1] - v[0]) * lo
    b = v[0] + (v[-1] - v[0]) * hi
    F = []
    for i in range(int(a), int(b) + 1):
        if i * hop + fr > len(x):
            break
        if e[i] < e.max() * 0.30:       # фреймҳои паст = ҳамсадо/хомӯшӣ
            continue
        f = poles(x[i * hop:i * hop + fr], sr)
        if len(f) >= 2:
            F.append(f[:2])
    if not F:
        return None
    return [int(t) for t in np.median(np.array(F), axis=0)]


def check(path, letter):
    letter = letter.upper()
    if letter in SKIP:
        return {'ok': True, 'letter': letter, 'rule': 'unchecked'}
    f = formants(path, letter)
    if f is None:
        return {'ok': False, 'letter': letter, 'rule': 'no-voice'}
    f1, f2 = f
    if letter in A:
        rule, ok = 'F1>680', f1 > 680
    elif letter in O:
        rule, ok = 'F1<700 & F2<1250', f1 < 700 and f2 < 1250
    elif letter in U:
        rule, ok = 'F1<520 & F2<1100', f1 < 520 and f2 < 1100
    elif letter == 'И':
        rule, ok = 'F2>2200', f2 > 2200
    elif letter == 'Ы':
        rule, ok = '1250<F2<2150', 1250 < f2 < 2150
    else:
        rule, ok = 'F2>1700 & F1<800', f2 > 1700 and f1 < 800
    return {'ok': bool(ok), 'letter': letter, 'f1': f1, 'f2': f2, 'rule': rule}


if __name__ == '__main__':
    r = check(sys.argv[1], sys.argv[2])
    print(json.dumps(r, ensure_ascii=False))
    sys.exit(0 if r['ok'] else 1)
