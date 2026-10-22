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

/**
 * Google Play Console: Product ID-и ин воҳид.
 *
 * Қоидаи Play: бо ҳарфи хурд ё рақам сар мешавад, танҳо `a-z 0-9 _ .`, то 40
 * ҳарф, ва баъди сохтан ИВАЗ НАМЕШАВАД. Пас ин ҷо ҳамон қоида санҷида мешавад —
 * ID-и нодуруст дар Console намеояд ва вақти фурӯш ошкор мешавад.
 *
 * Холӣ = «Play ҳанӯз пайваст нест» (`null`).
 */
export const PLAY_PRODUCT_ID_MAX = 40;
const PLAY_PRODUCT_ID_RE = /^[a-z0-9][a-z0-9_.]*$/;

export type PlayProductIdResult =
  | { ok: true; value: string | null }
  | { ok: false; error: string };

export function normalizePlayProductId(raw: unknown): PlayProductIdResult {
  const s = (raw ?? '').toString().trim();
  if (!s) return { ok: true, value: null };
  // Ҳарфи калон ба ҳарфи хурд намеравад: ID-и Console ҳассос аст ва
  // «хомӯшона ислоҳ кардан» ID-ро аз он, ки дар Console сохтаанд, ҷудо мекард.
  if (s.length > PLAY_PRODUCT_ID_MAX) {
    return { ok: false, error: `ID то ${PLAY_PRODUCT_ID_MAX} ҳарф бошад` };
  }
  if (!PLAY_PRODUCT_ID_RE.test(s)) {
    return {
      ok: false,
      error:
        'ID танҳо ҳарфи хурди лотинӣ, рақам, «_» ва «.» дорад ва бо ҳарф ё рақам сар мешавад',
    };
  }
  return { ok: true, value: s };
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

/**
 * Забони модарие, ки рафи Китобхона аз рӯи он филтр мешавад.
 *
 * Аввал `?native=<код>`-и барнома (он чизест, ки хонанда ҲОЗИР дар барнома
 * интихоб кардааст — ҳатто меҳмон, ки ҳисоб надорад, ва корбаре, ки забонро
 * навакак иваз кардааст), баъд `User.nativeLang`-и ҳисоб. Ҳарду набошанд —
 * `''` (филтр нест, раф холӣ намешавад).
 *
 * Қимати нодуруст (на код) нодида гирифта мешавад, на хато: он ба `where`-и
 * Prisma меравад ва ҳеҷ гоҳ SQL-и хом нест, вале барои тозагӣ.
 */
export function resolveNativeFilter(
  param: string | null | undefined,
  account: string | null | undefined,
): string {
  const ok = (s: string | null | undefined): string => {
    const v = (s ?? '').trim().toLowerCase();
    return /^[a-z]{2,8}(-[a-z0-9]{2,8})?$/.test(v) ? v : '';
  };
  return ok(param) || ok(account);
}
