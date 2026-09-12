# Санҷиши САДОИ ВОҚЕӢ дар файлҳои MP3 (на танҳо «файл ҳаст ва дарозӣ дорад»).
#
# ЧАРО: 2026-09-11 дар алифбои кореягӣ 6 ҳарф ва 3 калима ХОМӮШ баромаданд —
# HTTP 200, дарозии 0.25–0.34 с, вале peak 0.01–0.05. Google Chirp3-HD барои
# калимаи якҳиҷоии кореягӣ аксар вақт файли қариб холӣ медиҳад, ва скрипт
# такрори «миёна аз рӯи дарозӣ»-ро мегирифт — маҳз ҳамон нусхаи хомӯш.
# Санҷишҳои пешина (HEAD, дарозии файл) инро намедиданд.
#
#   PYTHONUTF8=1 python prisma/_audio-energy.py <file.mp3> [...]
#   → як сатри JSON барои ҳар файл: {"file","ok","voiced","peak","dur"}
#   Коди баромад 1, агар ягон файл санҷишро нагузарад.
#
# Меъёр: peak ≥ 0.30 ва садои воқеӣ (энергия > 0.02, дар қадами 10 мс) ≥ 0.20 с.
# Файлҳои солими курс peak 0.36–0.99 доранд; хомӯшҳо 0.01–0.05.
import json, sys
import numpy as np
import soundfile as sf

MIN_PEAK = 0.30
MIN_VOICED = 0.20


def measure(path):
    x, sr = sf.read(path)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if len(x) == 0:
        return {'file': path, 'ok': False, 'voiced': 0.0, 'peak': 0.0, 'dur': 0.0}
    fr = int(sr * 0.01)
    e = np.array([np.sqrt(np.mean(x[i:i + fr] ** 2)) for i in range(0, max(1, len(x) - fr), fr)])
    v = np.where(e > 0.02)[0]
    voiced = (v[-1] - v[0] + 1) * 0.01 if len(v) else 0.0
    peak = float(np.abs(x).max())
    return {'file': path, 'ok': bool(peak >= MIN_PEAK and voiced >= MIN_VOICED),
            'voiced': round(float(voiced), 2), 'peak': round(peak, 3), 'dur': round(len(x) / sr, 2)}


if __name__ == '__main__':
    bad = 0
    for p in sys.argv[1:]:
        try:
            r = measure(p)
        except Exception as ex:  # файли вайрон ҳам «нагузашт» аст
            r = {'file': p, 'ok': False, 'error': str(ex)[:120]}
        bad += 0 if r['ok'] else 1
        print(json.dumps(r, ensure_ascii=False))
    sys.exit(1 if bad else 0)
