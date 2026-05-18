import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// Type definitions for the incoming JSON
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
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { products: true } } },
    });
    return Response.json({ success: true, categories });
  } catch (error) {
    console.error('[languages GET] Error:', error);
    return Response.json({ error: 'Failed to fetch languages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload: LanguagePayload = await req.json();

    if (!payload.languageName || !payload.levels || payload.levels.length === 0) {
      return Response.json(
        { error: 'Номи забон ва ҳадди ақал як сатҳ лозим аст.' },
        { status: 400 }
      );
    }

    // Fallback: agар languageCode bo'sh bo'lsa — 'en-US' ishlatamiz
    const safeLanguageCode = (payload.languageCode || 'en-US').trim() || 'en-US';

    // We use a massive transaction to ensure data integrity.
    // If anything fails (e.g. database disconnect), everything rolls back.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or Find Category (Language)
      const slug = payload.languageName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let category = await tx.category.findUnique({ where: { slug } });
      
      if (!category) {
        category = await tx.category.create({
          data: {
            name: payload.languageName,
            slug: slug,
            icon: payload.flagUrl || '',
            color: '#00D4C0',
            isActive: true,
          }
        });
      }

      // 2. Iterate through Levels and create Products
      let totalWordsAdded = 0;
      
      for (let lvlIdx = 0; lvlIdx < payload.levels.length; lvlIdx++) {
        const level = payload.levels[lvlIdx];
        
        const product = await tx.product.create({
          data: {
            title: `${payload.languageName} - ${level.name}`,
            author: 'RamzBook',
            description: payload.description || `${payload.languageName} - ${level.name} курси пурра`,
            category: category.name,
            categoryId: category.id,
            languageCode: safeLanguageCode, // ← always a valid non-empty string
            isActive: true,
            isFree: lvlIdx === 0, // Level 1 is always free
            rating: 5.0,
            priceSixMonths: 29.0,
            priceLifetime: 119.0,
          }
        });

        // 3. Iterate through Units and create Modules
        for (let unitIdx = 0; unitIdx < level.units.length; unitIdx++) {
          const unit = level.units[unitIdx];
          
          const mod = await tx.module.create({
            data: {
              productId: product.id,
              title: unit.name,
              orderIndex: unitIdx,
              isFreePreview: lvlIdx === 0 && unitIdx === 0,
            }
          });

          // 4. Combine all lessons into a single VOCAB page for the mobile app
          const allWords = unit.lessons.flatMap(lesson => lesson.words);
          totalWordsAdded += allWords.length;

          const formattedWords = allWords.map((w, idx) => ({
            id: `word_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
            originalWord: w.originalWord,
            transcription: w.transcription || '',
            pronunciation: w.pronunciation || '',
            translation: w.translation || '',
            audioUrl: w.audioUrl || '',
            emoji: w.emoji || '',
            exampleSentence: w.exampleSentence || '',
            exampleTranslation: w.exampleTranslation || '',
          }));

          // Only create a VOCAB page if there are words
          if (formattedWords.length > 0) {
            await tx.page.create({
              data: {
                moduleId: mod.id,
                pageType: 'VOCAB',
                orderIndex: 0,
                content: JSON.stringify({ words: formattedWords }),
              }
            });
          }
        }
      }

      return { categoryId: category.id, totalWordsAdded, levelsAdded: payload.levels.length };
    }, {
      maxWait: 20000,  // 20 seconds max wait
      timeout: 60000,  // 60 seconds timeout for large datasets
    });

    revalidatePath('/admin/products');
    revalidatePath('/admin/languages');
    
    return Response.json({ 
      success: true, 
      message: `Забони "${payload.languageName}" бо муваффақият илова шуд! ${result.levelsAdded} сатҳ, ${result.totalWordsAdded} калима.`,
      result 
    });

  } catch (error: any) {
    console.error('[languages POST] Error:', error);
    // Return a meaningful error message to the client
    const message = error?.message || 'Хатои дохилии сервер';
    return Response.json({ error: message }, { status: 500 });
  }
}
