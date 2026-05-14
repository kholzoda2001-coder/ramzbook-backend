import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Type definitions for the incoming JSON
interface WordInput {
  originalWord: string;
  transcription?: string;
  pronunciation?: string;
  translation: string;
  audioUrl?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
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

export async function POST(req: NextRequest) {
  try {
    const payload: LanguagePayload = await req.json();

    if (!payload.languageName || !payload.levels || payload.levels.length === 0) {
      return Response.json({ error: 'Invalid payload. Language name and at least one level are required.' }, { status: 400 });
    }

    // We use a massive transaction to ensure data integrity.
    // If anything fails (e.g. database disconnect), everything rolls back.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or Find Category (Language)
      // We use slug for unique identification
      const slug = payload.languageName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let category = await tx.category.findUnique({ where: { slug } });
      
      if (!category) {
        category = await tx.category.create({
          data: {
            name: payload.languageName,
            slug: slug,
            icon: payload.flagUrl, // We store the flag in the icon field
            // Custom colors can be handled later or generated
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
            description: payload.description || `Complete course for ${payload.languageName} - ${level.name}`,
            category: category.name,
            categoryId: category.id,
            languageCode: payload.languageCode,
            isActive: true,
            isFree: lvlIdx === 0, // Automatically make Level 1 free as per monetization strategy!
            rating: 5.0,
            priceSixMonths: 29.0, // Default prices
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
              isFreePreview: lvlIdx === 0 && unitIdx === 0, // First unit of first level is super free
            }
          });

          // 4. Combine all lessons into a single VOCAB page for the mobile app
          // The mobile app extracts words from a page with pageType='VOCAB'
          const allWords = unit.lessons.flatMap(lesson => lesson.words);
          totalWordsAdded += allWords.length;

          // Assign IDs to words for the app to use
          const formattedWords = allWords.map((w, idx) => ({
            id: `word_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
            originalWord: w.originalWord,
            transcription: w.transcription || '',
            pronunciation: w.pronunciation || '',
            translation: w.translation || '',
            audioUrl: w.audioUrl || '',
            exampleSentence: w.exampleSentence || '',
            exampleTranslation: w.exampleTranslation || '',
          }));

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

      return { categoryId: category.id, totalWordsAdded, levelsAdded: payload.levels.length };
    }, {
      maxWait: 15000, // 15 seconds max wait
      timeout: 30000, // 30 seconds timeout for this massive insertion
    });

    // Revalidate caches to immediately show in admin
    revalidatePath('/admin/products');
    
    return Response.json({ 
      success: true, 
      message: `Language '${payload.languageName}' created with ${result.levelsAdded} levels and ${result.totalWordsAdded} words.`,
      result 
    });

  } catch (error) {
    console.error('[languages/new POST] Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
