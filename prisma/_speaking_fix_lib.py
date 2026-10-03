"""Ёрдамчии ислоҳи мазмуни «Гуфтор» — JSON ва генератор якҷоя (03.10.2026).

Баъзе бастаҳо генератор дар репо надоранд (бастаҳои аввали русӣ дар scratchpad сохта
шуда буданд), баъзеҳо доранд. `fix_text` ҳарду ҷойро якхела нав мекунад:
  • JSON (`content/speaking/<slug>.json`): ҳар воҳиде, ки `text == old` — матн, тарҷума;
    барои `turn` нияти «Бигӯ/Бипурс: …» аз тарҷумаи нав; `accepts` — «old» ҳамчун
    ҷавоби қабулшаванда илова мешавад (агар набошад);
  • генератор (.py, агар дода шавад): ҳамон иваз бо regex (s/w/own ва t).
`add_word` — калимаро ба дарси «Калимаҳо» (дарси 0) иловa/иваз мекунад.
Баъд: `node prisma/_en-a1-sync-db.mjs <slug>…` (умумӣ, на танҳо en) тағйирро ба база мебарад.
"""
import io, json, re, sys

def _intent(tg, old):
    verb = 'Бипурс' if (old or '').startswith('Бипурс') else 'Бигӯ'
    body = tg.rstrip('.!?')
    return f'{verb}: {body[0].lower() + body[1:]}'

def _load(slug):
    p = f'content/speaking/{slug}.json'
    return p, json.load(io.open(p, encoding='utf-8'))

def _save(p, j):
    io.open(p, 'w', encoding='utf-8', newline='').write(json.dumps(j, ensure_ascii=False, indent=2) + '\n')

def fix_text(slug, old, new, tg, gen=None):
    p, j = _load(slug)
    n = 0
    for L in j['lessons']:
        for it in L['items']:
            if it.get('text') == old:
                it['text'] = new
                it['translation'] = tg
                if it.get('kind') == 'turn':
                    it['intent'] = _intent(tg, it.get('intent'))
                    acc = it.get('accepts') or []
                    if old not in acc and old != new:
                        it['accepts'] = (acc + [old])[-3:]
                n += 1
    if n == 0:
        sys.exit(f'⛔ {slug}: «{old}» ёфт нашуд')
    _save(p, j)
    if gen:
        s = io.open(gen, encoding='utf-8').read()
        k = 0
        pat = re.compile(r'\b([sw]|own)\("' + re.escape(old) + r'", "[^"]*"')
        s, c = pat.subn(lambda m: f'{m.group(1)}("{new}", "{tg}"', s); k += c
        pat = re.compile(r'(t\(\s*"[^"]*",\s*"[^"]*",\s*)"([^"]*)",(\s*)"' + re.escape(old) + r'",(\s*)"[^"]*"')
        s, c = pat.subn(lambda m: f'{m.group(1)}"{_intent(tg, m.group(2))}",{m.group(3)}"{new}",{m.group(4)}"{tg}"', s); k += c
        if k == 0:
            sys.exit(f'⛔ {gen}: «{old}» ёфт нашуд')
        io.open(gen, 'w', encoding='utf-8', newline='').write(s)
    print(f'  {slug}: {n}× «{old}» → «{new}»')

def replace_word(slug, old, new, tg, note=None, gen=None):
    """Калимаи дарси «Калимаҳо»-ро иваз мекунад (матни калима A1-и маълум → калимаи нав)."""
    p, j = _load(slug)
    for it in j['lessons'][0]['items']:
        if it.get('text') == old and it.get('kind') == 'word':
            it['text'], it['translation'], it['note'] = new, tg, note
            _save(p, j)
            if gen:
                s = io.open(gen, encoding='utf-8').read()
                pat = re.compile(r'w\("' + re.escape(old) + r'", "[^"]*", (None|"[^"]*")\)')
                s2, c = pat.subn(f'w("{new}", "{tg}", {json.dumps(note, ensure_ascii=False) if note else "None"})', s, count=1)
                if c == 0:
                    sys.exit(f'⛔ {gen}: w("{old}") ёфт нашуд')
                io.open(gen, 'w', encoding='utf-8', newline='').write(s2)
            print(f'  {slug}: калима «{old}» → «{new}»')
            return
    sys.exit(f'⛔ {slug}: калимаи «{old}» дар дарси 0 нест')
