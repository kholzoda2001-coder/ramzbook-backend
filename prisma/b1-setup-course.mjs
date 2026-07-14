import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  let lastErr = null;
  for (let i = 0; i < 10; i++) {
    try {
      console.log('Attempting to connect to db...', i);
      const en = await prisma.language.findFirst({ where: { code: 'en' } });
      const tg = await prisma.language.findFirst({ where: { code: 'tg' } });
      
      let b1 = await prisma.course.findFirst({ where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'B1' } });
      if (!b1) {
        b1 = await prisma.course.create({
          data: {
            title: 'English B1 - Intermediate',
            description: 'Сатҳи миёна (Intermediate). Дар ин сатҳ шумо метавонед дар ҳолатҳои гуногун мустақилона муошират кунед.',
            level: 'B1',
            isActive: true,
            emoji: '🎓',
            color: '#10B981',
            targetLanguageId: en.id,
            nativeLanguageId: tg.id,
          }
        });
        console.log('Created B1 Course:', b1.id);
      } else {
        console.log('B1 Course already exists:', b1.id);
      }
      return;
    } catch (e) {
      console.error(e.message);
      lastErr = e;
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  console.error("Failed after 10 attempts.");
  process.exit(1);
}
main().finally(() => prisma.$disconnect());
