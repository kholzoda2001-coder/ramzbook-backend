# Тавлиди аудиои арабӣ бо edge-tts (ройгон, бе калид, бе лимит).
#
# Овоз: ar-SA-ZariyahNeural — ar-SA, ҳамон локале, ки дар `Language.ttsLocale`-и
# арабӣ навишта шудааст. Аудиои мавҷудаи курс низ 24 kHz / 48 kbps аст, яъне
# ҳамин муҳаррик, вале худи овозро танҳо бо гӯш муайян кардан мумкин — суръати
# ҳамаи овозҳои арабӣ қариб як хел аст (санҷиш: калимаи алоҳида 1.78–1.99с).
#
#   PYTHONUTF8=1 python prisma/_ar-tts.py <out_dir> <items.json> [voice]
#
# items.json: [{"id": "...", "text": "ألف"}, ...] → <out_dir>/<id>.mp3
# ⚠️ Консоли Windows cp1252 аст — бе PYTHONUTF8=1 print-и кириллӣ хато медиҳад.
import asyncio, json, os, sys
import edge_tts

out_dir, items_path = sys.argv[1], sys.argv[2]
VOICE = sys.argv[3] if len(sys.argv) > 3 else 'ar-SA-ZariyahNeural'
CONCURRENCY = 8

os.makedirs(out_dir, exist_ok=True)
items = [it for it in json.load(open(items_path, encoding='utf-8')) if (it.get('text') or '').strip()]


async def one(it, sem):
    path = os.path.join(out_dir, f"{it['id']}.mp3")
    async with sem:
        for attempt in range(3):
            try:
                await edge_tts.Communicate(it['text'], VOICE).save(path)
                print(f"OK   {it['id']}  {os.path.getsize(path)/1024:.1f}KB  {it['text'][:40]}")
                return True
            except Exception as e:
                if attempt == 2:
                    print(f"FAIL {it['id']}: {str(e)[:120]}")
                    return False
                await asyncio.sleep(1.5 * (attempt + 1))


async def main():
    sem = asyncio.Semaphore(CONCURRENCY)
    done = await asyncio.gather(*(one(it, sem) for it in items))
    print(f"\nовоз: {VOICE}")
    print(f"тайёр: {sum(1 for d in done if d)}/{len(items)}")


asyncio.run(main())
