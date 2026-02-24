
'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function AuthButtons() {
  const { data } = useSession();
  const user = data?.user as any;
  if (!user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/signin">Sign in</Link>
        <Link href="/signup" className="btn">Create account</Link>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-slate-600">Hi, {user.name || user.email}</span>
      <Link href="/dashboard">Dashboard</Link>
      <button onClick={() => signOut()} className="btn">Sign out</button>
    </div>
  );
}
