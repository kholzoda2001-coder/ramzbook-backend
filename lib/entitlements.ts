import { prisma } from '@/lib/prisma';

/**
 * Ҳуқуқи ДОИМИИ хонанда ба воҳидҳои Китобхона.
 *
 * ── Чаро ин файл ҳаст ──────────────────────────────────────────────────────
 * Дастрасӣ ду ҳолат дошт: обунадор ё не. Ҷои сеюм — «ин як китобро харид ё
 * админ ба ӯ дод» — набуд. Ҳамин ҷо ҳамон ҳолати сеюм хонда мешавад.
 *
 * Пурсиш дар ЯК ҷо мемонад, то ҳар роут шарти `revokedAt`-ро аз нав ихтироъ
 * накунад: сатри гирифташуда (баргардонидани пул) набояд ба дасти хонанда
 * баргардад, ва фаромӯш кардани ҳамин як шарт дар як роут сӯрохи хомӯш
 * месозад.
 */
export async function ownedItemIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.entitlement.findMany({
    where: { userId, revokedAt: null },
    select: { itemId: true },
  });
  return new Set(rows.map((r) => r.itemId));
}

/** Оё ин хонанда ба ин як воҳид ҳуқуқ дорад? */
export async function ownsItem(userId: string, itemId: string): Promise<boolean> {
  const row = await prisma.entitlement.findFirst({
    where: { userId, itemId, revokedAt: null },
    select: { id: true },
  });
  return row !== null;
}
