/**
 * lib/prisma.ts
 *
 * Singleton Prisma client. Caching the instance on `globalThis` is needed in
 * BOTH environments, for different reasons:
 *  - Dev: Next.js re-evaluates this module on every hot-reload, which would
 *    otherwise create a new PrismaClient (and connection pool) each time.
 *  - Production (Vercel serverless): a warm lambda instance reuses the same
 *    Node process across invocations. Without caching here, each cold start
 *    (and there can be many concurrent ones under load) creates its OWN
 *    PrismaClient — each with its own connection pool — multiplying total
 *    connections against the database's shared connection limit and
 *    exhausting it (observed as `P1001: Timed out fetching a new connection
 *    from the pool`).
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaVersionMiddlewareAttached: boolean | undefined;
  prismaRetryMiddlewareAttached: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = prisma;

/**
 * Content-version cache-busting (hybrid cache system).
 *
 * The mobile app caches admin-driven content (courses/lessons/words/grammar/…)
 * on-device with a multi-hour TTL to cut server load. Without this, an admin
 * edit wouldn't reach already-cached learners for up to a day. To fix that
 * without giving up the caching benefit, every write to a content model here
 * bumps `AppSetting.content_version`'s `updatedAt` — a single cheap row the
 * app polls on every open via GET /api/mobile/content-version. If the app's
 * locally stored version differs, it invalidates its cache and refetches;
 * otherwise the existing TTL cache keeps serving with zero extra server load.
 */
const CONTENT_MODELS = new Set([
  'Course', 'Module', 'Lesson', 'Word', 'GrammarTopic', 'GrammarExample',
  'GrammarRule', 'GrammarExercise', 'PhraseCollection', 'Phrase', 'Dialogue',
  'DialogueLine', 'ComprehensionExercise', 'ComprehensionQuestion', 'Language',
  'CefrDescriptor', 'OnboardingWord', 'PlacementQuestion', 'UiTranslation',
]);
const WRITE_ACTIONS = new Set([
  'create', 'createMany', 'update', 'updateMany', 'upsert', 'delete', 'deleteMany',
]);

if (!globalForPrisma.prismaVersionMiddlewareAttached) {
  globalForPrisma.prismaVersionMiddlewareAttached = true;
  prisma.$use(async (params, next) => {
    const result = await next(params);
    if (params.model && CONTENT_MODELS.has(params.model) && WRITE_ACTIONS.has(params.action)) {
      // Awaited (not fire-and-forget): on Vercel serverless, work started
      // after the response is sent isn't guaranteed to finish, so this must
      // complete before the admin request returns. It's a single cheap
      // upsert and admin writes aren't a hot path, so the added latency is
      // negligible. Wrapped so a bump failure never fails the real write,
      // which has already succeeded above.
      try {
        await prisma.appSetting.upsert({
          where: { key: 'content_version' },
          create: { key: 'content_version', valueJson: '"1"' },
          update: { valueJson: '"1"' },
        });
      } catch (e) {
        console.error('[content_version bump failed]', e);
      }
    }
    return result;
  });
}

/**
 * Cold-start retry for Neon (and any scale-to-zero Postgres).
 *
 * Neon auto-suspends the compute after inactivity. The FIRST query after a
 * suspend can fail with a connection-level error (P1001 "Can't reach database
 * server", P1002, or P2024 pool timeout) in the ~1–2s before the compute
 * finishes resuming. That single cold-start failure was enough to break real
 * purchases: google-verify's first query threw → the route returned 500 → the
 * paid Google Play subscription was never activated in the app (confirmed in
 * production logs). Retrying connection-level failures a few times with a short
 * backoff picks up the resumed compute transparently, so a cold start no longer
 * fails the request. Registered LAST so it's the innermost wrapper — only the
 * actual query is retried, not the content-version bump above.
 */
function isRetryableDbError(e: unknown): boolean {
  const code = (e as { code?: string })?.code ?? '';
  const msg = (e as { message?: string })?.message ?? '';
  return (
    code === 'P1001' || // Can't reach database server
    code === 'P1002' || // server terminated the connection
    code === 'P2024' || // timed out fetching a new connection from the pool
    /can't reach database server|connection refused|econnrefused|etimedout|terminating connection|connection terminated/i.test(msg)
  );
}

if (!globalForPrisma.prismaRetryMiddlewareAttached) {
  globalForPrisma.prismaRetryMiddlewareAttached = true;
  const backoffsMs = [250, 600, 1200]; // ~2s total — enough for a Neon resume
  prisma.$use(async (params, next) => {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= backoffsMs.length; attempt++) {
      try {
        return await next(params);
      } catch (e) {
        lastErr = e;
        if (attempt < backoffsMs.length && isRetryableDbError(e)) {
          await new Promise((r) => setTimeout(r, backoffsMs[attempt]));
          continue;
        }
        throw e;
      }
    }
    throw lastErr;
  });
}
