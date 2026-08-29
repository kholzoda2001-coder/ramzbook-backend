import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const lang = await prisma.language.upsert({
    where: { code: 'en' },
    update: {
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
      canBeNative: true,
      canBeTarget: true,
      isActive: true,
      ttsLocale: 'en-US',
      sttLocale: 'en-US',
    },
    create: {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
      canBeNative: true,
      canBeTarget: true,
      isActive: true,
      ttsLocale: 'en-US',
      sttLocale: 'en-US',
    }
  });
  console.log('Upserted English Language:', lang);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
