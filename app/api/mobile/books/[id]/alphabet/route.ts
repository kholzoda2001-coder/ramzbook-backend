/**
 * GET /api/mobile/books/[id]/alphabet
 *
 * Returns the alphabet letters and reading rules for a given book (by productId).
 * Used by the Flutter AlphabetScreen inside BookChaptersScreen.
 *
 * Response:
 * {
 *   "letters": [{ "id": "…", "letter": "Aa", "transcription": "[a]", "pronunciationTj": "[а]", "orderIndex": 0 }, …],
 *   "rules":   [{ "id": "…", "pattern": "sch", "description": "ҳамчун «ш» хонда мешавад", "orderIndex": 0 }, …]
 * }
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id;

    const [letters, rules] = await Promise.all([
      prisma.alphabetLetter.findMany({
        where: { productId: bookId },
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          letter: true,
          transcription: true,
          pronunciationTj: true,
          orderIndex: true,
        },
      }),
      prisma.readingRule.findMany({
        where: { productId: bookId },
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          pattern: true,
          description: true,
          orderIndex: true,
        },
      }),
    ]);

    return Response.json({ letters, rules });
  } catch (err) {
    console.error("[books/[id]/alphabet]", err);
    return apiError("Failed to fetch alphabet data.");
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
