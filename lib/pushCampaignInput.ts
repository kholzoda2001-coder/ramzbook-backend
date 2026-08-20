/**
 * lib/pushCampaignInput.ts — тарҷумаи майдонҳои панели админ ба сатри Prisma.
 *
 * Алоҳида аз route нигоҳ дошта мешавад, чун файли `route.ts`-и Next танҳо
 * методҳои HTTP ва конфигро содир карда метавонад — ҳар содироти дигар
 * огоҳии типҳо медиҳад.
 */
import { joinList } from './pushSegments';

/** Майдонҳое, ки аз панел меоянд → сатри Prisma. */
export function bodyToData(body: any, forCreate: boolean) {
  const d: Record<string, unknown> = {};
  const set = (k: string, v: unknown) => { if (v !== undefined) d[k] = v; };

  set('name', typeof body.name === 'string' ? body.name.trim() : undefined);
  set('kind', body.kind === 'manual' ? 'manual' : forCreate ? 'scheduled' : undefined);
  set('isActive', typeof body.isActive === 'boolean' ? body.isActive : undefined);

  set('hour', body.hour !== undefined ? Math.min(23, Math.max(0, Number(body.hour))) : undefined);
  set('minute', body.minute !== undefined ? Math.min(59, Math.max(0, Number(body.minute))) : undefined);
  set('tzOffsetMin', body.tzOffsetMin !== undefined ? Number(body.tzOffsetMin) : undefined);
  set('weekdays', body.weekdays !== undefined ? joinList(body.weekdays) : undefined);

  set('langs', body.langs !== undefined ? joinList(body.langs) : undefined);
  set('tier', body.tier !== undefined ? (body.tier || null) : undefined);
  set('studiedToday', body.studiedToday !== undefined ? (body.studiedToday || null) : undefined);
  set('minStreak', body.minStreak !== undefined ? numOrNull(body.minStreak) : undefined);
  set('maxStreak', body.maxStreak !== undefined ? numOrNull(body.maxStreak) : undefined);
  set('minInactiveDays', body.minInactiveDays !== undefined ? numOrNull(body.minInactiveDays) : undefined);
  set('maxInactiveDays', body.maxInactiveDays !== undefined ? numOrNull(body.maxInactiveDays) : undefined);
  set('levels', body.levels !== undefined ? joinList(body.levels) : undefined);
  set('countries', body.countries !== undefined ? joinList(body.countries) : undefined);

  set('texts', body.texts !== undefined ? body.texts : undefined);
  set('route', body.route !== undefined ? (body.route || 'lesson') : undefined);
  set('countdownToHour', body.countdownToHour !== undefined ? numOrNull(body.countdownToHour) : undefined);

  set('priority', body.priority !== undefined ? Number(body.priority) : undefined);
  set('cooldownHours', body.cooldownHours !== undefined ? Math.max(0, Number(body.cooldownHours)) : undefined);

  return d;
}

function numOrNull(v: any): number | null {
  if (v === null || v === '' || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
