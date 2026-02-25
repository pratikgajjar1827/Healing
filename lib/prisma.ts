import { PrismaClient } from '@prisma/client';
import { hydrateRuntimeEnv } from '@/lib/runtimeEnv';

hydrateRuntimeEnv();

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
