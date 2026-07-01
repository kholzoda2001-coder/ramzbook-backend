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
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = prisma;
