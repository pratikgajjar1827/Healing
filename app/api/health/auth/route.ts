import { NextResponse } from 'next/server';
import { getAuthEnvSummary } from '@/lib/authDiagnostics';

export async function GET() {
  const env = getAuthEnvSummary();

  const ok = Boolean(
    env.nextAuthUrlPresent &&
      env.nextAuthSecretPresent &&
      env.isValidAbsoluteUrl &&
      env.protocol &&
      /^https?:$/.test(env.protocol) &&
      !env.hasPathBeyondRoot &&
      !env.hasQueryOrHash,
  );

  return NextResponse.json(
    {
      ok,
      message: ok
        ? 'Auth environment appears valid for NextAuth runtime.'
        : 'Auth environment needs correction for reliable NextAuth runtime behavior.',
      env,
    },
    { status: ok ? 200 : 500 },
  );
}
