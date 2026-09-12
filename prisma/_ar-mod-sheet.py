# Варақаи ҷамъии расмҳои ЯК модул — барои дидан бо чашм.
#
# Чаро маҳз ин: таҷрибаи се аудити гузашта нишон дод, ки скрипт ҳеҷ чизро
# исбот намекунад — файл ҳаст, HTTP 200 медиҳад, вале расм метавонад рӯи
# вайрон, пӯсти луч ё ашёи тамоман дигарро нишон диҳад.
#
#   node prisma/_ar-mod-images.mjs 1 --json > tmp/m2-imgs.json
#   python prisma/_ar-mod-sheet.py tmp/m2-imgs.json tmp/sheets/ar-m2
import hashlib
import json
import os
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from PIL import Image, ImageDraw, ImageFont

COLS, ROWS = 5, 4
CELL = 300
LABEL = 40
PAD = 8


def load_font(size, bold=False):
    for name in (('arialbd.ttf', 'seguisb.ttf') if bold else ('arial.ttf', 'segoeui.ttf')):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def fetch(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return True
    try:
        # URL аз JSON аллакай percent-encoded аст — аввал онро КУШОЕМ,
        # вагарна `%` дубора рамзгузорӣ шуда, `%25` мешавад ва 404 медиҳад.
        scheme, rest = url.split('://', 1)
        host, _, tail = rest.partition('/')
        tail = urllib.parse.unquote(tail)
        url = f'{scheme}://{host}/' + urllib.parse.quote(tail, safe='/@')
        req = urllib.request.Request(url, headers={'User-Agent': 'ramz-audit'})
        with urllib.request.urlopen(req, timeout=60) as r, open(path, 'wb') as f:
            f.write(r.read())
        return True
    except Exception as e:                          # noqa: BLE001
        print(f'  x {url}: {e}')
        return False


def main():
    items = json.load(open(sys.argv[1], encoding='utf-8'))
    out_base = sys.argv[2]
    cache = os.path.join(os.path.dirname(out_base), 'imgcache-mod')
    os.makedirs(cache, exist_ok=True)
    os.makedirs(os.path.dirname(out_base), exist_ok=True)

    # ⚠️ Кэш аз рӯи ХЭШИ URL, на аз рӯи рақами тартиб.
    #
    # Пеш номи файл `000.png`, `001.png`… буд ва `fetch()` файли мавҷударо
    # аз нав намегирифт — дар натиҷа варақаи модули ДУЮМ расмҳои кэшшудаи
    # модули АВВАЛРО нишон дод («Мард» → торти зодрӯз). Ҳар се даъвои
    # «расмҳо тозаанд» бо ин доми ноаён бекор мешуд.
    for it in items:
        h = hashlib.md5(it['url'].encode('utf-8')).hexdigest()[:16]
        it['file'] = os.path.join(cache, f'{h}.png')
    with ThreadPoolExecutor(max_workers=8) as ex:
        list(ex.map(lambda it: fetch(it['url'], it['file']), items))

    f_num = load_font(20, bold=True)
    f_tg = load_font(19, bold=True)
    f_les = load_font(15)

    per = COLS * ROWS
    for s in range(0, len(items), per):
        chunk = items[s:s + per]
        w = COLS * (CELL + PAD) + PAD
        h = ROWS * (CELL + LABEL + PAD) + PAD + 44
        sheet = Image.new('RGB', (w, h), (255, 255, 255))
        d = ImageDraw.Draw(sheet)
        d.text((PAD + 2, 12), f'Расмҳои {s + 1}–{s + len(chunk)} аз {len(items)}',
               font=load_font(24, bold=True), fill=(20, 20, 30))

        for k, it in enumerate(chunk):
            col, row = k % COLS, k // COLS
            x = PAD + col * (CELL + PAD)
            y = 44 + PAD + row * (CELL + LABEL + PAD)
            try:
                im = Image.open(it['file']).convert('RGB')
                im.thumbnail((CELL, CELL))
                sheet.paste(im, (x + (CELL - im.width) // 2, y + (CELL - im.height) // 2))
            except Exception:                        # noqa: BLE001
                d.rectangle((x, y, x + CELL, y + CELL), fill=(245, 240, 240))
                d.text((x + 10, y + CELL // 2), 'кушода нашуд', font=f_les, fill=(200, 60, 60))
            d.rectangle((x, y, x + CELL, y + CELL), outline=(225, 225, 232), width=1)

            n = s + k + 1
            d.rectangle((x, y, x + 46, y + 27), fill=(26, 26, 46))
            d.text((x + 8, y + 3), f'{n}', font=f_num, fill=(255, 255, 255))
            d.text((x + 2, y + CELL + 3), it['tg'][:26], font=f_tg, fill=(20, 20, 30))
            d.text((x + 2, y + CELL + 22), f"Дарси {it['lesson']}", font=f_les, fill=(120, 120, 140))

        path = f'{out_base}-{s // per + 1:02d}.png'
        sheet.save(path, optimize=True)
        print(f'  OK {path}')


if __name__ == '__main__':
    main()
