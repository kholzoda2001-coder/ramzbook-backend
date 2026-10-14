// Аудити ФАҚАТ-ХОНИШ-и роҳи «Умумӣ» (goal=general) дар Гуфтор, барои ҳар забон.
// Роҳ = вазъиятҳои бе goals (умумӣ) + вазъиятҳои 'life' (ниг. situations.ts).
// Истифода: node prisma/_speaking-general-audit.mjs [--audio]
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CHECK_AUDIO = process.argv.includes('--audio');
const STAGES = ['words', 'chunks', 'sentences', 'dialogue', 'mission'];

const cats = await prisma.speakingCategory.findMany({
  where: { isActive: true },
  orderBy: { order: 'asc' },
  select: {
    id: true, order: true, goals: true, level: true, titleTranslated: true, scenario: true, isPremium: true,
    targetLanguage: { select: { code: true } },
    nativeLanguage: { select: { code: true } },
    lessons: {
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true, stage: true, mode: true,
        items: {
          orderBy: { order: 'asc' },
          select: {
            id: true, kind: true, text: true, translation: true, audioUrl: true,
            cue: true, cueTranslation: true, cueAudioUrl: true, intent: true, intentAudioUrl: true,
          },
        },
      },
    },
  },
});

const isSit = (c) => c.lessons.some((l) => !!l.stage);
const inGeneral = (c) => isSit(c) && (c.goals.length === 0 || c.goals.includes('life'));

const byLang = new Map();
for (const c of cats) {
  const k = `${c.targetLanguage.code}→${c.nativeLanguage.code}`;
  if (!byLang.has(k)) byLang.set(k, []);
  byLang.get(k).push(c);
}

const allUrls = new Map(); // url → where
for (const [k, list] of byLang) {
  const path = list.filter(inGeneral)
    .sort((a, b) => (a.level ?? 1) - (b.level ?? 1) || (a.goals.length ? 1 : 0) - (b.goals.length ? 1 : 0) || a.order - b.order);
  console.log(`\n=== ${k}: роҳи «Умумӣ» = ${path.length} вазъият`);
  const issues = [];
  let lessons = 0, items = 0;
  for (const c of path) {
    const stages = c.lessons.map((l) => l.stage).filter(Boolean);
    const missing = STAGES.filter((s) => !stages.includes(s));
    lessons += c.lessons.length;
    const tag = c.goals.length ? 'life' : 'умумӣ';
    console.log(`  [${tag.padEnd(5)}] L${c.level ?? 1} #${String(c.order).padStart(3)} ${c.titleTranslated.padEnd(28)} дарс=${c.lessons.length} зинаҳо=${stages.join(',')}`);
    if (missing.length) issues.push(`${c.titleTranslated}: зинаи нест — ${missing.join(',')}`);
    if (!c.scenario?.trim()) issues.push(`${c.titleTranslated}: scenario холӣ`);
    for (const l of c.lessons) {
      if (!l.stage) issues.push(`${c.titleTranslated}: дарси кӯҳна (бе stage) дар вазъият`);
      if (l.items.length === 0) issues.push(`${c.titleTranslated}/${l.stage}: дарс холӣ`);
      for (const i of l.items) {
        items++;
        const w = `${c.titleTranslated}/${l.stage} «${i.text.slice(0, 30)}»`;
        if (!i.text.trim() || !i.translation.trim()) issues.push(`${w}: матн/тарҷума холӣ`);
        if (i.kind !== 'own' && !i.audioUrl) issues.push(`${w}: audioUrl нест`);
        if (i.cue?.trim() && !i.cueTranslation?.trim()) issues.push(`${w}: cueTranslation нест`);
        if (i.cue?.trim() && !i.cueAudioUrl) issues.push(`${w}: cueAudioUrl нест`);
        if (i.kind === 'turn' && !i.intent?.trim()) issues.push(`${w}: turn бе intent`);
        if (i.intent?.trim() && !i.intentAudioUrl) issues.push(`${w}: intentAudioUrl нест`);
        for (const u of [i.audioUrl, i.cueAudioUrl, i.intentAudioUrl]) if (u) allUrls.set(u, `${k} ${w}`);
      }
    }
  }
  console.log(`  ҷамъ: ${lessons} дарс, ${items} воҳид | мушкил: ${issues.length}`);
  for (const s of issues.slice(0, 25)) console.log('   ⚠️ ' + s);
  if (issues.length > 25) console.log(`   … боз ${issues.length - 25}`);
}

if (CHECK_AUDIO) {
  const urls = [...allUrls.keys()];
  console.log(`\nСанҷиши аудио: ${urls.length} URL…`);
  const bad = [];
  let idx = 0;
  async function worker() {
    while (idx < urls.length) {
      const u = urls[idx++];
      let ok = false, st = 0;
      for (let t = 0; t < 3 && !ok; t++) {
        try {
          const r = await fetch(u, { method: 'HEAD' });
          st = r.status;
          ok = r.ok && Number(r.headers.get('content-length') ?? 1) > 1000;
        } catch { st = -1; }
      }
      if (!ok) bad.push(`${st} ${u} — ${allUrls.get(u)}`);
    }
  }
  await Promise.all(Array.from({ length: 16 }, worker));
  console.log(`Аудиои бад: ${bad.length}`);
  for (const b of bad.slice(0, 40)) console.log('   ❌ ' + b);
}
await prisma.$disconnect();
