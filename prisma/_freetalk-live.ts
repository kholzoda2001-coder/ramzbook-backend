/**
 * Санҷиши ЗИНДАи «Озод гап занед» бо модели воқеӣ — бе деплой.
 *
 *   npx ts-node-transpile-only -O '{"module":"commonjs"}' prisma/_freetalk-live.ts "Рӯзи аввал дар объект" "ҷавоб1|ҷавоб2|…"
 *
 * Вазъиятро аз база (HTTP) мегирад, 6 навбат бо ҷавобҳои тайёри хонанда
 * мегузаронад ва сатр/тарҷума/ислоҳро чоп мекунад.
 */
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { openAiChat } from '../lib/ai/openai';
import { isReasoningModel } from '../lib/speaking/judge';
import {
  buildFreeTalkMessages,
  buildPool,
  closingLine,
  isClosingTurn,
  nextPick,
  parseFreeTalkReply,
  type FreeTalkLine,
} from '../lib/speaking/freetalk';

const title = process.argv[2] ?? 'Рӯзи аввал дар объект';
const learner = (process.argv[3] ?? 'Да, я новый.|Меня зовут Алишер.|Я из Таджикистан.|Я работать строитель.|Спасибо, хорошо.').split('|');

async function main() {
  const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }));
  const sql = neon(env.DATABASE_URL);
  const cat = ((await sql`SELECT id, "titleTranslated" FROM "SpeakingCategory" WHERE "titleTranslated" = ${title}`) as { id: string; titleTranslated: string }[])[0];
  if (!cat) throw new Error(`нест: ${title}`);
  const rows = (await sql`SELECT i.text, i.cue, i."cueTranslation", i."cueAudioUrl" FROM "SpeakingItem" i JOIN "SpeakingLesson" l ON l.id = i."lessonId" WHERE l."categoryId" = ${cat.id} AND l."isActive" ORDER BY l."order", i."order"`) as { text: string; cue: string | null; cueTranslation: string | null; cueAudioUrl: string | null }[];
  const pool = buildPool(rows);
  const cfg = JSON.parse(((await sql`SELECT "valueJson" FROM "AppSetting" WHERE key = 'ai_settings'`) as { valueJson: string }[])[0].valueJson) as { model: string; baseUrl: string; apiKey: string };
  console.log(`модел: ${cfg.model} · ҳавз ${pool.length} \n`);

  const history: FreeTalkLine[] = [];
  for (let turn = 0; turn < 6; turn++) {
    const t0 = Date.now();
    const reasoning = isReasoningModel(cfg.model);
    const res = await openAiChat({ apiKey: cfg.apiKey, model: cfg.model, baseUrl: cfg.baseUrl, messages: buildFreeTalkMessages({ language: 'Russian', situation: cat.titleTranslated, pool, history }), maxTokens: reasoning ? 600 : 150, temperature: 0.4, timeoutMs: 15000, extra: reasoning ? { reasoning_effort: 'low' } : undefined });
    const ms = Date.now() - t0;
    if (!res.ok || !res.reply) { console.log(`✗ ${ms}мс ${res.status} ${res.error}`); break; }
    const v = parseFreeTalkReply(res.reply, pool.length, history.length === 0);
    if (v.fix) console.log(`   ✏️ «${v.fix.said}» → «${v.fix.better}»`);
    if (!v.understood) console.log('   ❓ нафаҳмид');
    const line = isClosingTurn(history) ? closingLine('ru') : pool[nextPick(pool, history, v.pick)];
    console.log(`🤖 [${v.pick}] ${line.text}   ‹${line.tg}›  (${ms}мс${line.audioUrl ? ', 🔊' : ''})`);
    history.push({ who: 'partner', text: line.text });
    if (turn < 5) {
      const me = learner[turn] ?? 'Хорошо.';
      console.log(`🧑 ${me}`);
      history.push({ who: 'me', text: me });
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
