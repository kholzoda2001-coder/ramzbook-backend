import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

interface WordInput {
  originalWord: string;
  transcription?: string;
  pronunciation?: string;
  translation: string;
  audioUrl?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  emoji?: string;
}

interface LessonInput {
  name: string;
  words: WordInput[];
}

interface UnitInput {
  name: string;
  lessons: LessonInput[];
}

interface LevelInput {
  name: string;
  units: UnitInput[];
}

interface LanguagePayload {
  languageName: string;
  languageCode: string;
  flagUrl?: string;
  description?: string;
  totalWords?: number;
  levels: LevelInput[];
}

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { courses: true } } },
    });
    return NextResponse.json({ success: true, categories: languages, languages });
  } catch (error) {
    console.error('[languages GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload: LanguagePayload = await req.json();

    if (!payload.languageName || !payload.levels || payload.levels.length === 0) {
      return NextResponse.json(
        { error: 'Номи забон ва ҳадди ақал як сатҳ лозим аст.' },
        { status: 400 }
      );
    }

    const safeLanguageCode = (payload.languageCode || 'en').trim().toLowerCase();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or Find Language
      let language = await tx.language.findUnique({ where: { code: safeLanguageCode } });
      
      if (!language) {
        language = await tx.language.create({
          data: {
            code: safeLanguageCode,
            name: payload.languageName,
            nativeName: payload.languageName,
            flag: payload.flagUrl || '🏳️',
            isActive: true,
          }
        });
      }

      let totalWordsAdded = 0;
      
      // 2. Iterate through Levels and create Courses
      for (let lvlIdx = 0; lvlIdx < payload.levels.length; lvlIdx++) {
        const level = payload.levels[lvlIdx];
        
        const course = await tx.course.create({
          data: {
            languageId: language.id,
            level: level.name || 'A1',
            title: `${payload.languageName} - ${level.name}`,
            description: payload.description || `${payload.languageName} - ${level.name} курси пурра`,
            emoji: '📚',
            color: '#4F46E5',
            sortOrder: lvlIdx,
            isActive: true,
          }
        });

        // 3. Iterate through Units
        for (let unitIdx = 0; unitIdx < level.units.length; unitIdx++) {
          const unitData = level.units[unitIdx];
          
          const unit = await tx.unit.create({
            data: {
              courseId: course.id,
              title: unitData.name,
              emoji: '🎯',
              color: '#10B981',
              sortOrder: unitIdx,
              isPremium: lvlIdx > 0, // Level A1 is free, rest is premium
            }
          });

          // 4. Iterate through Lessons
          for (let lessonIdx = 0; lessonIdx < unitData.lessons.length; lessonIdx++) {
             const lessonData = unitData.lessons[lessonIdx];
             
             const lesson = await tx.lesson.create({
               data: {
                 unitId: unit.id,
                 title: lessonData.name,
                 titleTranslations: { tg: lessonData.name, ru: lessonData.name, en: lessonData.name, uz: lessonData.name },
                 emoji: '📝',
                 xpReward: 50,
                 estimatedMin: 5,
                 sortOrder: lessonIdx,
               }
             });

             // 5. Add words
             for (let wordIdx = 0; wordIdx < lessonData.words.length; wordIdx++) {
               const w = lessonData.words[wordIdx];
               const word = await tx.word.create({
                 data: {
                   langFrom: safeLanguageCode,
                   langTo: 'tg',
                   word: w.originalWord,
                   translation: w.translation,
                   ipa: w.transcription || w.pronunciation,
                   audioUrl: w.audioUrl,
                   emoji: w.emoji,
                   example: w.exampleSentence,
                   exampleTranslation: w.exampleTranslation,
                   difficulty: 1,
                 }
               });

               await tx.lessonWord.create({
                 data: {
                   lessonId: lesson.id,
                   wordId: word.id,
                   sortOrder: wordIdx,
                 }
               });
               
               totalWordsAdded++;
             }
          }
        }
      }

      return { languageId: language.id, totalWordsAdded, levelsAdded: payload.levels.length };
    }, {
      maxWait: 20000,
      timeout: 60000,
    });

    revalidatePath('/admin/courses');
    revalidatePath('/admin/languages');
    
    return NextResponse.json({ 
      success: true, 
      message: `Забони "${payload.languageName}" бо муваффақият илова шуд! ${result.levelsAdded} сатҳ, ${result.totalWordsAdded} калима.`,
      result 
    });

  } catch (error: any) {
    console.error('[languages POST] Error:', error);
    const message = error?.message || 'Хатои дохилии сервер';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
