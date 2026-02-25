import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const result = {
    ok: false,
    checks: {
      authSecret: !!(process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET),
      databaseUrl: !!process.env.DATABASE_URL,
      database: false,
    },
    hints: [] as string[],
  };

  if (!result.checks.authSecret) {
    result.hints.push('Set NEXTAUTH_SECRET (or AUTH_SECRET) in Amplify environment variables.');
  }
  if (!result.checks.databaseUrl) {
    result.hints.push('Set DATABASE_URL in Amplify environment variables.');
  }

  if (result.checks.databaseUrl) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      result.checks.database = true;
    } catch (error) {
      result.hints.push('Database not reachable. Verify RDS security groups, public/private access, and credentials.');
      return NextResponse.json({ ...result, error: String(error) }, { status: 503 });
    }
  }

  result.ok = result.checks.authSecret && result.checks.databaseUrl && result.checks.database;
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
