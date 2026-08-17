# Хомӯшии сару охири клипҳои MP3-ро мебурад.
#
# Чаро: edge-tts ҳар клипро бо ~0.19с хомӯшии САР ва ~1.2с хомӯшии ОХИР
# медиҳад. Хомӯшии сар маҳз ҳамон «таъхир»-е мешавад, ки хонанда ҳангоми пахши
# ҳарф ҳис мекунад (ба он таъхири шабака ҳам илова мешавад). Хомӯшии охир бошад
# файлро се баробар вазнин мекунад.
#
# Клип кушода мешавад, порчаи садодор бурида ва бо битрейти БОЛОТАР аз асл
# (~77 kbps ба ҷои 48) аз нав кодкунӣ мешавад — пас талафоти кодкунии дубора
# ба гӯш намерасад.
#
#   PYTHONUTF8=1 python prisma/_ar-trim.py <dir_in> <dir_out>
import sys, os, glob
import numpy as np
import soundfile as sf

BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]
BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
SR = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000]}

HEAD_KEEP = 0.03   # чӣ қадар хомӯшӣ пеш аз садо монад
TAIL_KEEP = 0.15   # ва баъд аз он


def frames(buf):
    """Ҳар фрейми MP3: (оғоз, дарозӣ, вақт). ID3 партофта мешавад."""
    i = 0
    if buf[:3] == b'ID3':
        i = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9])
    out = []
    while i < len(buf) - 4:
        if buf[i] == 0xFF and (buf[i + 1] & 0xE0) == 0xE0:
            ver = (buf[i + 1] >> 3) & 3
            layer = (buf[i + 1] >> 1) & 3
            tab = SR.get(ver)
            if layer == 1 and tab:
                br = (BR1 if ver == 3 else BR2)[(buf[i + 2] >> 4) & 15]
                sr = tab[(buf[i + 2] >> 2) & 3]
                pad = (buf[i + 2] >> 1) & 1
                if br and sr:
                    spf = 1152 if ver == 3 else 576
                    ln = (spf // 8) * 1000 * br // sr + pad
                    out.append((i, ln, spf / sr))
                    i += ln
                    continue
        i += 1
    return out


def trim(path_in, path_out):
    data, sr = sf.read(path_in)
    if data.ndim > 1:
        data = data.mean(axis=1)
    amp = np.abs(data)
    peak = amp.max()
    if peak <= 0:
        return None
    idx = np.where(amp > peak * 0.02)[0]
    if len(idx) == 0:
        return None
    a = max(0, idx[0] - int(HEAD_KEEP * sr))
    b = min(len(data), idx[-1] + int(TAIL_KEEP * sr))
    cut = data[a:b]
    # ⚠️ Бурриши ФРЕЙМ ба фрейм (бе кодкунӣ) санҷида шуд ва РАД шуд: MP3
    # «bit reservoir» дорад — фреймҳои аввал ба маълумоти фреймҳои пеш такя
    # мекунанд, пас баъди бурриш декодер хато медиҳад ва садои аввал вайрон
    # мешавад. Кодкунии дубора бо битрейти болотар (~77 kbps ба ҷои 48) ин
    # мушкилро надорад.
    sf.write(path_out, cut, sr, format='MP3', compression_level=0.3)
    return (len(data) / sr, len(cut) / sr, 0, 0)


src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
files = sorted(glob.glob(os.path.join(src, '*.mp3')))
tot_before = tot_after = 0
skipped = 0
for p in files:
    try:
        r = trim(p, os.path.join(dst, os.path.basename(p)))
    except Exception as e:
        r = None
    if r is None:
        skipped += 1
        continue
    tot_before += r[0]
    tot_after += r[1]
n = len(files) - skipped
print(f'файлҳо: {len(files)} · бурида шуд: {n} · гузашт: {skipped}')
if n:
    print(f'миёна: {tot_before / n:.2f}с -> {tot_after / n:.2f}с')
