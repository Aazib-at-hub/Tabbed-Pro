/**
 * prisma.ts — Singleton PrismaClient with Connection Pooling
 *
 * Designed for PostgreSQL connection poolers (PgBouncer, Supabase, Neon, AWS RDS Proxy).
 * In development, hot-reloading reuses global Prisma instance to prevent connection leaks.
 */

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
