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

// Забон: `ru` (пешфарз), `en` ё `ar` — prisma/_chat-teacher-live.ts ar
const LANG = (['en', 'ar'] as const).find((l) => l === process.argv[2]) ?? 'ru';
const LANGUAGE = { en: 'English', ar: 'Arabic', ru: 'Russian' }[LANG];
const known = {
  en: ['My name is Muhammad.', 'I am a builder.', 'Thank you.', 'I am from Tajikistan.'],
  ar: ['اِسْمِي مُحَمَّدٌ.', 'أَنَا عَامِلُ بِنَاءٍ.', 'شُكْرًا.', 'أَنَا مِنْ طَاجِيكِسْتَانَ.'],
  ru: ['Меня зовут Мухаммад.', 'Я строитель.', 'Спасибо.', 'Я из Таджикистана.'],
}[LANG];
// Арабӣ: ҳиссаи калимаҳои арабӣ бо ҳаракат (хонандаи A1 бе он хонда наметавонад).
const AR_WORD = /[\u0621-\u064A][\u0621-\u0652\u0670]*/g;
const harakatShare = (s: string) => {
  const w = s.match(AR_WORD) ?? [];
  return w.length ? w.filter((x) => /[\u064B-\u0652]/.test(x)).length / w.length : 1;
};

async function main() {
  const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }));
  const sql = neon(env.DATABASE_URL);
  const cfg = JSON.parse(((await sql`SELECT "valueJson" FROM "AppSetting" WHERE key = 'ai_settings'`) as { valueJson: string }[])[0].valueJson) as { model: string; baseUrl: string; apiKey: string };
  // Барои муқоиса: MODEL=qwen/qwen3.8-27b EFFORT=medium (пешфарз — танзими админ).
  const model = process.env.MODEL || cfg.model;
  const reasoning = isReasoningModel(model);

  const once = async (history: ChatLine[], memory: ChatMemory, mode: ChatMode, openTopic: string, note?: string) => {
    const messages = buildChatMessages({ language: LANGUAGE, level: CHAT_LEVEL, memory, known, history, closing: false, openTopic }, mode);
    const res = await openAiChat({ apiKey: cfg.apiKey, model, baseUrl: cfg.baseUrl, messages: note ? [...messages, { role: 'user', content: note }] : messages, maxTokens: reasoning ? 1500 : 350, temperature: 0.7, timeoutMs: 25000, extra: reasoning ? { reasoning_effort: process.env.EFFORT || 'low' } : undefined });
    if (!res.ok || !res.reply) { console.log('   ⋯', JSON.stringify(res).slice(0, 200)); return null; }
    const pr = parseChatReply(res.reply, history.length === 0 || mode === 'nudge');
    if (!pr) console.log('   ⋯ JSON нашуд:', res.reply.slice(0, 200));
    return pr;
  };

  let bad = 0;
  let retries = 0;
  let memory: ChatMemory = { name: 'Мухаммад', facts: ['works on a construction site', 'is from Tajikistan'] };
  // null = хонанда ХОМӮШ монд → nudge.
  // Арабӣ — чунон ки Azure менависад: БЕ ҳаракат. Ҳамаашон ДУРУСТанд.
  const answers: (string | null)[] = {
    en: ['Good.', 'Yes.', null, 'Tea.', 'No.', 'I like plov.', 'Yes, I have a brother.', "I don't know."],
    ar: ['بخير', 'نعم', null, 'شاي', 'لا', 'أحب البلوف', 'نعم عندي أخ', 'لا أعرف'],
    ru: ['Хорошо.', 'Да.', null, 'Чай.', 'Нет.', 'Я люблю плов.', 'Да, у меня брат.', 'Не знаю.'],
  }[LANG];
  let fixes = 0;
  for (let run = 1; run <= 2; run++) {
    const openTopic = A1_TOPICS[Math.floor(Math.random() * A1_TOPICS.length)];
    console.log(`\n══ Суҳбати ${run} · мавзӯи оғоз: ${openTopic}`);
    const history: ChatLine[] = [];
    let mode: ChatMode = 'turn';
    for (const ans of [...answers, { en: 'Thank you.', ar: 'شكرا', ru: 'Спасибо.' }[LANG]]) {
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
      const wrongLang = LANG === 'en' ? /[а-яё]/i.test(r.reply)
        : LANG === 'ar' ? /[a-zа-яё]{3,}/i.test(r.reply) || !/[\u0621-\u064A]/.test(r.reply)
        : /[a-z]{3,}/i.test(r.reply);
      const hs = LANG === 'ar' ? harakatShare(r.reply) : 1;
      // Ҷавобҳои хонанда дурустанд — «ислоҳ» дар арабӣ = модел ҳаракот/эъробро хато шумурд.
      if (LANG === 'ar' && r.fix) { fixes++; console.log(`   ⚠️ fix: «${r.fix.said}» → «${r.fix.better}»`); }
      const flags = [p2 ? `❌${p2}` : '', n > 14 ? `❌дароз(${n})` : '', work ? '⚠️кор' : '', wrongLang ? '❌ЗАБОН' : '',
        hs < 0.8 ? `❌ҳаракат ${Math.round(hs * 100)}%` : ''].filter(Boolean).join(' ');
      if (p2 || n > 14 || wrongLang || hs < 0.8) bad++;
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
      await new Promise((res) => setTimeout(res, Number(process.env.SLEEP || 1500)));
    }
  }
  console.log(`\nНАТИҶА: хатои боқимонда ${bad} · кӯшиши дуюм ${retries}${LANG === 'ar' ? ` · «ислоҳ»-и бардурӯғ ${fixes}` : ''}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
