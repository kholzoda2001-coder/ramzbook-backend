"""Ёрдамчиҳои умумии генераторҳои «Гуфтор»-и АНГЛИСӢ (28.09.2026).

Луғати транскрипсия (`DICT` аз бобҳои кӯҳна + `EXTRA`), `lit()` ва сохтори
вазъият (`w`, `s`, `own`, `t`, `pack`). Ҳар генератори англисӣ ҳаминро
истифода мебарад, то транскрипсия дар ҳама ҷо якхела бошад.

Калимаи нав → ба `EXTRA` илова кунед; генератор калимаи бе транскрипсияро
ҳамчун хато нишон медиҳад (`MISSING`).
"""

import io, json, glob, re, collections

OUT = 'content/speaking/'

# ── Луғати транскрипсия ─────────────────────────────────────────────────────
_d = collections.defaultdict(collections.Counter)
for f in glob.glob(OUT + '*_en_tg.json'):
    j = json.load(open(f, encoding='utf-8'))
    if j['category'].get('order', 0) and any(L.get('stage') for L in j['lessons']):
        continue  # танҳо бобҳои кӯҳна — манбаи боэътимод
    for L in j['lessons']:
        for it in L['items']:
            t = it.get('text') or ''
            lt = it.get('literal') or ''
            tw = re.findall(r"[A-Za-z']+", t)
            lw = re.sub(r'[,.?!]', ' ', lt).split()
            if tw and len(tw) == len(lw):
                for a, b in zip(tw, lw):
                    _d[a.lower()][b] += 1
DICT = {w: c.most_common(1)[0][0] for w, c in _d.items()}

