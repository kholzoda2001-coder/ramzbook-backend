/**
 * Шакли ҶАВОБИ рафи Китобхона (`GET /api/mobile/library`) — дар як ҷо.
 *
 * ── Чаро ин файл ҳаст ──────────────────────────────────────────────────────
 * Роут ҳар воҳидро бо `mediaUrl` (пайванди МУСТАҚИМИ файли аудио/видео/EPUB)
 * мефиристод — ҳатто барои воҳиди ҚУЛФШУДА. Файлҳо `access: 'public'` ҳастанд,
 * пас ҳар корбари ройгон бо як дархости оддӣ аудиокитоби пулиро мешунид.
 *
 * ── Чаро якбора намебарем ───────────────────────────────────────────────────
 * Барномаи ҲОЗИРА ин пайвандро барои воҳиди қулфшуда ИСТИФОДА мебарад:
 *   • EPUB-и қулф кушода мешавад ва танҳо баъди `kEpubPreviewFraction` ба
 *     пейвол мерасад (гейт дар худи хонанда);
 *   • аудио/видео пешнамоиши `kFreePreviewSeconds` дорад;
 *   • иконкаи ⬇ аз `mediaUrl` вобаста аст.
 * Агар сервер имрӯз ҳамаи `mediaUrl`-ҳои қулфшударо тоза кунад, ин се қисм
 * дар барномаи истеҳсолӣ мешиканад. Пас муҳофизат ду ҳолат дорад:
 *
 *   `legacy` (пешфарз) — ҳамон тавре ки буд; `hasMedia` илова мешавад.
 *   `strict`           — воҳиди қулф `mediaUrl: null` мегирад.
 *
 * `strict` ҳангоми дархост аз тарафи клиенти нав фаъол мешавад
 * (`?media=gated` ё сарлавҳаи `x-ramz-library-api: 2`) ё барои ҲАМА бо
 * `LIBRARY_STRIP_LOCKED_MEDIA=1` — баъди он ки версияҳои кӯҳнаи барнома
 * нест шаванд.
 *
 * ⚠️ Ин ҳимояи пурра НЕСТ: URL-и воҳиди КУШОДА ҳамоно public аст (ва файлҳои
 * кӯҳна аллакай «фош» ҳисоб мешаванд). Ҳимояи воқеӣ — URL-и имзошуда
 * (қадами 4 дар нақша).
 */

export type ShelfMediaMode = 'legacy' | 'strict';

/** Номи сарлавҳа, ки клиенти нав мефиристад. */
export const LIBRARY_API_HEADER = 'x-ramz-library-api';

/**
 * Ҳолати расонаро муайян мекунад.
 *   1. `LIBRARY_STRIP_LOCKED_MEDIA=1` → ҳама `strict`;
 *   2. `?media=gated` ё `x-ramz-library-api: 2` (ё бештар) → `strict`;
 *   3. вагарна `legacy`.
 */
export function resolveShelfMediaMode(input: {
  query?: string | null;
  header?: string | null;
  env?: string | undefined;
}): ShelfMediaMode {
  if ((input.env ?? '').trim() === '1') return 'strict';
  if ((input.query ?? '').trim().toLowerCase() === 'gated') return 'strict';
  const v = Number.parseInt((input.header ?? '').trim(), 10);
  if (Number.isFinite(v) && v >= 2) return 'strict';
  return 'legacy';
}

/** Оё `mediaUrl` воқеан ягон пайванд дорад (холӣ/фосила = не). */
export function hasMediaUrl(url: string | null | undefined): boolean {
  return typeof url === 'string' && url.trim().length > 0;
}

/** Қисми сатри Prisma, ки ин функсия ба он такя мекунад. */
export interface ShelfRow {
  id: string;
  mediaUrl: string | null;
  order: number;
  createdAt: Date;
  _count: { pages: number };
}

export interface ShelfContext {
  /** `unlockedIds(...)`: чӣ барои ин корбар кушода аст. */
  open: ReadonlySet<string>;
  /** `ownedItemIds(...)`: чӣ ин корбар ХАРИДААСТ (ҳуқуқи доимӣ). */
  owned: ReadonlySet<string>;
  /** Лаҳзаи буриши «НАВ» (мс). */
  newCutoff: number;
  mode: ShelfMediaMode;
}

/**
 * Як сатри рафро ба шакли ҷавоб табдил медиҳад.
 *
 * Майдонҳои пештара БЕТАҒЙИР: `pageCount`, `isNew`, `locked`, `owned`.
 * Иловашуда: `hasMedia` (ҳамеша ҳақиқат дар бораи вуҷуди файл, ҳатто вақте
 * `mediaUrl` дар `strict` тоза шудааст — то барнома «⬇ ҳаст» ё «аудио ҳаст»-ро
 * бе пайванд донад).
 */
export function buildShelfItem<T extends ShelfRow>(row: T, ctx: ShelfContext) {
  const { _count, order, createdAt, ...it } = row;
  void order;
  const locked = !ctx.open.has(it.id);
  const hasMedia = hasMediaUrl(it.mediaUrl);
  const hide = ctx.mode === 'strict' && locked;

  return {
    ...it,
    mediaUrl: hide ? null : it.mediaUrl,
    hasMedia,
    pageCount: _count.pages,
    isNew: createdAt.getTime() >= ctx.newCutoff,
    // The ONE field the app gates on. Derived server-side so the client
    // cannot decide for itself that a book is open.
    locked,
    owned: ctx.owned.has(it.id),
  };
}
