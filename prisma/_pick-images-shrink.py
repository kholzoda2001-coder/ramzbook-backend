# Фишурдани расмҳои pick: 1024px/1.2MB → 768px/~60KB.
#
# Чаро муҳим: барномаро асосан аз телефонҳои арзон бо интернети 4G-и суст
# (ва аксаран бо трафики маҳдуд) кушоянд. 163 расм × 1.2MB = ~200MB — ин
# ғайриимкон аст. Дар 768px (андозаи расмҳои мавҷуда) сифат барои экрани
# телефон комилан кофист, вале ҳаҷм ~20-30 маротиба хурдтар мешавад.
import sys, os, glob
from PIL import Image

d = sys.argv[1]
targets = sys.argv[2].split(',') if len(sys.argv) > 2 else None

files = glob.glob(os.path.join(d, '*.png'))
before = after = 0
done = 0
for p in sorted(files):
    key = os.path.splitext(os.path.basename(p))[0]
    if targets and key not in targets:
        continue
    sz = os.path.getsize(p)
    im = Image.open(p).convert('RGB')
    if im.size[0] <= 768 and sz < 150 * 1024:
        continue  # аллакай хурд аст (расмҳои кӯҳна)
    im = im.resize((768, 768), Image.LANCZOS)
    im.save(p, 'PNG', optimize=True)
    # PNG-и оптимишуда ҳанӯз калон аст → JPEG-и босифат хеле хурдтар
    im.save(p, 'JPEG', quality=86, optimize=True, progressive=True)
    na = os.path.getsize(p)
    before += sz; after += na; done += 1
    print(f'  {key:<16} {sz//1024:>5}KB → {na//1024:>4}KB')

if done:
    print(f'\nФишурда шуд: {done} расм | {before//1024//1024}MB → {after//1024}KB '
          f'({before//max(after,1)}× хурдтар)')
else:
    print('Чизе фишурда нашуд.')
