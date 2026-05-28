import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const modules = await prisma.module.findMany({
      include: { lessons: { include: { words: true } } }
    });

    let deletedModules = 0;
    let deletedLessons = 0;

    for (const mod of modules) {
      if (mod.lessons.length === 0) {
        await prisma.module.delete({ where: { id: mod.id } });
        deletedModules++;
        continue;
      }
      
      let allLessonsEmpty = true;
      for (const lesson of mod.lessons) {
        if (lesson.words.length === 0) {
          await prisma.lesson.delete({ where: { id: lesson.id } });
          deletedLessons++;
        } else {
          allLessonsEmpty = false;
        }
      }

      if (allLessonsEmpty) {
        await prisma.module.delete({ where: { id: mod.id } });
        deletedModules++;
      }
    }

    return NextResponse.json({ success: true, deletedModules, deletedLessons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
