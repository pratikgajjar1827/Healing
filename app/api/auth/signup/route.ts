import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getDatabaseEnvSummary } from '@/lib/dbDiagnostics';

type SignupPayload = {
  name?: string | null;
  email?: string;
  password?: string;
};

type BridgeSignupResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string; details?: unknown }
  | null;

function isBridgeEnabled() {
  return Boolean(process.env.SIGNUP_BRIDGE_URL && process.env.SIGNUP_BRIDGE_SECRET);
}

function shouldForceBridge() {
  return process.env.FORCE_SIGNUP_BRIDGE === 'true';
}

async function tryBridgeSignup(name: string | null, email: string, password: string): Promise<BridgeSignupResult> {
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

    // Emergency switch for environments where Next.js runtime DB connectivity is unstable.
    if (shouldForceBridge()) {
      const bridge = await tryBridgeSignup(name, email, password);
      if (bridge?.ok) return NextResponse.json({ ...bridge.data, fallback: 'SIGNUP_BRIDGE_URL', forced: true });
      return NextResponse.json(
        {
          error: bridge?.error || 'FORCE_SIGNUP_BRIDGE=true but bridge is not configured.',
          hint: 'Set SIGNUP_BRIDGE_URL and SIGNUP_BRIDGE_SECRET in Amplify branch env vars.',
          details: bridge && !bridge.ok ? bridge.details : undefined,
        },
        { status: 500 },
      );
    }

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

    // Broad bridge fallback for runtime DB failures (not only PrismaClientInitializationError).
    if (email && password && isBridgeEnabled()) {
      const bridge = await tryBridgeSignup(name, email, password).catch(() => null);
      if (bridge?.ok) {
        return NextResponse.json({ ...bridge.data, fallback: 'SIGNUP_BRIDGE_URL' });
      }
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
          hint: isBridgeEnabled()
            ? 'Bridge is configured but failed. Verify postgresSignupBridge Lambda logs and VPC/SG routing.'
            : 'Out-of-the-box fallback: configure SIGNUP_BRIDGE_URL + SIGNUP_BRIDGE_SECRET to route signup writes through a VPC Lambda bridge.',
          envSummary,
          bridgeConfigured: isBridgeEnabled(),
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
        bridgeConfigured: isBridgeEnabled(),
      },
      { status: 500 },
    );
  }
}
