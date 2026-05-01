import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import { generateBookPdfBuffer } from '@/lib/pdf-generator';
import { put } from '@vercel/blob';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = requireUserId(req);
    if (!adminId) return unauthorized();

    const book = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            pages: { orderBy: { orderIndex: 'asc' } },
          },
        },
        bookChapters: {
          orderBy: { orderIndex: 'asc' },
          include: {
            vocabularyItems: { orderBy: { orderIndex: 'asc' } },
          },
        },
      },
    });

    if (!book) {
      return apiError('Book not found', 404);
    }

    // Generate Full PDF
    const fullPdfBuffer = await generateBookPdfBuffer(book as any, false);
    const fullBlob = await put(`pdfs/${book.id}_full.pdf`, fullPdfBuffer, {
      access: 'public',
      addRandomSuffix: false, // Override if it exists
    });

    // Generate Preview PDF
    const previewPdfBuffer = await generateBookPdfBuffer(book as any, true);
    const previewBlob = await put(`pdfs/${book.id}_preview.pdf`, previewPdfBuffer, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Update product in DB
    const updated = await prisma.product.update({
      where: { id: book.id },
      data: {
        pdfUrl: fullBlob.url,
        previewPdfUrl: previewBlob.url,
      },
    });

    return NextResponse.json({
      success: true,
      pdfUrl: updated.pdfUrl,
      previewPdfUrl: updated.previewPdfUrl,
    });
  } catch (error) {
    console.error('[generate-pdf error]', error);
    return apiError('Failed to generate PDF');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
