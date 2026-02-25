
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getDatabaseEnvSummary } from '@/lib/dbDiagnostics';

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
    const prismaError = error as { code?: string; name?: string } | null;

    if (prismaError?.code === 'P2021') {
      return NextResponse.json(
        { error: 'Database table is missing. Run Prisma migrations (npx prisma migrate deploy) in your Amplify build pipeline.' },
        { status: 500 },
      );
    }

    if (prismaError?.name === 'PrismaClientInitializationError') {
      const envSummary = getDatabaseEnvSummary();
      return NextResponse.json(
        {
          error: 'Database connection failed. Verify DATABASE_URL, SSL mode, and DB network access from Amplify runtime.',
          hint: 'Call GET /api/health/db to view runtime DB diagnostics.',
          envSummary,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: 'Signup failed due to an unexpected server error.' }, { status: 500 });
  }
}
