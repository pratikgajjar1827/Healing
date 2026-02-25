import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function mapSignupError(error: unknown) {
  const e = error as { code?: string; message?: string } | undefined;

  if (!process.env.DATABASE_URL) {
    return {
      status: 500,
      error: 'DATABASE_URL is not configured in the Amplify environment variables.',
      code: 'CONFIG_DATABASE_URL_MISSING',
    };
  }

  if (e?.code === 'P1001') {
    return {
      status: 503,
      error: 'Cannot reach database server. Check RDS network/security group settings.',
      code: 'DB_UNREACHABLE_P1001',
    };
  }

  if (e?.code === 'P1000') {
    return {
      status: 503,
      error: 'Database authentication failed. Check DB username/password in DATABASE_URL.',
      code: 'DB_AUTH_P1000',
    };
  }

  if (e?.code === 'P1003') {
    return {
      status: 503,
      error: 'Database does not exist or is not accessible for configured user.',
      code: 'DB_NOT_FOUND_P1003',
    };
  }

  if (e?.code === 'P2021' || e?.message?.toLowerCase().includes('does not exist')) {
    return {
      status: 503,
      error: 'Database tables are missing. Run Prisma migrations in production.',
      code: 'DB_SCHEMA_NOT_MIGRATED',
    };
  }

  return {
    status: 500,
    error: 'Signup failed due to server/database configuration. Please try again later.',
    code: e?.code || 'SIGNUP_UNKNOWN_ERROR',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, hashedPassword: hashed } });
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    const mapped = mapSignupError(error);
    console.error('Signup API failed:', mapped.code, error);
    return NextResponse.json({ error: mapped.error, code: mapped.code }, { status: mapped.status });
  }
}
