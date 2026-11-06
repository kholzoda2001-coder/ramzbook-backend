/**
 * Cache-Control барои endpoint-ҳои ОММАВӢ (бе токен, ба корбар вобаста нест).
 *
 * ЧАРО: Vercel Hobby лимити CPU-и функсия дорад (Fluid Active CPU). Ҳар
 * дархост ба ҳамин endpoint-ҳо функсия мезад, ҳарчанд ҷавоб барои ҳама якхела
 * аст. Бо `s-maxage` CDN-и Vercel ҷавобро худаш медиҳад ва функсия кор намекунад.
 *
 * ФАҚАТ барои ҷавобҳои муваффақ истифода шавад (хатоҳо кеш намешаванд) ва
 * ҳеҷ гоҳ барои endpoint-и ба корбар/токен/мамлакат вобаста.
 */
export const PUBLIC_CACHE = {
  /** Забонҳо, тарҷумаи UI, алифбо: кам тағйир меёбанд. */
  long: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  /** Дарахти курсҳо: админ таҳрир мекунад, пас кӯтоҳтар. */
  medium: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  /** content-version: «чизе тағйир ёфт?» — хеле кӯтоҳ. */
  short: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' },
} as const;
