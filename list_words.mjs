import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const tr = await prisma.course.findFirst({where: {targetLanguage: {code: 'tr-TR'}}});
  const words = await prisma.word.findMany({where: {courseId: tr.id}});
  console.log(words.map(w => w.word).join(', '));
}
main().catch(console.error).finally(() => prisma.$disconnect());
