# Ченаки ВОҚЕИИ ҳар MP3: муддат + баландии садо (ffmpeg volumedetect).
#
# Чаро на парсери сарлавҳаи фрейм: edge-tts файлро аз пораҳо мечаспонад ва дар
# мобайн метавонад тегҳои ID3 гузорад — парсери худсохт дар ҳамон ҷо меистад ва
# муддати НИМ-ро нишон медиҳад. Ғайр аз ин, файли солим метавонад ХОМӮШ бошад
# (HTTP 200, андозаи муқаррарӣ, вале овоз нест) — инро танҳо ченаки садо мегирад.
#
#   PYTHONUTF8=1 python prisma/_de-audio-check.py <dir> <out.json>
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
src_dir, out_path = sys.argv[1], sys.argv[2]
files = sorted(f for f in os.listdir(src_dir) if f.endswith('.mp3'))

DUR = re.compile(r'Duration: (\d+):(\d+):(\d+\.\d+)')
MEAN = re.compile(r'mean_volume: (-?\d+\.?\d*) dB')
MAX = re.compile(r'max_volume: (-?\d+\.?\d*) dB')


def probe(name):
    p = os.path.join(src_dir, name)
    try:
        r = subprocess.run([FF, '-hide_banner', '-i', p, '-af', 'volumedetect', '-f', 'null', '-'],
                           capture_output=True, text=True, errors='replace', timeout=60)
        s = r.stderr
        d = DUR.search(s)
        sec = (int(d.group(1)) * 3600 + int(d.group(2)) * 60 + float(d.group(3))) if d else 0.0
        mean = float(MEAN.search(s).group(1)) if MEAN.search(s) else -99.0
        mx = float(MAX.search(s).group(1)) if MAX.search(s) else -99.0
        return name, {'sec': round(sec, 2), 'mean_db': mean, 'max_db': mx, 'bytes': os.path.getsize(p)}
    except Exception as e:
        return name, {'sec': 0.0, 'mean_db': -99.0, 'max_db': -99.0, 'bytes': 0, 'err': str(e)[:100]}


with ThreadPoolExecutor(max_workers=12) as ex:
    res = dict(ex.map(probe, files))

json.dump(res, open(out_path, 'w', encoding='utf-8'))
print(f'{len(res)} файл ченак шуд → {out_path}')
