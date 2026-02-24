
'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn('credentials', { redirect: false, email, password });
    if (res?.ok) router.push('/dashboard'); else setError(res?.error || 'Invalid credentials');
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn">Sign in</button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
      <p className="text-sm mt-3">No account? <a href="/signup" className="text-brand-700">Sign up</a></p>
    </div>
  );
}
