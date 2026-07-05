import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
const prisma = new PrismaClient();

const AUDIO_DIR = process.argv[2]; // path to ramz-audio/audio/en
if (!AUDIO_DIR) throw new Error('Usage: node gen-listening-audio.mjs <audio/en dir>');
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) throw new Error('OPENAI_API_KEY missing');

async function tts(text) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: 'nova', input: text, response_format: 'mp3' }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' },
  });
  const comps = await prisma.comprehensionExercise.findMany({
    where: { courseId: course.id, kind: 'listening', audioUrl: null },
    select: { id: true, passage: true, title: true },
  });
  console.log(`Аудио барои ${comps.length} машқи listening тавлид мешавад...`);
  const ids = [];
  for (const c of comps) {
    const buf = await tts(c.passage);
    writeFileSync(`${AUDIO_DIR}/${c.id}.mp3`, buf);
    ids.push(c.id);
    console.log(`  ✅ ${c.id}.mp3 (${(buf.length / 1024).toFixed(0)} KB)  ${c.title}`);
  }
  writeFileSync('tmp/new-listening-ids.json', JSON.stringify(ids));
  console.log(`\n${ids.length} файл сохта шуд. ID-ҳо → tmp/new-listening-ids.json`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
