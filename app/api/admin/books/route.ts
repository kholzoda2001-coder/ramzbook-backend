import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      title, author, category, description, coverUrl, pdfUrl,
      preface, guide, isFree, rating, isActive,
      priceSixMonths, priceLifetime,
      readingSteps, proTip,
    } = body;

    if (!title?.trim()) return NextResponse.json({ error: 'Book title is required' }, { status: 400 });
    if (!author?.trim()) return NextResponse.json({ error: 'Author is required' }, { status: 400 });

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        author: author.trim(),
        category: category ?? null,
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
      },
    });

    return NextResponse.json({ ...product, createdAt: product.createdAt.toISOString() });
  } catch {
    return NextResponse.json({ error: 'Server error while creating book' }, { status: 500 });
  }
}
