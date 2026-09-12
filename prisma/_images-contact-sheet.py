# Варақаи ҶАМЪӢ (contact sheet) барои дидани расмҳо БО ЧАШМ.
#
# Чаро маҳз ин усул: таҷрибаи ду аудити гузашта нишон дод, ки скрипт ҳеҷ чизро
# исбот намекунад — ҳамаи расмҳо «муваффақ» зеркашӣ мешаванд, вале ~30%-и онҳо
# бад мебарояд (рӯи вайрон, пӯсти луч, ашёи бемаънӣ). Ягона роҳи боэътимод —
# бо чашм дидан. Ва дидани 300 расм як-як ғайриимкон аст, пас онҳо ба варақаҳои
# ҷамъӣ ҷамъ карда мешаванд: 30 расм дар як сурат, ҳар кадом бо РАҚАМ ва калима.
#
# Рақам барои он аст, ки корбар танҳо «12, 27, 30» гӯяд — на калимаҳоро нависад.
#
#   python prisma/_images-contact-sheet.py en A1
#   python prisma/_images-contact-sheet.py ru A1 --out C:/.../sheets
import json
import os
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from PIL import Image, ImageDraw, ImageFont

COLS, ROWS = 6, 5
CELL = 260          # паҳнои катак
LABEL = 34          # баландии сатри имзо
PAD = 8
BG = (255, 255, 255)
INK = (20, 20, 30)
MUTED = (120, 120, 140)


def load_font(size, bold=False):
    # Шрифти системавӣ бо кириллӣ. Arial дар Windows ҳаст ва тоҷикиро мекашад.
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
        # Роҳи арабӣ/кириллӣ бояд percent-encoded шавад, вагарна urllib бо
        # «'ascii' codec can't encode» меафтад — маҳз ин ҳамаи расмҳои
        # арабиро аз варақа берун монда буд.
        scheme, rest = url.split('://', 1)
        host, _, path_part = rest.partition('/')
        url = f'{scheme}://{host}/' + urllib.parse.quote(path_part, safe='/@')
        req = urllib.request.Request(url, headers={'User-Agent': 'ramz-audit'})
        with urllib.request.urlopen(req, timeout=60) as r, open(path, 'wb') as f:
            f.write(r.read())
        return True
    except Exception as e:                      # noqa: BLE001
        print(f'  ✗ {url}: {e}')
        return False


def main():
    if len(sys.argv) < 3:
        print('usage: _images-contact-sheet.py <lang> <level> [--out DIR]')
        sys.exit(2)
    lang, level = sys.argv[1], sys.argv[2].upper()
    out_dir = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else 'tmp/sheets'

    here = os.path.dirname(os.path.abspath(__file__))
    inv = json.load(open(os.path.join(here, '..', 'tmp', 'images-inventory.json'), encoding='utf-8'))
    items = [i for i in inv['items'] if i['lang'] == lang and i['level'] == level]
    if not items:
        print(f'{lang} {level}: расм нест')
        sys.exit(1)

    cache = os.path.join(here, '..', 'tmp', 'imgcache', lang)
    os.makedirs(cache, exist_ok=True)
    os.makedirs(out_dir, exist_ok=True)

    print(f'{lang} {level}: {len(items)} расм — зеркашӣ…')
    for it in items:
        it['file'] = os.path.join(cache, it['url'].rsplit('/', 1)[-1])
    with ThreadPoolExecutor(max_workers=8) as ex:
        list(ex.map(lambda it: fetch(it['url'], it['file']), items))

    f_num = load_font(20, bold=True)
    f_word = load_font(19, bold=True)
    f_tg = load_font(16)

    per = COLS * ROWS
    sheets = []
    for s in range(0, len(items), per):
        chunk = items[s:s + per]
        w = COLS * (CELL + PAD) + PAD
        h = ROWS * (CELL + LABEL + PAD) + PAD + 44
        sheet = Image.new('RGB', (w, h), BG)
        d = ImageDraw.Draw(sheet)
        title = f'{lang.upper()} {level} · расмҳои {s + 1}–{s + len(chunk)} аз {len(items)}'
        d.text((PAD + 2, 12), title, font=load_font(24, bold=True), fill=INK)

        for k, it in enumerate(chunk):
            col, row = k % COLS, k // COLS
            x = PAD + col * (CELL + PAD)
            y = 44 + PAD + row * (CELL + LABEL + PAD)
            box = (x, y, x + CELL, y + CELL)
            try:
                im = Image.open(it['file']).convert('RGB')
                im.thumbnail((CELL, CELL))
                sheet.paste(im, (x + (CELL - im.width) // 2, y + (CELL - im.height) // 2))
            except Exception:                    # noqa: BLE001
                d.rectangle(box, fill=(245, 240, 240))
                d.text((x + 10, y + CELL // 2), 'кушода нашуд', font=f_tg, fill=(200, 60, 60))
            d.rectangle(box, outline=(225, 225, 232), width=1)

            n = s + k + 1
            d.rectangle((x, y, x + 44, y + 26), fill=(26, 26, 46))
            d.text((x + 8, y + 3), f'{n}', font=f_num, fill=(255, 255, 255))
            d.text((x + 2, y + CELL + 3), it['word'][:22], font=f_word, fill=INK)
            d.text((x + 2, y + CELL + 19), (it.get('tg') or '')[:26], font=f_tg, fill=MUTED)

        path = os.path.join(out_dir, f'{lang}-{level}-{s // per + 1:02d}.png')
        sheet.save(path, optimize=True)
        sheets.append(path)
        print(f'  ✓ {path}')

    print(f'\n{len(sheets)} варақа. Рақамҳо аз 1 то {len(items)} — пайваста дар ҳама варақа.')


if __name__ == '__main__':
    main()
