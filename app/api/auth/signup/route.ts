import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getDatabaseEnvSummary } from '@/lib/dbDiagnostics';

async function canReachDatabaseWithPing() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'User already exists' }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, hashedPassword: hashed } });
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error: unknown) {
    const prismaError = error as { code?: string; name?: string; message?: string } | null;

    if (prismaError?.code === 'P2021') {
      return NextResponse.json(
        { error: 'Database table is missing. Run Prisma migrations (npx prisma migrate deploy) in your Amplify build pipeline.' },
        { status: 500 },
      );
    }

    if (prismaError?.code === 'P1010') {
      return NextResponse.json(
        {
          error: 'Database user lacks permission to read/write auth tables.',
          hint: 'Grant privileges on table "User" (and related tables) for the DATABASE_URL user, then redeploy.',
        },
        { status: 500 },
      );
    }

    if (prismaError?.name === 'PrismaClientInitializationError') {
      const envSummary = getDatabaseEnvSummary();
      const dbPingOk = await canReachDatabaseWithPing();

      if (dbPingOk) {
        return NextResponse.json(
          {
            error: 'Database is reachable, but signup query failed during Prisma initialization.',
            hint: 'Likely causes: wrong schema/search_path, missing table migrations, DB user permission on "User" table, or connection pool exhaustion. Verify with Prisma migrate deploy and table grants.',
            envSummary,
          },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          error: 'Database connection failed. Verify DATABASE_URL, SSL mode, and DB network access from Amplify runtime.',
          hint: 'Call GET /api/health/db to view runtime DB diagnostics.',
          envSummary,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: 'Signup failed due to an unexpected server error.',
        details: {
          name: prismaError?.name,
          code: prismaError?.code,
          message: prismaError?.message,
        },
      },
      { status: 500 },
    );
  }
}
