import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDatabaseEnvSummary } from '@/lib/dbDiagnostics';

export async function GET() {
  const env = getDatabaseEnvSummary();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      message: 'Database connection is healthy.',
      env,
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
        },
      },
      { status: 500 },
    );
  }
}

