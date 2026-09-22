require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function checkAudio() {
  const sql = neon(process.env.DATABASE_URL);
  
  const wordsWithAudio = await sql(`SELECT COUNT(*) as count FROM "Word" WHERE "audioUrl" IS NOT NULL AND "audioUrl" != ''`);
  const wordsWithoutAudio = await sql(`SELECT COUNT(*) as count FROM "Word" WHERE "audioUrl" IS NULL OR "audioUrl" = ''`);
  
  const sentencesWithAudio = await sql(`SELECT COUNT(*) as count FROM "GrammarExample" WHERE "audioUrl" IS NOT NULL AND "audioUrl" != ''`);
  const sentencesWithoutAudio = await sql(`SELECT COUNT(*) as count FROM "GrammarExample" WHERE "audioUrl" IS NULL OR "audioUrl" = ''`);
  
  console.log(`Words WITH audio: ${wordsWithAudio[0].count}`);
  console.log(`Words WITHOUT audio: ${wordsWithoutAudio[0].count}`);
  console.log(`Grammar Examples WITH audio: ${sentencesWithAudio[0].count}`);
  console.log(`Grammar Examples WITHOUT audio: ${sentencesWithoutAudio[0].count}`);
  
  // Let's get a sample URL to see if it's Vercel Blob
  const sample = await sql(`SELECT "audioUrl" FROM "Word" WHERE "audioUrl" IS NOT NULL LIMIT 1`);
  if (sample.length > 0) {
    console.log(`Sample audio URL: ${sample[0].audioUrl}`);
  }
}

checkAudio().catch(console.error);
