# -*- coding: utf-8 -*-
"""Бастаи мазмуни спикингро месозад ва СИФАТашро месанҷад.

Тафтишгар — на ваъда, балки ҚУЛФ: агар як қоида шиканад, файл навишта
намешавад. Ҳамаи хабарҳо ба ҳарфи лотинӣ, чунки `print()`-и тоҷикӣ дар
консоли Windows (cp1252) хато мепартояд.

Истифода:

    from mkpack import build
    build('meeting_people_en_tg', CATEGORY, LESSONS)
"""
import io
import json
import os
import re
import sys

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   'content', 'speaking')

# Ҷумла аз ин дарозтар ба слотҳо намеғунҷад — сервер онро «бигӯед» мекунад
# ва машқи тарҷума аз даст меравад. Ҳамон рақам дар `lesson/route.ts`.
MAX_SLOT = 8

# Чанд дарси АВВАЛ бояд танҳо КАЛИМА омӯзонад.
#
# Талаби корбар (2026-09-01): «ҳозир бояд танҳо якчанд дарс танҳо калима
# омӯзонад, баъд ҷумлаҳои кӯтоҳ». Бе пойдевори калима ҷумла танҳо садои
# бегона мешавад.
WORD_ONLY_LESSONS = 2

# Калимаҳои хизматӣ, ки алоҳида омӯзонида намешаванд: артикл, феъли
# ёридиҳанда, ҷонишини оддӣ. Онҳо маънои мустақил надоранд ва дар ҳар ҷумла
# такрор мешаванд — дарси алоҳида барои «a» машқро сунъӣ мекунад.
FREE = {
    'a', 'an', 'the', 'and', 'or',
    'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'am', 'is', 'are', 'do', 'does', 'to', 'of', 'in', 'on', 'at',
    'my', 'your', 'his', 'her', 'please', 'not',
}


def _norm(w):
    return re.sub(r"[^a-z']", '', w.lower())


def _key(s):
    """Тарҷумаро барои муқоиса ба шакли ягона меорад."""
    return re.sub(r'[.,!?;:]', '', s.lower()).strip()


def build(slug, category, lessons, native='tg', target='en'):
    """`lessons` = [(унвон, [воҳид…])]; воҳид = dict бо калидҳои зерин.

    kind: 'word' | 'sentence'
    text, translation, literal, note?, cue?, cueTranslation?
    """
    pack = {
        'slug': slug,
        'targetLanguage': target,
        'nativeLanguage': native,
        'category': category,
        'lessons': [],
    }

    problems = []
    taught = set()          # калимаҳои дар ҳамин БОБ омӯзонидашуда
    seen_all = {}           # тарҷума -> дарси аввалин

    for li, (title, items) in enumerate(lessons):
        seen = {}
        out_items = []
        words_here = 0

        for oi, it in enumerate(items):
            kind = it['kind']
            text = it['text'].strip()
            tr = it['translation'].strip()

            if not text or not tr:
                problems.append('L%d: maydoni kholi' % (li + 1))
                continue

            words = text.split()

            if kind == 'word':
                words_here += 1
                for w in words:
                    taught.add(_norm(w))
            else:
                if li < WORD_ONLY_LESSONS:
                    problems.append(
                        'L%d: jumla dar darsi TANHO-KALIMA: %s' % (li + 1, text))
                if len(words) > MAX_SLOT:
                    problems.append('L%d: >%d kalima: %s'
                                    % (li + 1, MAX_SLOT, text))
                unknown = [
                    w for w in (_norm(x) for x in words)
                    if w and w not in FREE and w not in taught
                    and w.rstrip('s') not in taught
                ]
                if unknown:
                    problems.append('L%d: naomukhta [%s] dar: %s'
                                    % (li + 1, ', '.join(unknown), text))

            # Ду тарҷумаи якхела дар ЯК дарс бозии мачро қулф мекунад.
            k = _key(tr)
            if k in seen:
                problems.append('L%d: takrori tarjuma: %s' % (li + 1, tr))
            seen[k] = True
            if k in seen_all and seen_all[k] != li:
                problems.append('L%d: tarjuma dar L%d ham hast: %s'
                                % (li + 1, seen_all[k] + 1, tr))
            seen_all[k] = li

            out_items.append({
                'order': oi,
                'kind': kind,
                'text': text,
                'translation': tr,
                'literal': it.get('literal'),
                'note': it.get('note'),
                'cue': it.get('cue'),
                'cueTranslation': it.get('cueTranslation'),
            })

        if li < WORD_ONLY_LESSONS and words_here == 0:
            problems.append('L%d: darsi TANHO-KALIMA bе kalima' % (li + 1))

        pack['lessons'].append(
            {'order': li, 'title': title, 'items': out_items})

    n_w = sum(1 for l in pack['lessons'] for i in l['items']
              if i['kind'] == 'word')
    n_s = sum(1 for l in pack['lessons'] for i in l['items']
              if i['kind'] != 'word')

    if problems:
        print('XATO (%d) -- fayl NANAVISHTA shud:' % len(problems))
        for p in problems:
            print('   ', p.encode('ascii', 'replace').decode())
        sys.exit(1)

    path = os.path.join(OUT, slug + '.json')
    io.open(path, 'w', encoding='utf-8', newline='\n').write(
        json.dumps(pack, ensure_ascii=False, indent=2) + '\n')

    # Ҳар калима 3 қадам (say + wordEcho + translate), ҳар ҷумла 1.
    steps = n_w * 3 + n_s
    print('%-24s dars:%d kalima:%d jumla:%d qadam:%d  OK'
          % (slug, len(pack['lessons']), n_w, n_s, steps))
