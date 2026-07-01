import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) {
    console.log("Course not found");
    return;
  }

  const keepIds = ['cmqngcvui0001ee513prbg336', 'cmqnoasbl0001m91pzwigdj7f'];

  const deleted = await prisma.module.deleteMany({
    where: {
      courseId: course.id,
      id: { notIn: keepIds }
    }
  });

  console.log(`Deleted ${deleted.count} old modules.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