EXTRA = {
    # шумора ва вақт
    'four': 'фор', 'six': 'сикс', 'seven': 'севэн', 'eight': 'эйт', 'nine': 'найн',
    'twelve': 'твелв', 'twenty': 'твентӣ', 'forty': 'фортӣ', 'fifty': 'фифтӣ', 'hundred': 'ҳандрэд',
    'hour': 'ауэр', 'hours': 'ауэрз', 'year': 'йир', 'week': 'вик', 'month': 'манҫ',
    'morning': 'морнинг', 'evening': 'ивнинг', 'tonight': 'тунайт', 'yesterday': 'естэрдей',
    'friday': 'фрайдей', 'saturday': 'сэтэрдей', 'sunday': 'сандей', 'monday': 'мандей',
    'weekend': 'викенд', 'time': 'тайм', 'late': 'лейт', 'early': 'ёрлӣ', 'until': 'антил',
    'every': 'еврӣ', 'day': 'дей', 'days': 'дейз', 'first': 'фёрст', 'second': 'секэнд', 'third': 'ҫёрд',
    'meter': 'митэр', 'meters': 'митэрз', 'kilo': 'килоу', 'kilos': 'килоуз', 'pieces': 'писиз',
    'enough': 'инаф', 'more': 'мор', 'long': 'лонг', 'dollars': 'доларз',
    # сохтмон
    'brick': 'брик', 'bricks': 'брикс', 'cement': 'симент', 'shovel': 'шавэл', 'hammer': 'ҳэмэр',
    'bucket': 'бакит', 'sand': 'сэнд', 'boards': 'бордз', 'nails': 'нейлз', 'bag': 'бэг', 'bags': 'бэгз',
    'ladder': 'лэдэр', 'wheelbarrow': 'вилбэроу', 'drill': 'дрил', 'paint': 'пейнт', 'tiles': 'тайлз',
    'warehouse': 'веэрҳаус', 'wall': 'вол', 'floor': 'флор', 'upstairs': 'апстеэрз',
    'downstairs': 'даунстеэрз', 'site': 'сайт', 'truck': 'трак', 'pipe': 'пайп', 'helmet': 'ҳелмит',
    'foreman': 'формэн', 'boss': 'бос', 'builder': 'билдэр', 'worker': 'вёркэр',
    'permit': 'пёрмит', 'experience': 'икспириэнс', 'overtime': 'оувэртайм', 'advance': 'эдвэнс',
    'payday': 'пейдей', 'pay': 'пей', 'broken': 'броукэн', 'empty': 'емптӣ', 'power': 'пауэр',
    'leaking': 'ликинг', 'urgent': 'ёрджэнт', 'fix': 'фикс', 'fault': 'фолт', 'accident': 'эксидэнт',
    'another': 'эназэр', 'problem': 'проблэм',
    # фармон ва ҷавоб
    'coming': 'каминг', 'okay': 'оукей', 'bring': 'бринг', 'wait': 'вейт', 'faster': 'фестэр',
    'over': 'оувэр', 'put': 'пут', 'lift': 'лифт', 'stop': 'стоп', 'sure': 'шуэр', 'heavy': 'ҳевӣ',
    'slowly': 'слоулӣ', 'next': 'некст', 'done': 'дан', 'did': 'дид', 'got': 'гот',
    "what's": 'вотс', "it's": 'итс', "i'm": 'айм', "i'll": 'айл', "don't": 'доунт', "can't": 'кент',
    "where's": 'вэрз', "that's": 'ҙэтс', "let's": 'летс', "we're": 'вир', "when's": 'венз',
    "here's": 'ҳирз', "aren't": 'арнт',
    # ҷой
    'left': 'лефт', 'right': 'райт', 'straight': 'стрейт', 'near': 'нир', 'far': 'фар',
    'there': 'ҙэр', 'gate': 'гейт', 'going': 'гоуинг', 'go': 'гоу',
    # бадан ва духтур
    'sick': 'сик', 'head': 'ҳед', 'stomach': 'стамэк', 'back': 'бэк', 'arm': 'арм', 'leg': 'лег',
    'hurts': 'ҳёртс', 'hurt': 'ҳёрт', 'fever': 'фивэр', 'cough': 'коф', 'pills': 'пилз',
    'pharmacy': 'фармэсӣ', 'doctor': 'доктэр', 'rest': 'рест', 'feel': 'фил', 'often': 'офэн',
    'times': 'таймз', 'careful': 'кеэрфул', 'help': 'ҳелп', 'ambulance': 'эмбюлэнс',
    'dangerous': 'дейнджэрэс', 'bleeding': 'блидинг', 'emergency': 'имёрджэнсӣ',
    'quickly': 'квиклӣ', 'fell': 'фел', 'man': 'мэн', 'he': 'ҳӣ', 'is': 'из', 'since': 'синс',
    # бозор ва пул
    'bread': 'бред', 'milk': 'милк', 'apples': 'эпэлз', 'price': 'прайс', 'cheap': 'чип',
    'expensive': 'икспенсив', 'fresh': 'фреш', 'card': 'кард', 'cards': 'кардз', 'cash': 'кэш',
    'take': 'тейк', 'money': 'манӣ', 'much': 'мач', 'too': 'ту', 'some': 'сам', 'all': 'ол',
    # роҳ
    'bus': 'бас', 'subway': 'сабвей', 'ticket': 'тикит', 'train': 'трейн', 'number': 'намбэр',
    'exit': 'егзит', 'traffic': 'трэфик', 'way': 'вей', 'lots': 'лотс',
    # хона
    'room': 'рум', 'kitchen': 'кичэн', 'shower': 'шауэр', 'deposit': 'дипозит', 'available': 'эвейлэбэл',
    'still': 'стил', 'keys': 'киз', 'key': 'кӣ', 'see': 'сӣ',
    # телефон
    'call': 'кол', 'hear': 'ҳир', 'listening': 'лисэнинг', 'boss': 'бос',
    # ҳуҷҷат
    'passport': 'паспорт', 'police': 'пэлис', 'address': 'эдрес', 'visa': 'визэ', 'officer': 'офисэр',
    'understand': 'андэрстэнд', 'repeat': 'рипит', 'speak': 'спик', 'excuse': 'икскюз',
    'everything': 'еврӣҫинг', 'translator': 'трэнслейтэр',
    # ҳамкорон
    'break': 'брейк', 'tired': 'тайэрд', 'together': 'тугеҙэр', 'lunch': 'ланч', 'delicious': 'дилишэс',
    'meal': 'мил', 'enjoy': 'инджой', 'job': 'ҷоб', 'new': 'ню', 'live': 'лив', 'from': 'фром',
    # умумӣ
    'fine': 'файн', 'nice': 'найс', 'meet': 'мит', 'neighbor': 'нейбэр', 'start': 'старт',
    'need': 'нид', 'want': 'вонт', 'like': 'лайк', 'very': 'верӣ', 'good': 'гуд', 'great': 'грейт',
    'bye': 'бай', 'goodbye': 'гудбай', 'hi': 'ҳай', 'hello': 'ҳелоу', 'thanks': 'ҫенкс',
    'tea': 'тӣ', 'water': 'вотэр', 'give': 'гив', 'give me': 'гив мӣ', 'say': 'сей', 'again': 'эген',
    'what': 'вот', 'where': 'вэр', 'which': 'вич', 'how': 'ҳау', 'many': 'менӣ', 'when': 'вен',
    'why': 'вай', 'not': 'нот', 'no': 'ноу', 'yes': 'йес', 'and': 'энд', 'or': 'ор', 'the': 'ҙэ',
    'a': 'э', 'an': 'эн', 'my': 'май', 'your': 'ёр', 'our': 'ауэр', 'me': 'мӣ', 'you': 'ю',
    'it': 'ит', 'this': 'ҙис', 'that': 'ҙэт', 'here': 'ҳир', 'to': 'ту', 'at': 'эт', 'on': 'он',
    'in': 'ин', 'by': 'бай', 'for': 'фор', 'of': 'ов', 'per': 'пёр', 'one': 'ван', 'two': 'ту',
    'three': 'ҫрӣ', 'five': 'файв', 'ten': 'тен', 'am': 'эм', 'are': 'ар', 'i': 'ай', 'we': 'вӣ',
    'do': 'ду', 'have': 'ҳэв', 'can': 'кен', 'please': 'плиз', 'thank': 'ҫенк', 'sorry': 'сорӣ',
    'today': 'тудей', 'tomorrow': 'туморроу', 'now': 'нау', 'work': 'вёрк', 'tajikistan': 'тоҷикистон',
    'uzbekistan': 'ӯзбекистон', 'dushanbe': 'душанбе', 'mexico': 'мексикоу', 'poland': 'поулэнд',
    'main': 'мейн', 'street': 'стрит', 'too': 'ту', 'again': 'эген', 'get': 'гет', 'well': 'вел',
    'be': 'бӣ', 'him': 'ҳим', 'with': 'виз', 'us': 'ас', 'eat': 'ит', 'home': 'ҳоум', 'friend': 'френд',
    'plov': 'плов', 'deal': 'дил', 'guy': 'гай',
    'aid': 'эйд', 'come': 'кам', 'off': 'оф', 'rent': 'рент', "there's": 'ҙэрз', 'working': 'вёркинг',
}


