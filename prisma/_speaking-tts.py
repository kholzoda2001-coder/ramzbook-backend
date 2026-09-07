# Тавлиди аудиои англисӣ барои бахши ГУФТОР бо edge-tts (ройгон, бе калид).
#
# ── Чаро edge-tts, на `nova` ────────────────────────────────────────────────
# Тамоми курси англисӣ бо `nova`-и OpenAI сохта шудааст, вале ҳисоби OpenAI
# кредит надорад («no credits remaining», 2026-09-07). Интихоб байни «овози
# каме дигар» ва «умуман бе аудио» буд.
#
# ── Чаро маҳз AriaNeural ───────────────────────────────────────────────────
# Панҷ овоз ченак шуд (як калима / як ҷумла):
#     Emma      0.43s / 0.77s   ← ХЕЛЕ ТЕЗ
#     Sonia GB  0.58s / 1.06s
#     Aria      0.72s / 1.25s   ← интихоб
#     Jenny     0.77s / 1.30s
#     Michelle  0.82s / 1.34s
#
# «Хеле тез» доми ҳуҷҷатшудаи ин лоиҳа аст: овозҳои Google дар 0.29–0.62s
# калимаро мегуфтанд ва барои навомӯзи такроркунанда нофаҳмо буданд. Aria
# дар ҳамон дараҷаест, ки барои олмонӣ (KatjaNeural, 0.82–1.01s) тасдиқ шуд.
#
#   PYTHONUTF8=1 python prisma/_speaking-tts.py <out_dir> <items.json>
#
# items.json: [{"id": "...", "text": "Two coffees, please."}, ...]
#           → <out_dir>/<id>.mp3
#
# ⚠️ Такроршаванда: файли аллакай мавҷуд аз нав сохта НАМЕШАВАД, пас скриптро
# баъди канда шудани шабака бехатар аз нав давондан мумкин аст.
#
# ⚠️ Консоли Windows cp1252 аст — бе PYTHONUTF8=1 print-и кириллӣ хато медиҳад.
import asyncio, json, os, sys
import edge_tts

VOICE = 'en-US-AriaNeural'
CONCURRENCY = 8

out_dir, items_path = sys.argv[1], sys.argv[2]
os.makedirs(out_dir, exist_ok=True)
items = [it for it in json.load(open(items_path, encoding='utf-8'))
         if (it.get('text') or '').strip()]


async def one(it, sem):
    path = os.path.join(out_dir, f"{it['id']}.mp3")
    if os.path.exists(path) and os.path.getsize(path) > 800:
        return 'skip'
    async with sem:
        for attempt in range(3):
            try:
                await edge_tts.Communicate(it['text'], VOICE).save(path)
                size = os.path.getsize(path)
                # Файли хеле хурд = ҷавоби холии сервер, на садо. Онро
                # мепартоем, вагарна дар база пайванди мурда мемонад.
                if size < 800:
                    os.remove(path)
                    raise RuntimeError(f'mp3 too small ({size}b)')
                return 'ok'
            except Exception as e:
                if attempt == 2:
                    print(f"FAIL {it['id']}: {str(e)[:120]}")
                    return 'fail'
                await asyncio.sleep(1.5 * (attempt + 1))


async def main():
    sem = asyncio.Semaphore(CONCURRENCY)
    res = await asyncio.gather(*(one(it, sem) for it in items))
    ok = sum(1 for r in res if r == 'ok')
    skip = sum(1 for r in res if r == 'skip')
    fail = sum(1 for r in res if r == 'fail')
    print(f"\nнав={ok} мавҷуд={skip} ноком={fail} · voice={VOICE}")
    if fail:
        sys.exit(1)

asyncio.run(main())
