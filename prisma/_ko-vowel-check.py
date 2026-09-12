# Оё ҳиҷои ЯККАи кореягӣ САДОНОКИ ДУРУСТ дорад? (на танҳо «садо ҳаст»).
#
# ЧАРО: 2026-09-11 корбар ҳарфи ㅏ-ро пахш кард ва «а»-ро нашунид. Форманта нишон
# дод: файл F1≈290/F2≈710 Ҳз (≈ «у/о») буд, на /a/ (F1≈850+). Google Chirp3-HD
# Despina барои ҳиҷои якка на танҳо ХОМӮШ (ниг. `_audio-energy.py`), балки гоҳ бо
# САДОНОКИ ДИГАР мегӯяд — ҳамон «у/о»-и пасти F2≈650–700: ㅏ ㅑ ㅐ ㅔ ㅖ ㅚ ㅙ ㅟ
# дар алифбо ва 네 네 씨 형 만 사 삼 팔 책 천 дар дарсҳо (17 файл иваз шуд).
#
# Қоидаҳо ҚАСДАН дағаланд — танҳо ҳамон хатои воқеиро мегиранд ва ҳамсадоҳои
# атроф (ㄹ F2-ро баланд, ㅁ/ㄴ F1-ро паст мекунанд) онҳоро намешикананд:
#   садоноки пеш (ㅐ ㅔ ㅒ ㅖ ㅣ ㅟ ㅚ ㅢ ㅙ ㅞ): F2 > 1800
#   садоноки кушода (ㅏ ㅑ ㅘ):                  F1 > 600
#   ㅓ ㅕ ㅝ:                                    F1 > 500
#   ㅗ ㅛ ㅜ ㅠ ㅡ — санҷида намешаванд (F2-и онҳо аз ҳамсадо вобаста аст).
#
#   PYTHONUTF8=1 python prisma/_ko-vowel-check.py <file.mp3> <ҳиҷо>
#   → як сатри JSON {"ok", "vowel", "f1", "f2", "rule"}; коди баромад 1 = садоноки нодуруст.
import json, sys
import numpy as np
import soundfile as sf

VOW = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
FRONT = set('ㅐㅔㅒㅖㅣㅟㅚㅢㅙㅞ')
OPEN = set('ㅏㅑㅘ')
MID = set('ㅓㅕㅝ')


def formants(path):
    x, sr = sf.read(path)
    x = x.mean(axis=1) if x.ndim > 1 else x
    fr, hop = int(sr * 0.03), int(sr * 0.01)
    e = np.array([np.sqrt(np.mean(x[i:i + fr] ** 2)) for i in range(0, max(1, len(x) - fr), hop)])
    if len(e) == 0 or e.max() < 0.02:
        return None
    F = []
    for i in [i for i in range(len(e)) if e[i] > 0.5 * e.max()]:
        s = x[i * hop:i * hop + fr] * np.hamming(fr)
        s = np.append(s[0], s[1:] - 0.63 * s[:-1])
        p = 2 + sr // 1000
        r = np.correlate(s, s, 'full')[len(s) - 1:len(s) + p]
        R = np.array([[r[abs(a - b)] for b in range(p)] for a in range(p)])
        try:
            a = np.linalg.solve(R + 1e-9 * np.eye(p), -r[1:p + 1])
        except Exception:
            continue
        roots = [z for z in np.roots(np.r_[1, a]) if np.imag(z) > 0]
        cand = sorted((np.angle(z) * sr / (2 * np.pi), -sr / np.pi * np.log(abs(z))) for z in roots)
        fs = [f for f, b in cand if 200 < f < 4000 and b < 400]
        if len(fs) >= 2:
            F.append(fs[:2])
    return None if not F else [int(v) for v in np.median(np.array(F), axis=0)]


def check(path, syllable):
    code = ord(syllable) - 0xAC00
    if not (0 <= code < 11172):
        return {'ok': True, 'rule': 'not-a-syllable'}
    v = VOW[code % 588 // 28]
    f = formants(path)
    if f is None:
        return {'ok': False, 'vowel': v, 'rule': 'no-voice'}
    if v in FRONT:
        rule, ok = 'F2>1800', f[1] > 1800
    elif v in OPEN:
        rule, ok = 'F1>600', f[0] > 600
    elif v in MID:
        rule, ok = 'F1>500', f[0] > 500
    else:
        rule, ok = 'unchecked', True
    return {'ok': bool(ok), 'vowel': v, 'f1': f[0], 'f2': f[1], 'rule': rule}


if __name__ == '__main__':
    r = check(sys.argv[1], sys.argv[2])
    print(json.dumps(r, ensure_ascii=False))
    sys.exit(0 if r['ok'] else 1)
