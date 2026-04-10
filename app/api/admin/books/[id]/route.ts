import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            pages: { orderBy: { orderIndex: 'asc' } }
          }
        }
      }
    });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const modulesData = product.modules.map(mod => {
      const vocabPage = mod.pages.find(p => p.pageType === 'VOCAB');
      const quizPage = mod.pages.find(p => p.pageType === 'QUIZ');

      const parsePage = (raw: string | null | undefined) => {
        if (!raw) return {};
        try { return JSON.parse(raw); } catch { return {}; }
      }
      
      const v = parsePage(vocabPage?.content);
      const q = parsePage(quizPage?.content);

      return {
        id: mod.id,
        title: mod.title,
        isPremium: !mod.isFreePreview,
        vocabulary: v.words || [],
        quizzes: q.questions || [],
      };
    });

    return NextResponse.json({ ...product, modulesData });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { modulesData, alphabet, readingSteps, proTip, categoryId, category, ...restData } = body;
    
    // DB expects JSON strings for these fields
    const data = {
      ...restData,
      categoryId: categoryId,
      category: category,
      alphabet: alphabet ? (typeof alphabet === 'string' ? alphabet : JSON.stringify(alphabet)) : null,
      readingSteps: readingSteps ? (typeof readingSteps === 'string' ? readingSteps : JSON.stringify(readingSteps)) : null,
      proTip: proTip ? (typeof proTip === 'string' ? proTip : JSON.stringify(proTip)) : null,
    };

    const product = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: params.id },
        data,
      });

      if (Array.isArray(modulesData)) {
        // Delete all old modules (cascades pages on the DB level or Prisma handles it)
        await tx.module.deleteMany({
          where: { productId: params.id }
        });

        for (let i = 0; i < modulesData.length; i++) {
          const mod = modulesData[i];
          const createdModule = await tx.module.create({
            data: {
              productId: updatedProduct.id,
              title: mod.title || `Module ${i + 1}`,
              orderIndex: i,
              isFreePreview: !mod.isPremium,
            }
          });

          if (Array.isArray(mod.vocabulary)) {
            await tx.page.create({
              data: { moduleId: createdModule.id, pageType: 'VOCAB', orderIndex: 0, content: JSON.stringify({ words: mod.vocabulary }) }
            });
          }

          if (Array.isArray(mod.quizzes)) {
            await tx.page.create({
              data: { moduleId: createdModule.id, pageType: 'QUIZ', orderIndex: 1, content: JSON.stringify({ questions: mod.quizzes }) }
            });
          }
        }
      }

      return updatedProduct;
    });

    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
