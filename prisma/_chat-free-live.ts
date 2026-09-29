/**
 * Санҷиши ЗИНДАи «суҳбати ОЗОД» бо модели воқеӣ (29.09.2026).
 *
 *   npx ts-node-transpile-only -O '{"module":"commonjs","moduleResolution":"node"}' prisma/_chat-free-live.ts [ru|en]
 *
 * Шикояти корбар: «ҳар дафъа tea or coffee мепурсад; бояд комилан озод бошад —
 * хонанда дар ҳар мавзӯъ гап занад, Рамз ба гапаш ҷавоб диҳад, ба саволаш ҷавоб
 * диҳад, хаторо ислоҳ кунад». Хонанда мавзӯи ХУДРО (футбол) интихоб мекунад,
 * аз Рамз савол медиҳад, як хато мекунад ва як бор хомӯш мемонад.
 * Ҳамон мантиқи роут: кӯшиши дуюм бо `retryNote`.
 */
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { openAiChat } from '../lib/ai/openai';
import { isReasoningModel } from '../lib/speaking/judge';
import {
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

const LANG = process.argv[2] === 'en' ? 'en' : 'ru';
const LANGUAGE = LANG === 'en' ? 'English' : 'Russian';

// null = хомӯш. `mistake` = ҷумлаи бо хато (бояд fix ояд).
type Step = { say: string | null; note?: string; mistake?: boolean; football?: boolean };
const STEPS: Step[] = {
  ru: [
    { say: 'Меня зовут Мухаммад.' },
    { say: 'Я хочу говорить о футболе.', note: 'мавзӯи ХУДИ хонанда' },
    { say: 'Я люблю Реал Мадрид.', football: true },
    { say: 'А ты любишь футбол?', note: 'САВОЛ ба Рамз — бояд ҷавоб диҳад', football: true },
    { say: 'Вчера я играть футбол с друзья.', mistake: true, football: true },
    { say: null, note: 'хомӯш — ҳамон мавзӯъ, на чой/қаҳва', football: true },
    { say: 'Да.' },
    { say: 'Что значит слово «вратарь»?', note: 'саволи забонӣ — бояд шарҳ диҳад' },
    { say: 'Спасибо. Пока!' },
  ],
  en: [
    { say: 'My name is Muhammad.' },
    { say: 'I want to talk about football.', note: 'мавзӯи ХУДИ хонанда' },
    { say: 'I like Real Madrid.', football: true },
    { say: 'Do you like football?', note: 'САВОЛ ба Рамз — бояд ҷавоб диҳад', football: true },
    { say: 'Yesterday I play football with my friend.', mistake: true, football: true },
    { say: null, note: 'хомӯш — ҳамон мавзӯъ, на чой/қаҳва', football: true },
    { say: 'Yes.' },
    { say: 'What does "goalkeeper" mean?', note: 'саволи забонӣ — бояд шарҳ диҳад' },
    { say: 'Thank you. Bye!' },
  ],
}[LANG];

async function main() {
  const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }));
  const sql = neon(env.DATABASE_URL);
  const cfg = JSON.parse(((await sql`SELECT "valueJson" FROM "AppSetting" WHERE key = 'ai_settings'`) as { valueJson: string }[])[0].valueJson) as { model: string; baseUrl: string; apiKey: string };
  const model = process.env.MODEL || cfg.model;
  const reasoning = isReasoningModel(model);
  console.log(`модел: ${model} · забон: ${LANGUAGE}`);

  const once = async (history: ChatLine[], memory: ChatMemory, mode: ChatMode, note?: string) => {
    const messages = buildChatMessages({ language: LANGUAGE, level: CHAT_LEVEL, memory, known: [], history, closing: false, openTopic: 'weekend' }, mode);
    const res = await openAiChat({ apiKey: cfg.apiKey, model, baseUrl: cfg.baseUrl, messages: note ? [...messages, { role: 'user', content: note }] : messages, maxTokens: reasoning ? 1500 : 350, temperature: 0.7, timeoutMs: 25000, extra: reasoning ? { reasoning_effort: 'low' } : undefined });
    if (!res.ok || !res.reply) { console.log('   ⋯', JSON.stringify(res).slice(0, 200)); return null; }
    return parseChatReply(res.reply, history.length === 0 || mode === 'nudge');
  };

  let bad = 0;
  let memory: ChatMemory = { name: '', facts: [] };
  const history: ChatLine[] = [];
  let mode: ChatMode = 'turn';
  let prev: Step | null = null;
  for (const step of [...STEPS, null]) {
    let r = await once(history, memory, mode);
    if (!r) { console.log('✗ модел ҷавоб надод'); bad++; break; }
    const p = replyProblem(r.reply, history, { closing: false, goodbye: r.goodbye });
    if (p) {
      console.log(`   ↻ ${p}: «${r.reply}»`);
      await new Promise((res) => setTimeout(res, 1200));
      const second = await once(history, memory, mode, retryNote(p));
      const sp = second ? replyProblem(second.reply, history, { closing: false, goodbye: second.goodbye }) : p;
      if (second && (!sp || sp === p || p === 'repeat')) r = second;
    }
    if (replyProblem(r.reply, history, { closing: false, goodbye: r.goodbye }) === 'many_questions') {
      r = { ...r, reply: trimToOneQuestion(r.reply) };
    }
    const flags: string[] = [];
    if (/\b(tea|coffee)\b|чай|кофе/i.test(r.reply)) { flags.push('❌ЧОЙ/ҚАҲВА'); bad++; }
    if (prev?.football && !/футбол|мяч|матч|гол|игра|реал|команд|football|ball|match|goal|play|game|team|real|madrid|club|friend|друз/i.test(r.reply)) {
      flags.push('⚠️мавзӯъ иваз шуд?');
    }
    if (prev?.mistake) {
      if (r.fix) console.log(`   ✏️ fix: «${r.fix.said}» → «${r.fix.better}» (${r.fix.why})`);
      else { flags.push('❌ислоҳ нашуд'); bad++; }
    }
    if (r.fix && !prev?.mistake) console.log(`   (fix-и иловагӣ: «${r.fix.said}» → «${r.fix.better}»)`);
    console.log(`${mode === 'nudge' ? '🤖💬' : '🤖'} ${r.reply}  ‹${r.replyTg}›${r.topics.length ? ` [мавзӯъҳо: ${r.topics.map((t) => t.labelEn).join(', ')}]` : ''} ${flags.join(' ')}`);
    memory = mergeMemory(memory, r);
    history.push({ who: 'ai', text: r.reply });
    if (!step) break;
    if (step.say === null) {
      console.log(`🧑 … (хомӯш)  — ${step.note}`);
      mode = 'nudge';
    } else {
      console.log(`🧑 ${step.say}${step.note ? `  — ${step.note}` : ''}`);
      history.push({ who: 'me', text: step.say });
      mode = 'turn';
    }
    prev = step;
    await new Promise((res) => setTimeout(res, Number(process.env.SLEEP || 1500)));
  }
  console.log(`\nНАТИҶА: хатои автоматӣ ${bad}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
