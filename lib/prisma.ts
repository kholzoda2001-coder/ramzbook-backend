/**
 * lib/prisma.ts
 *
 * Singleton Prisma client. Next.js creates a new module instance on every
 * hot-reload in development, which would exhaust the database connection pool.
 * Caching the instance on `globalThis` prevents that.
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

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
