
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hydrateRuntimeEnv } from '@/lib/runtimeEnv';

const PROTECTED = ['/dashboard'];
const PROVIDER_ONLY = ['/provider-portal'];
const ADMIN_ONLY = ['/admin'];

export async function middleware(req: NextRequest) {
  hydrateRuntimeEnv();
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET });

  if (PROTECTED.some(p => pathname.startsWith(p))) {
    if (!token) return NextResponse.redirect(new URL('/signin', req.url));
  }
  if (PROVIDER_ONLY.some(p => pathname.startsWith(p))) {
    if (!token) return NextResponse.redirect(new URL('/signin', req.url));
    if (token.role !== 'PROVIDER' && token.role !== 'ADMIN') return NextResponse.redirect(new URL('/', req.url));
  }
  if (ADMIN_ONLY.some(p => pathname.startsWith(p))) {
    if (!token) return NextResponse.redirect(new URL('/signin', req.url));
    if (token.role !== 'ADMIN') return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*','/provider-portal/:path*','/admin/:path*'],
};
