import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function getTunedDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return raw;

  const isAmplifyRuntime = Boolean(process.env.AWS_BRANCH || process.env.AWS_APP_ID || process.env.AWS_EXECUTION_ENV);
  if (!isAmplifyRuntime) return raw;

  try {
    const parsed = new URL(raw);

    // Serverless runtimes can easily exhaust direct Postgres connections.
    // Keep pool conservative unless explicitly configured by env.
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '1');
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '20');
    }
    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', '15');
    }

    return parsed.toString();
  } catch {
    return raw;
  }
}

const prismaDbUrl = getTunedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(prismaDbUrl ? { datasources: { db: { url: prismaDbUrl } } } : {}),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
