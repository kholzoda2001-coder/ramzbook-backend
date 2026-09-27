/**
 * Санҷиши ЗИНДАи «Сӯҳбат бо AI» бо модели воқеӣ — бе деплой ва бе корбар.
 *
 *   npx ts-node-transpile-only -O '{"module":"commonjs","moduleResolution":"node"}' prisma/_chat-live.ts
 *
 * Ду суҳбат: (1) хонандаи нав — ном, кор, мавзӯъ, хато, «Чӣ гӯям?», «пока»;
 * (2) бори дигар — хотира аз суҳбати 1.
 */
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { openAiChat } from '../lib/ai/openai';
import { isReasoningModel } from '../lib/speaking/judge';
import {
  buildChatMessages,
  mergeMemory,
  parseChatReply,
  parseHints,
  saysGoodbye,
  type ChatLine,
  type ChatMemory,
  type ChatMode,
} from '../lib/speaking/chat';

const known = ['Меня зовут Алишер.', 'Я строитель.', 'Где цемент?', 'Спасибо.', 'Я из Таджикистана.'];

async function main() {
  const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }));
  const sql = neon(env.DATABASE_URL);
  const cfg = JSON.parse(((await sql`SELECT "valueJson" FROM "AppSetting" WHERE key = 'ai_settings'`) as { valueJson: string }[])[0].valueJson) as { model: string; baseUrl: string; apiKey: string };
  const reasoning = isReasoningModel(cfg.model);
  const call = async (history: ChatLine[], memory: ChatMemory, mode: ChatMode, closing = false) => {
    const t0 = Date.now();
    const res = await openAiChat({ apiKey: cfg.apiKey, model: cfg.model, baseUrl: cfg.baseUrl, messages: buildChatMessages({ language: 'Russian', level: 'A1', memory, known, history, closing }, mode), maxTokens: reasoning ? 900 : 350, temperature: 0.7, timeoutMs: 15000, extra: reasoning ? { reasoning_effort: 'low' } : undefined });
    return { res, ms: Date.now() - t0 };
  };

  let memory: ChatMemory = { name: '', facts: [] };
  const script = ['Меня зовут Алишер.', 'Я работаю на стройке.', 'О работе.', 'Там много цемент.', '__hint__', 'Ну ладно, пока!'];
  for (const [n, plan] of [[1, script], [2, ['Хорошо. Сегодня я носил кирпич.', 'Спасибо, до свидания!']]] as const) {
    console.log(`\n══ Суҳбати ${n} · хотира: ${JSON.stringify(memory)}`);
    const history: ChatLine[] = [];
    const lines = [...plan];
    for (let turn = 0; turn < 8; turn++) {
      const { res, ms } = await call(history, memory, 'turn');
      const r = res.ok && res.reply ? parseChatReply(res.reply, history.length === 0) : null;
      if (!r) { console.log(`✗ ${ms}мс ${res.status} ${res.error ?? res.reply}`); break; }
      memory = mergeMemory(memory, r);
      console.log(`🤖 ${r.reply}   ‹${r.replyTg}› (${ms}мс)`);
      if (r.topics.length) console.log(`   🏷️ ${r.topics.map((t) => `${t.label}/${t.labelEn} → «${t.say}»`).join(' · ')}`);
      if (r.fix) console.log(`   ✏️ «${r.fix.said}» → «${r.fix.better}» (${r.fix.why})`);
      if (r.name || r.remember.length) console.log(`   🧠 name=${r.name} +${JSON.stringify(r.remember)}`);
      history.push({ who: 'ai', text: r.reply });
      const last = history.filter((l) => l.who === 'me').at(-1)?.text ?? '';
      if (r.goodbye || (last && saysGoodbye(last))) { console.log('   👋 тамом'); break; }
      let me = lines.shift();
      if (me === '__hint__') {
        const h = await call(history, memory, 'hint');
        const hints = h.res.ok && h.res.reply ? parseHints(h.res.reply) : [];
        console.log(`   💡 ${hints.map((x) => `«${x.say}» ‹${x.tg}›`).join(' | ') || 'ҲЕҶ'}`);
        me = hints[0]?.say ?? 'Не знаю.';
      }
      if (!me) break;
      console.log(`🧑 ${me}`);
      history.push({ who: 'me', text: me });
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
