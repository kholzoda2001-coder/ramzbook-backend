const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.onboardingWord.findMany({ 
  include: { targetLanguage: true, nativeLanguage: true } 
})
.then(ws => {
  console.log('Total Count:', ws.length);
  console.log('Words:', ws.map(w => w.targetLanguage.name + '->' + w.nativeLanguage.name + ': ' + w.word).slice(0,10));
})
.finally(() => p.$disconnect());
