import asyncio, json, os, sys
import edge_tts

VOICE = 'zh-CN-XiaoxiaoNeural'
CONCURRENCY = 8

out_dir, items_path = sys.argv[1], sys.argv[2]
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
    print(f"\n{sum(1 for d in done if d)}/{len(items)} · voice={VOICE}")

asyncio.run(main())
