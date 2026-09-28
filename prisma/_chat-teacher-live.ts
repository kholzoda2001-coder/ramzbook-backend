/**
 * Санҷиши ЗИНДАи «Рамз — устоди озод» бо модели воқеӣ (28.09.2026).
 *
 *   npx ts-node-transpile-only -O '{"module":"commonjs","moduleResolution":"node"}' prisma/_chat-teacher-live.ts
 *
 * Хонанда бо ҷавобҳои КӮТОҲ ва як бор ХОМӮШ. Месанҷад: ҳар сатр савол дорад,
 * савол такрор намешавад, дар бораи кор намепурсад, ҷумлаҳо кӯтоҳ (A1).
 * Ҳамон мантиқи роут: кӯшиши дуюм бо `retryNote`.
 */
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { openAiChat } from '../lib/ai/openai';
import { isReasoningModel } from '../lib/speaking/judge';
import {
  A1_TOPICS,
  CHAT_LEVEL,
  buildChatMessages,
  mergeMemory,
  parseChatReply,
  replyProblem,
  retryNote,
  trimToOneQuestion,
  type ChatLine,
  type ChatMemory,
  type ChatMode,
} from '../lib/speaking/chat';

// Забон: `ru` (пешфарз) ё `en` — prisma/_chat-teacher-live.ts en
const LANG = process.argv[2] === 'en' ? 'en' : 'ru';
const LANGUAGE = LANG === 'en' ? 'English' : 'Russian';
const known = LANG === 'en'
  ? ['My name is Muhammad.', 'I am a builder.', 'Thank you.', 'I am from Tajikistan.']
  : ['Меня зовут Мухаммад.', 'Я строитель.', 'Спасибо.', 'Я из Таджикистана.'];

async function main() {
  const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }));
  const sql = neon(env.DATABASE_URL);
  const cfg = JSON.parse(((await sql`SELECT "valueJson" FROM "AppSetting" WHERE key = 'ai_settings'`) as { valueJson: string }[])[0].valueJson) as { model: string; baseUrl: string; apiKey: string };
  const reasoning = isReasoningModel(cfg.model);

  const once = async (history: ChatLine[], memory: ChatMemory, mode: ChatMode, openTopic: string, note?: string) => {
    const messages = buildChatMessages({ language: LANGUAGE, level: CHAT_LEVEL, memory, known, history, closing: false, openTopic }, mode);
    const res = await openAiChat({ apiKey: cfg.apiKey, model: cfg.model, baseUrl: cfg.baseUrl, messages: note ? [...messages, { role: 'user', content: note }] : messages, maxTokens: reasoning ? 900 : 350, temperature: 0.7, timeoutMs: 15000, extra: reasoning ? { reasoning_effort: 'low' } : undefined });
    return res.ok && res.reply ? parseChatReply(res.reply, history.length === 0 || mode === 'nudge') : null;
  };

  let bad = 0;
  let retries = 0;
  let memory: ChatMemory = { name: 'Мухаммад', facts: ['works on a construction site', 'is from Tajikistan'] };
  // null = хонанда ХОМӮШ монд → nudge.
  const answers: (string | null)[] = LANG === 'en'
    ? ['Good.', 'Yes.', null, 'Tea.', 'No.', 'I like plov.', 'Yes, I have a brother.', "I don't know."]
    : ['Хорошо.', 'Да.', null, 'Чай.', 'Нет.', 'Я люблю плов.', 'Да, у меня брат.', 'Не знаю.'];
  for (let run = 1; run <= 2; run++) {
    const openTopic = A1_TOPICS[Math.floor(Math.random() * A1_TOPICS.length)];
    console.log(`\n══ Суҳбати ${run} · мавзӯи оғоз: ${openTopic}`);
    const history: ChatLine[] = [];
    let mode: ChatMode = 'turn';
    for (const ans of [...answers, LANG === 'en' ? 'Thank you.' : 'Спасибо.']) {
      let r = await once(history, memory, mode, openTopic);
      if (!r) { console.log('✗ модел ҷавоб надод'); bad++; break; }
      const p = replyProblem(r.reply, history, { closing: false, goodbye: r.goodbye });
      if (p) {
        retries++;
        console.log(`   ↻ ${p}: «${r.reply}»`);
        await new Promise((res) => setTimeout(res, 1200));
        const second = await once(history, memory, mode, openTopic, retryNote(p));
        const sp = second ? replyProblem(second.reply, history, { closing: false, goodbye: second.goodbye }) : p;
        if (second && (!sp || sp === p || p === 'repeat')) r = second;
      }
      if (replyProblem(r.reply, history, { closing: false, goodbye: r.goodbye }) === 'many_questions') {
        r = { ...r, reply: trimToOneQuestion(r.reply) };
      }
      const p2 = replyProblem(r.reply, history, { closing: false, goodbye: r.goodbye });
      const n = r.reply.split(/\s+/).length;
      const work = /работ|строй|профес|опыт|зарплат|job|work|salary|construction/i.test(r.reply);
      const wrongLang = LANG === 'en' ? /[а-яё]/i.test(r.reply) : /[a-z]{3,}/i.test(r.reply);
      const flags = [p2 ? `❌${p2}` : '', n > 14 ? `❌дароз(${n})` : '', work ? '⚠️кор' : '', wrongLang ? '❌ЗАБОН' : ''].filter(Boolean).join(' ');
      if (p2 || n > 14 || wrongLang) bad++;
      console.log(`${mode === 'nudge' ? '🤖💬' : '🤖'} ${r.reply}  ‹${r.replyTg}› ${flags}`);
      memory = mergeMemory(memory, r);
      history.push({ who: 'ai', text: r.reply });
      if (ans === null) {
        console.log('🧑 … (хомӯш)');
        mode = 'nudge';
      } else {
        console.log(`🧑 ${ans}`);
        history.push({ who: 'me', text: ans });
        mode = 'turn';
      }
      await new Promise((res) => setTimeout(res, 1500));
    }
  }
  console.log(`\nНАТИҶА: хатои боқимонда ${bad} · кӯшиши дуюм ${retries}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
