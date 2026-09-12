# LPC-и муштарак барои санҷиши садоноки русӣ (`_ru-vowel-check.py`) ва барои
# буридани калимаи барандаӣ (`tmp/_ru-y-trim.py`) — то ҳарду АЙНАН як усул
# истифода баранд, вагарна «санҷиш гузашт, вале дар ҷои дигар рақам дигар аст».
import numpy as np


def levinson(r, p):
    a = np.zeros(p + 1); a[0] = 1.0; e = r[0]
    if e <= 0:
        return None
    for i in range(1, p + 1):
        acc = r[i] + sum(a[j] * r[i - j] for j in range(1, i))
        k = -acc / e
        old = a[1:i].copy()
        for j in range(1, i):
            a[j] = old[j - 1] + k * old[i - j - 1]
        a[i] = k; e *= (1 - k * k)
        if e <= 0:
            return None
    return a


def poles(seg, sr, order=20):
    seg = seg - seg.mean()
    seg = np.append(seg[0], seg[1:] - 0.95 * seg[:-1])
    seg = seg * np.hamming(len(seg))
    r = np.correlate(seg, seg, 'full')[len(seg) - 1:len(seg) + order]
    a = levinson(r.astype(float), order)
    if a is None:
        return []
    out = []
    for z in np.roots(a):
        if np.imag(z) <= 0:
            continue
        f = np.angle(z) * sr / (2 * np.pi)
        bw = -(sr / np.pi) * np.log(abs(z))
        if 200 < f < 3800 and bw < 700:
            out.append(round(f))
    return sorted(out)


def formants_of_array(x, sr, lo, hi):
    """Медианаи [F1,F2] дар фосилаи `lo`–`hi` (ҳиссаи қисми садодори сигнал)."""
    fr, hop = int(sr * 0.030), int(sr * 0.005)
    e = np.array([np.sqrt(np.mean(x[i:i + fr] ** 2)) for i in range(0, max(1, len(x) - fr), hop)])
    if len(e) == 0 or e.max() < 0.02:
        return None
    v = np.where(e > e.max() * 0.18)[0]
    if len(v) == 0:
        return None
    a = v[0] + (v[-1] - v[0]) * lo
    b = v[0] + (v[-1] - v[0]) * hi
    F = []
    for i in range(int(a), int(b) + 1):
        if i * hop + fr > len(x):
            break
        if e[i] < e.max() * 0.30:
            continue
        f = poles(x[i * hop:i * hop + fr], sr)
        if len(f) >= 2:
            F.append(f[:2])
    if not F:
        return None
    return [int(t) for t in np.median(np.array(F), axis=0)]
