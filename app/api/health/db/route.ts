import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDatabaseEnvSummary } from '@/lib/dbDiagnostics';

export async function GET() {
  const env = getDatabaseEnvSummary();
  const recommendations: string[] = [];

  if (env.isAmplifyRuntime && !env.isPrismaAccelerateUrl && !env.hasConnectionLimitParam) {
    recommendations.push('Add connection_limit=1 to DATABASE_URL for Amplify runtime.');
  }
  if (env.isAmplifyRuntime && !env.isPrismaAccelerateUrl && !env.hasPoolTimeoutParam) {
    recommendations.push('Add pool_timeout=20 to DATABASE_URL for Amplify runtime.');
  }
  if (env.isAmplifyRuntime && !env.isPrismaAccelerateUrl && !env.hasConnectTimeoutParam) {
    recommendations.push('Add connect_timeout=15 to DATABASE_URL for Amplify runtime.');
  }
  if (env.isAmplifyRuntime && !env.isPrismaAccelerateUrl) {
    recommendations.push('Out-of-the-box fallback: use Prisma Accelerate/Data Proxy (DATABASE_URL=prisma://...) to avoid direct DB networking from SSR Lambdas.');
  }
  if (env.isPrismaAccelerateUrl && !env.directDatabaseUrlPresent) {
    recommendations.push('Set DIRECT_DATABASE_URL (direct postgres URL) so migrations can run during Amplify preBuild.');
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      message: 'Database connection is healthy.',
      env,
      recommendations,
    });
  } catch (error: unknown) {
    const prismaError = error as { name?: string; message?: string } | null;

    return NextResponse.json(
      {
        ok: false,
        error: 'Database connection failed from runtime.',
        details: {
          name: prismaError?.name,
          message: prismaError?.message,
          env,
          recommendations,
        },
      },
      { status: 500 },
    );
  }
}
