import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'fs';
const prisma = new PrismaClient();

const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/audio/en';
const has = (u) => typeof u === 'string' && u.trim().length > 0;

async function main(){
  const course = await prisma.course.findFirst({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, level:'A1' }});
  const manifest = [];
  const cov = {};

  // 1. Vocabulary headwords
  const words = await prisma.word.findMany({ where:{ lesson:{ module:{ courseId:course.id } } }, select:{ id:true, word:true, audioUrl:true } });
  cov.vocabulary = { total: words.length, withAudio: words.filter(w=>has(w.audioUrl)).length };
  for(const w of words) if(!has(w.audioUrl)) manifest.push({ kind:'word', id:w.id, text:w.word, locale:'en-US', targetUrl:`${CDN}/${w.id}.mp3` });

  // 2. Grammar example sentences (have a dedicated audioUrl)
  const gex = await prisma.grammarExample.findMany({ where:{ topic:{ courseId:course.id } }, select:{ id:true, sentence:true, audioUrl:true } });
  cov.exampleSentences = { total: gex.length, withAudio: gex.filter(e=>has(e.audioUrl)).length };
  for(const e of gex) if(!has(e.audioUrl)) manifest.push({ kind:'grammarExample', id:e.id, text:e.sentence, locale:'en-US', targetUrl:`${CDN}/${e.id}.mp3` });

  // 3. Dialogue lines
  const dls = await prisma.dialogueLine.findMany({ where:{ dialogue:{ courseId:course.id } }, select:{ id:true, text:true, audioUrl:true } });
  cov.dialogues = { total: dls.length, withAudio: dls.filter(d=>has(d.audioUrl)).length };
  for(const d of dls) if(!has(d.audioUrl)) manifest.push({ kind:'dialogueLine', id:d.id, text:d.text, locale:'en-US', targetUrl:`${CDN}/${d.id}.mp3` });

  // 4. Listening comprehension passages
  const comps = await prisma.comprehensionExercise.findMany({ where:{ courseId:course.id }, select:{ id:true, kind:true, passage:true, audioUrl:true } });
  const listening = comps.filter(c=>c.kind==='listening');
  cov.listening = { total: listening.length, withAudio: listening.filter(c=>has(c.audioUrl)).length };
  for(const c of listening) if(!has(c.audioUrl)) manifest.push({ kind:'comprehension', id:c.id, text:c.passage, locale:'en-US', targetUrl:`${CDN}/${c.id}.mp3` });

  // 5. Phrases (if any)
  const phr = await prisma.phrase.findMany({ where:{ collection:{ courseId:course.id } }, select:{ id:true, text:true, audioUrl:true } });
  cov.phrases = { total: phr.length, withAudio: phr.filter(p=>has(p.audioUrl)).length };
  for(const p of phr) if(!has(p.audioUrl)) manifest.push({ kind:'phrase', id:p.id, text:p.text, locale:'en-US', targetUrl:`${CDN}/${p.id}.mp3` });

  mkdirSync('tmp', { recursive:true });
  writeFileSync('tmp/audio-manifest.json', JSON.stringify({ generatedAt:new Date().toISOString(), cdnBase:CDN, note:'Generate TTS for each item with its locale, save as {id}.mp3, upload to the ramz-audio repo /audio/en/, then set the matching audioUrl column.', items:manifest }, null, 2));

  const totals = Object.values(cov).reduce((a,c)=>({total:a.total+c.total, withAudio:a.withAudio+c.withAudio}),{total:0,withAudio:0});
  console.log('=== PHASE 5 AUDIO COVERAGE ===');
  for(const [k,v] of Object.entries(cov)) console.log(`  ${k}: ${v.withAudio}/${v.total} (${v.total? Math.round(v.withAudio/v.total*100):0}%)`);
  console.log(`  OVERALL: ${totals.withAudio}/${totals.total} (${Math.round(totals.withAudio/totals.total*100)}%)`);
  console.log(`  Manifest written: tmp/audio-manifest.json  (${manifest.length} items need generation)`);
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
