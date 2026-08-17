import json, io, os, sys, time, urllib.request

SP = os.environ['SP']
KEY = io.open(SP + '/key.txt').read().strip()
BASE = 'https://admin.ramz.tj/api/admin'
W = json.load(io.open(SP + '/ar_mod6_words.json', encoding='utf-8'))
C = json.load(io.open(SP + '/ar_mod6_components.json', encoding='utf-8'))
XP = json.load(io.open(SP + '/xp.json'))
COURSE = W['courseId']

MAN_PATH = SP + '/ar_mod6_manifest.json'
man = json.load(io.open(MAN_PATH, encoding='utf-8')) if os.path.exists(MAN_PATH) else {}


def save():
    json.dump(man, io.open(MAN_PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def call(method, path, body=None):
    data = json.dumps(body, ensure_ascii=False).encode('utf-8') if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={'Content-Type': 'application/json; charset=utf-8',
                                          'x-admin-api-key': KEY})
    last = None
    for a in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:
            last = e
            time.sleep(3)
    raise SystemExit('FAILED %s %s :: %s' % (method, path, last))


log = []

# ── 1. Модул ──────────────────────────────────────────────────────────────
if 'moduleId' not in man:
    m = W['module']
    r = call('POST', '/modules', {'courseId': COURSE, 'title': m['title'],
                                  'titleTranslated': m['titleTranslated'],
                                  'emoji': m['emoji'], 'order': m['order']})
    man['moduleId'] = r['module']['id']
    save()
log.append('module: ' + man['moduleId'])

MOD = man['moduleId']
xp = {o: (x, d) for o, x, d in XP}


def mk_lesson(spec):
    """Дарсро месозад (агар аллакай набошад) ва id-ро бармегардонад."""
    key = 'lesson_%d' % spec['order']
    if key in man:
        return man[key]
    x, d = xp.get(spec['order'], (15, 4))
    r = call('POST', '/lessons', {
        'moduleId': MOD, 'title': spec['title'],
        'titleTranslated': spec['titleTranslated'],
        'type': spec.get('type', spec['skillType']),
        'skillType': spec['skillType'], 'emoji': spec['emoji'],
        'cefrLevel': 'A1', 'xpReward': x, 'duration': d, 'order': spec['order'],
    })
    man[key] = r['lesson']['id']
    save()
    return man[key]


def mk_words(lesson_id, words, tag):
    done = man.setdefault('words', {})
    for i, w in enumerate(words):
        k = '%s_%d' % (tag, i)
        if k in done:
            continue
        r = call('POST', '/words', {
            'lessonId': lesson_id, 'word': w['word'], 'translation': w['translation'],
            'ipa': w['ipa'], 'ipaTajik': w['ipaTajik'], 'emoji': w['emoji'],
            'example': w['example'], 'exampleTrans': w['exampleTrans'],
            'partOfSpeech': w.get('partOfSpeech', ''), 'difficulty': 1, 'order': i,
        })
        done[k] = r['word']['id']
        save()


# ── 2. Дарсҳои луғавӣ + калимаҳо ──────────────────────────────────────────
for L in W['vocabLessons']:
    lid = mk_lesson(L)
    mk_words(lid, L['words'], 'v%d' % L['order'])
    log.append('vocab L%d: %d калима' % (L['order'], len(L['words'])))

# ── 3. Дарси навиштан ─────────────────────────────────────────────────────
wl = W['writingLesson']
wlid = mk_lesson(wl)
mk_words(wlid, wl['words'], 'w')
log.append('writing L%d: %d калима' % (wl['order'], len(wl['words'])))


def link(lesson_id, link_type, link_id):
    call('PUT', '/lessons/' + lesson_id, {'linkType': link_type, 'linkId': link_id})


# ── 4. Грамматика ─────────────────────────────────────────────────────────
g = C['grammar']
glid = mk_lesson(g['lesson'])
if 'grammarTopicId' not in man:
    t = g['topic']
    r = call('POST', '/grammar', {'courseId': COURSE, 'title': t['title'],
                                  'titleTranslated': t['titleTranslated'],
                                  'explanation': t['explanation'], 'emoji': t['emoji'],
                                  'cefrLevel': t['cefrLevel']})
    man['grammarTopicId'] = r['topic']['id']
    save()
TOP = man['grammarTopicId']

for i, ex in enumerate(g['examples']):
    k = 'gex_%d' % i
    if k in man:
        continue
    r = call('POST', '/grammar/examples', {'topicId': TOP, 'sentence': ex['sentence'],
                                           'translation': ex['translation'],
                                           'highlight': ex.get('highlight'), 'order': i})
    man[k] = r.get('example', {}).get('id')
    save()

for i, ru in enumerate(g['rules']):
    k = 'grule_%d' % i
    if k in man:
        continue
    r = call('POST', '/grammar/rules', {'topicId': TOP, 'pattern': ru['pattern'],
                                        'note': ru['note'], 'order': i})
    man[k] = r.get('rule', {}).get('id')
    save()

for i, e in enumerate(g['exercises']):
    k = 'gexer_%d' % i
    if k in man:
        continue
    r = call('POST', '/grammar/exercises', {'topicId': TOP, 'type': e['type'],
                                            'prompt': e['prompt'], 'answer': e['answer'],
                                            'promptTranslated': e.get('promptTranslated'),
                                            'options': e['options'],
                                            'explanation': e['explanation'], 'order': i})
    man[k] = r.get('exercise', {}).get('id')
    save()
link(glid, 'grammar', TOP)
log.append('grammar: %d мисол, %d қоида, %d машқ' % (len(g['examples']), len(g['rules']), len(g['exercises'])))


# ── 5. Компонентҳои фаҳмиш (хониш / шунавоӣ / такрор / имтиҳон) ───────────
def mk_comp(key):
    node = C[key]
    lid = mk_lesson(node['lesson'])
    ex = node['exercise']
    mk = 'comp_' + key
    if mk not in man:
        r = call('POST', '/comprehensions', {
            'courseId': COURSE, 'title': ex['title'], 'titleTranslated': ex['titleTranslated'],
            'passage': ex['passage'], 'passageTranslated': ex['passageTranslated'],
            'kind': ex['kind'], 'emoji': ex['emoji'], 'cefrLevel': ex['cefrLevel']})
        man[mk] = r['comprehension']['id']
        save()
    cid = man[mk]
    for i, q in enumerate(ex['questions']):
        qk = '%s_q%d' % (mk, i)
        if qk in man:
            continue
        r = call('POST', '/comprehensions/questions', {
            'exerciseId': cid, 'question': q['question'],
            'questionTranslated': q['questionTranslated'], 'options': q['options'],
            'correctIndex': q['correctIndex'], 'explanation': q['explanation'], 'order': i})
        man[qk] = r['question']['id']
        save()
    link(lid, 'comprehension', cid)
    log.append('%s: %d савол' % (key, len(ex['questions'])))


for k in ('reading', 'listening', 'review', 'test'):
    mk_comp(k)

# ── 6. Муколама ───────────────────────────────────────────────────────────
d = C['dialogue']
dlid = mk_lesson(d['lesson'])
if 'dialogueId' not in man:
    t = d['topic']
    r = call('POST', '/dialogues', {'courseId': COURSE, 'title': t['title'],
                                    'titleTranslated': t['titleTranslated'],
                                    'scenario': t['scenario'], 'emoji': t['emoji'],
                                    'cefrLevel': t['cefrLevel']})
    man['dialogueId'] = r['dialogue']['id']
    save()
DID = man['dialogueId']
for i, ln in enumerate(d['topic']['lines']):
    k = 'dline_%d' % i
    if k in man:
        continue
    r = call('POST', '/dialogues/lines', {'dialogueId': DID, 'speaker': ln['speaker'],
                                          'text': ln['text'], 'translation': ln['translation'],
                                          'isUser': ln['isUser'], 'order': i})
    man[k] = r.get('line', {}).get('id')
    save()
link(dlid, 'dialogue', DID)
log.append('dialogue: %d сатр' % len(d['topic']['lines']))

save()
io.open(SP + '/build_mod6_log.txt', 'w', encoding='utf-8').write('\n'.join(log))
print('BUILD OK')
