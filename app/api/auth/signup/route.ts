import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getDatabaseEnvSummary } from '@/lib/dbDiagnostics';

type SignupPayload = {
  name?: string | null;
  email?: string;
  password?: string;
};

async function tryBridgeSignup(name: string | null, email: string, password: string) {
  const url = process.env.SIGNUP_BRIDGE_URL;
  const secret = process.env.SIGNUP_BRIDGE_SECRET;
  if (!url || !secret) return null;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-bridge-secret': secret,
    },
    body: JSON.stringify({ name, email, password }),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      error: payload?.error || `Bridge signup failed (HTTP ${response.status})`,
      details: payload?.details,
    };
  }

  return {
    ok: true,
    data: payload,
  };
}

async function canReachDatabaseWithPing() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let payload: SignupPayload = {};

  try {
    payload = await req.json();
    const name = payload.name ?? null;
    const email = (payload.email || '').trim().toLowerCase();
    const password = payload.password || '';

    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'User already exists' }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, hashedPassword: hashed } });
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error: unknown) {
    const prismaError = error as { code?: string; name?: string; message?: string } | null;
    const name = payload.name ?? null;
    const email = (payload.email || '').trim().toLowerCase();
    const password = payload.password || '';

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

      if (email && password) {
        const bridge = await tryBridgeSignup(name, email, password).catch(() => null);
        if (bridge?.ok) {
          return NextResponse.json({ ...bridge.data, fallback: 'SIGNUP_BRIDGE_URL' });
        }
      }

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
          hint: 'Call GET /api/health/db to view runtime DB diagnostics. Out-of-the-box fallback: configure SIGNUP_BRIDGE_URL + SIGNUP_BRIDGE_SECRET to route signup writes through a VPC Lambda bridge.',
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
