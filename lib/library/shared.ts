/**
 * Ёрдамчиҳои муштараки «Китобхона».
 *
 * ⚠️ ЧАРО ин ҷо, на дар худи роут: файли `route.ts`-и Next.js танҳо
 * ҳендлерҳо ва чанд танзими муайян (`dynamic`, `revalidate`…) содир карда
 * метавонад. Ҳар export-и иловагӣ санҷиши навъҳои худи Next-ро мешиканад
 * («does not satisfy the constraint»). Пештар инҳо аз `route.ts` содир
 * мешуданд ва `admin/library/[id]/route.ts` онҳоро аз он ҷо мегирифт —
 * маҳз ҳамин 5 хатои `tsc`-и кӯҳнаро медод.
 */

export const ITEM_TYPES = ['book', 'audio', 'video', 'template'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export interface PageInput {
  order?: number;
  title?: string | null;
  content?: string;
  imageUrl?: string | null;
}

/**
 * The cover word is DRAWN, not wrapped: the app paints it across a 3:4.35 card
 * at 20sp. Anything longer than a short noun overflows or shrinks to nothing,
 * so it is capped here rather than at paint time — the admin sees the limit
 * while typing instead of discovering it on a phone.
 */
export const COVER_WORD_MAX = 12;

export function normalizeCoverWord(raw: unknown): string | null {
  const s = (raw ?? '').toString().trim().toUpperCase();
  return s ? s.slice(0, COVER_WORD_MAX) : null;
}

/** Shapes free-form admin input into valid page rows (drops empty ones). */
export function normalizePages(pages: unknown): Required<PageInput>[] {
  if (!Array.isArray(pages)) return [];
  return pages
    .map((p, i) => {
      const raw = (p ?? {}) as PageInput;
      return {
        order: Number.isFinite(Number(raw.order)) ? Math.floor(Number(raw.order)) : i,
        title: raw.title?.toString().trim() || null,
        content: (raw.content ?? '').toString(),
        imageUrl: raw.imageUrl?.toString().trim() || null,
      };
    })
    .filter((p) => p.content.trim().length > 0);
}
