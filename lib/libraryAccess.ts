/**
 * Who may open which library item.
 *
 * ── Why this file exists ───────────────────────────────────────────────────
 * Until now the library was all-or-nothing: BOTH mobile endpoints returned 403
 * to every non-premium user, so `LibraryItem.isPremium` — the per-item flag the
 * admin panel writes — was never actually evaluated for the people it exists to
 * filter. A free learner received an empty shelf and could not tell what they
 * were missing.
 *
 * The paywall now promises "3 books free" and shows a comparison row saying so.
 * That promise has to be enforced in ONE place, and the number the paywall
 * prints has to come from the same place — otherwise the screen and the shelf
 * drift apart and the paywall starts lying.
 *
 * ── The rule ───────────────────────────────────────────────────────────────
 *   1. Premium (including lifetime) → everything.
 *   2. Otherwise an item is free when the admin marked it `isPremium: false`.
 *   3. Safety net: if rule 2 leaves fewer than FREE_BOOK_QUOTA *books* open,
 *      the first books in display order are opened until the quota is met.
 *
 * Rule 3 is what makes the paywall copy true no matter how the admin sets the
 * flags. Without it, marking every book Premium in the admin panel silently
 * turns "3 книги бесплатно" into a lie and gives a free user a shelf they can
 * look at but never open — exactly the state we are fixing.
 */

/** How many books a signed-in, non-paying learner can always open. */
export const FREE_BOOK_QUOTA = 3;

/** The subset of LibraryItem fields the access rule needs. */
export type AccessItem = {
  id: string;
  type: string;
  isPremium: boolean;
  order: number;
  createdAt: Date;
};

/** Books and templates are "books" for the quota; audio/video are not. */
function isBookish(type: string): boolean {
  return type === 'book' || type === 'template';
}

/**
 * Display order, matching the list endpoint's `orderBy`, so "the first three
 * books" means the first three the learner actually sees — not an arbitrary
 * three.
 */
function byDisplayOrder(a: AccessItem, b: AccessItem): number {
  if (a.order !== b.order) return a.order - b.order;
  return b.createdAt.getTime() - a.createdAt.getTime();
}

/**
 * The ids a NON-PREMIUM learner may open. Premium users skip this entirely —
 * see `unlockedIds`.
 */
export function freeItemIds(items: AccessItem[]): Set<string> {
  const free = new Set<string>();
  for (const it of items) {
    if (!it.isPremium) free.add(it.id);
  }

  // Safety net — top up to the promised book quota.
  let openBooks = items.filter((i) => isBookish(i.type) && free.has(i.id)).length;
  if (openBooks < FREE_BOOK_QUOTA) {
    const candidates = items
      .filter((i) => isBookish(i.type) && !free.has(i.id))
      .sort(byDisplayOrder);
    for (const it of candidates) {
      if (openBooks >= FREE_BOOK_QUOTA) break;
      free.add(it.id);
      openBooks++;
    }
  }

  return free;
}

/**
 * How many books a free learner can actually open — the number the paywall
 * prints in its comparison row.
 *
 * Read from the same function that enforces access, so the promise on the
 * paywall and the behaviour of the shelf can never disagree.
 */
export function freeBookCount(items: AccessItem[]): number {
  const free = freeItemIds(items);
  return items.filter((i) => isBookish(i.type) && free.has(i.id)).length;
}

/** The ids this learner may open, premium status included. */
export function unlockedIds(items: AccessItem[], isPremium: boolean): Set<string> {
  if (isPremium) return new Set(items.map((i) => i.id));
  return freeItemIds(items);
}