MISSING = set()


def lit(text):
    # «{name}» — номи хонанда, транскрипсия намешавад. «{job}» қолаб мемонад
    # («ай эм {job}»): сервер онро бо касби ҳадафи хонанда пур мекунад
    # (`lib/speaking/persona.ts`, 02.10.2026).
    if '{name}' in text:
        return None
    out = []
    for w in re.findall(r"\{job\}|[A-Za-z']+|___", text):
        if w in ('___', '{job}'):
            out.append(w)
            continue
        k = w.lower()
        v = EXTRA.get(k) or DICT.get(k)
        if not v:
            MISSING.add(w.lower())
            v = '?'
        out.append(v)
    return ' '.join(out)


def w(text, tr, note=None):
    return {"kind": "word", "text": text, "translation": tr, "literal": lit(text), "note": note,
            "cue": None, "cueTranslation": None}


def s(text, tr, note=None, cue=None, cue_tr=None, swaps=None):
    d = {"kind": "sentence", "text": text, "translation": tr, "literal": lit(text), "note": note,
         "cue": cue, "cueTranslation": cue_tr}
    if swaps:
        d["swaps"] = swaps
    return d


def own(text, tr, note, cue, cue_tr, intent):
    return {"kind": "own", "text": text, "translation": tr, "literal": lit(text), "note": note,
            "cue": cue, "cueTranslation": cue_tr, "intent": intent}


def t(cue, cue_tr, intent, text, tr, accepts, note=None):
    return {"kind": "turn", "cue": cue, "cueTranslation": cue_tr, "intent": intent,
            "text": text, "accepts": accepts, "translation": tr, "literal": lit(text), "note": note}


STAGES = ["words", "dialogue", "chunks", "dialogue", "sentences", "dialogue",
          "sentences", "dialogue", "mission"]


def pack(slug, title, title_tg, emoji, order, goals, scenario, lessons, mission_mode=None):
    assert len(lessons) == 9, slug
    out = []
    for i, ((ltitle, items), stage) in enumerate(zip(lessons, STAGES)):
        for j2, it in enumerate(items):
            it["order"] = j2
        L = {"order": i, "stage": stage, "title": ltitle, "items": items}
        if stage == "mission" and mission_mode:
            L["mode"] = mission_mode
        out.append(L)
    d = {"slug": slug, "targetLanguage": "en", "nativeLanguage": "tg",
         "category": {"title": title, "titleTranslated": title_tg, "scenario": scenario,
                      "emoji": emoji, "order": order, "goals": goals,
                      "isPremium": False, "isActive": True},
         "lessons": out}
    io.open(OUT + slug + '.json', 'w', encoding='utf-8').write(
        json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    return slug


