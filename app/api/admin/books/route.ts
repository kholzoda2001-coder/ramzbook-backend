import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title, author, category, categoryId, description, coverUrl, pdfUrl,
      preface, guide, isFree, rating, isActive,
      priceSixMonths, priceLifetime,
      readingSteps, proTip,
      alphabet, modulesData, languageCode
    } = body;

    if (!title?.trim()) return NextResponse.json({ error: 'Book title is required' }, { status: 400 });
    if (!author?.trim()) return NextResponse.json({ error: 'Author is required' }, { status: 400 });

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          title: title.trim(),
          author: author.trim(),
          category: category ?? null,
          categoryId: categoryId ?? null,
          description: description ?? null,
          coverUrl: coverUrl ?? null,
          pdfUrl: pdfUrl ?? null,
          preface: preface ?? null,
          guide: guide ?? null,
          isFree: Boolean(isFree),
          priceSixMonths: typeof priceSixMonths === 'number' ? priceSixMonths : null,
          priceLifetime: typeof priceLifetime === 'number' ? priceLifetime : null,
          rating: typeof rating === 'number' ? rating : 4.5,
          isActive: isActive !== false,
          readingSteps: readingSteps ? JSON.stringify(readingSteps) : null,
          proTip: proTip ? JSON.stringify(proTip) : null,
          alphabet: alphabet ? JSON.stringify(alphabet) : null,
          languageCode: languageCode ?? 'en-US',
        },
      });

      if (Array.isArray(modulesData)) {
        for (let i = 0; i < modulesData.length; i++) {
          const mod = modulesData[i];
          const createdModule = await tx.module.create({
            data: {
              productId: newProduct.id,
              title: mod.title || `Module ${i + 1}`,
              orderIndex: i,
              isFreePreview: !mod.isPremium,
            }
          });

          // Create VOCAB page
          if (Array.isArray(mod.vocabulary)) {
            await tx.page.create({
              data: {
                moduleId: createdModule.id,
                pageType: 'VOCAB',
                orderIndex: 0,
                content: JSON.stringify({ words: mod.vocabulary })
              }
            });
          }

          // Create QUIZ page
          if (Array.isArray(mod.quizzes)) {
            await tx.page.create({
              data: {
                moduleId: createdModule.id,
                pageType: 'QUIZ',
                orderIndex: 1,
                content: JSON.stringify({ questions: mod.quizzes })
              }
            });
          }
        }
      }

      return newProduct;
    });

    // Trigger PDF generation asynchronously
    fetch(`${req.nextUrl.origin}/api/admin/books/${product.id}/generate-pdf`, {
      method: 'POST',
      headers: { authorization: req.headers.get('authorization') || '' }
    }).catch(e => console.error('Auto PDF gen error:', e));

    return NextResponse.json({ ...product, createdAt: product.createdAt.toISOString() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error while creating book' }, { status: 500 });
  }
}
