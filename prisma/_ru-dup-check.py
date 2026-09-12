# Оё ду ҳарфи алифбо ЯК сабт нестанд?
#
# ЧАРО: 12.09.2026 файли «О» ва файли «А» ду ном, ду md5, ҳар ду HTTP 200 —
# вале ҲАМОН сабт буданд (ҳамбастагии мавҷ 0.961). Санҷишҳои пешина (андоза,
# md5, энергия, дарозӣ) инро НАМЕДИДАНД, чунки ҳар ду файл «солим» буданд.
#
# Усул: қисми САДОДОРи ҳар файл бурида шуда, бо ҳар файли дигар ҳамбастагии
# хаттӣ (Pearson) ҳисоб мешавад. Барои партияи солим ҳамаи ҷуфтҳо < 0.6
# мемонанд (баландтаринаш Ё↔Ю 0.586 буд — ҳар ду бо [й] сар мешаванд).
#
#   PYTHONUTF8=1 python prisma/_ru-dup-check.py <file.mp3> [...]
#   → JSON: {"pairs": [[ҳамбастагӣ, файл1, файл2], ...], "max": x}
#   Коди баромад 1, агар ягон ҷуфт аз 0.90 боло барояд.
import itertools, json, sys
import numpy as np
import soundfile as sf

LIMIT = 0.90


def voiced(path):
    x, sr = sf.read(path)
    x = x.mean(axis=1) if x.ndim > 1 else x
    fr, hop = int(sr * 0.02), int(sr * 0.005)
    e = np.array([np.sqrt(np.mean(x[i:i + fr] ** 2)) for i in range(0, max(1, len(x) - fr), hop)])
    if len(e) == 0 or e.max() <= 0:
        return np.zeros(0)
    v = np.where(e > e.max() * 0.18)[0]
    return x[v[0] * hop:min(len(x), v[-1] * hop + fr)]


if __name__ == '__main__':
    files = sys.argv[1:]
    seg = {f: voiced(f) for f in files}
    pairs = []
    for a, b in itertools.combinations(files, 2):
        xa, xb = seg[a], seg[b]
        n = min(len(xa), len(xb))
        if n < 200:
            continue
        A = xa[:n] - xa[:n].mean()
        B = xb[:n] - xb[:n].mean()
        d = np.linalg.norm(A) * np.linalg.norm(B)
        if d <= 0:
            continue
        c = float(np.dot(A, B) / d)
        if c > 0.55:
            pairs.append([round(c, 3), a, b])
    pairs.sort(reverse=True)
    print(json.dumps({'pairs': pairs, 'max': pairs[0][0] if pairs else 0.0}, ensure_ascii=False))
    sys.exit(1 if pairs and pairs[0][0] > LIMIT else 0)
