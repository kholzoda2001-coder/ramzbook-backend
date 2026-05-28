import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Get the course
    const course = await prisma.course.findFirst({
      where: {
        targetLanguage: { code: 'en' },
        nativeLanguage: { code: 'tg' }
      }
    });

    if (!course) return NextResponse.json({ error: 'Course not found' });

    // 2. Create Module
    const module = await prisma.module.create({
      data: {
        courseId: course.id,
        title: 'Муқаддима',
        titleTranslated: 'Basics 1',
        emoji: '👋',
        color: '#14B8A6',
        order: 1,
        isActive: true
      }
    });

    // 3. Create Lesson
    const lesson = await prisma.lesson.create({
      data: {
        moduleId: module.id,
        title: 'Салом кардан',
        titleTranslated: 'Greeting',
        type: 'VOCABULARY',
        emoji: '🤝',
        xpReward: 10,
        duration: 5,
        order: 1,
        isActive: true
      }
    });

    // 4. Create Words
    const words = [
      { word: 'Hello', translation: 'Салом', romanization: 'hɛˈloʊ', type: 'WORD', emoji: '👋' },
      { word: 'Good morning', translation: 'Субҳ ба хайр', romanization: 'gʊd ˈmɔrnɪŋ', type: 'PHRASE', emoji: '🌅' },
      { word: 'How are you?', translation: 'Шумо чӣ хел?', romanization: 'haʊ ɑr ju', type: 'PHRASE', emoji: '🤔' },
      { word: 'Thank you', translation: 'Ташаккур', romanization: 'θæŋk ju', type: 'PHRASE', emoji: '🙏' },
      { word: 'Goodbye', translation: 'Хайр', romanization: 'gʊdˈbaɪ', type: 'WORD', emoji: '🚶' }
    ];

    for (let i = 0; i < words.length; i++) {
      await prisma.word.create({
        data: {
          lessonId: lesson.id,
          ...words[i],
          order: i + 1,
          isActive: true
        }
      });
    }

    revalidatePath('/admin/courses');
    
    return NextResponse.json({ success: true, message: 'Seed successful!', module, lesson });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
