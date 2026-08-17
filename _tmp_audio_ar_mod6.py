"""Аудиои модули 6 (арабӣ): edge-tts → Vercel Blob → пайванд ба база."""
import asyncio, json, io, os, time, urllib.request, mimetypes, uuid
import edge_tts

SP = os.environ['SP']
KEY = io.open(SP + '/key.txt').read().strip()
BASE = 'https://admin.ramz.tj/api/admin'
VOICE = 'ar-SA-ZariyahNeural'
OUT = SP + '/m6_audio'
os.makedirs(OUT, exist_ok=True)

W = json.load(io.open(SP + '/ar_mod6_words.json', encoding='utf-8'))
C = json.load(io.open(SP + '/ar_mod6_components.json', encoding='utf-8'))
man = json.load(io.open(SP + '/ar_mod6_manifest.json', encoding='utf-8'))

# ── Рӯйхати кор: (калиди ягона, матн, суръат, навъ, id-и база) ────────────
jobs = []
for L in W['vocabLessons']:
    for i, w in enumerate(L['words']):
        wid = man['words']['v%d_%d' % (L['order'], i)]
        jobs.append(('w_' + wid, w['word'], '-12%', 'word', wid))
for i, w in enumerate(W['writingLesson']['words']):
    wid = man['words']['w_%d' % i]
    jobs.append(('w_' + wid, w['word'], '-12%', 'word', wid))
for i, ex in enumerate(C['grammar']['examples']):
    gid = man.get('gex_%d' % i)
    if gid:
        jobs.append(('g_' + gid, ex['sentence'], '-12%', 'example', gid))
for i, ln in enumerate(C['dialogue']['topic']['lines']):
    lid = man.get('dline_%d' % i)
    if lid:
        jobs.append(('d_' + lid, ln['text'], '-12%', 'line', lid))
# матни пурраи шунавоӣ — сусттар
jobs.append(('c_' + man['comp_listening'], C['listening']['exercise']['passage'], '-8%',
             'comprehension', man['comp_listening']))


async def synth(key, text, rate):
    path = os.path.join(OUT, key + '.mp3')
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return path
    for attempt in range(4):
        try:
            await edge_tts.Communicate(text, VOICE, rate=rate).save(path)
            if os.path.getsize(path) > 1000:
                return path
        except Exception:
            await asyncio.sleep(3)
    raise SystemExit('TTS failed: ' + key)


async def main():
    for n, (key, text, rate, kind, dbid) in enumerate(jobs, 1):
        await synth(key, text, rate)
    print('synth done', len(jobs))


asyncio.run(main())


# ── Боркунӣ ба Vercel Blob ────────────────────────────────────────────────
def upload(path):
    boundary = '----ramz' + uuid.uuid4().hex
    fname = os.path.basename(path)
    body = b''
    body += ('--%s\r\nContent-Disposition: form-data; name="file"; filename="%s"\r\n'
             'Content-Type: audio/mpeg\r\n\r\n' % (boundary, fname)).encode()
    body += io.open(path, 'rb').read()
    body += ('\r\n--%s--\r\n' % boundary).encode()
    req = urllib.request.Request(BASE + '/upload', data=body, method='POST',
                                 headers={'Content-Type': 'multipart/form-data; boundary=' + boundary,
                                          'x-admin-api-key': KEY})
    for a in range(5):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.loads(r.read().decode('utf-8'))
                return d.get('url') or d.get('blob', {}).get('url')
        except Exception:
            time.sleep(4)
    raise SystemExit('upload failed ' + path)


def call(method, path, body):
    data = json.dumps(body, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={'Content-Type': 'application/json; charset=utf-8',
                                          'x-admin-api-key': KEY})
    for a in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception:
            time.sleep(3)
    raise SystemExit('PUT failed ' + path)


ENDPOINT = {'word': '/words/', 'example': '/grammar/examples/',
            'line': '/dialogues/lines/', 'comprehension': '/comprehensions/'}
urls = man.setdefault('audio', {})
for key, text, rate, kind, dbid in jobs:
    if key in urls:
        continue
    u = upload(os.path.join(OUT, key + '.mp3'))
    call('PUT', ENDPOINT[kind] + dbid, {'audioUrl': u})
    urls[key] = u
    json.dump(man, io.open(SP + '/ar_mod6_manifest.json', 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)

print('AUDIO OK', len(urls))
