'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setMsg('Account created. You can sign in now.');
        setTimeout(() => router.push('/signin'), 1000);
        return;
      }

      let error = `Request failed (HTTP ${res.status})`;
      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const d = await res.json();
        if (d?.error) error = d.error;
        if (d?.hint) error = `${error} ${d.hint}`;
      } else {
        const text = (await res.text()).trim();
        if (text) error = `${error}: ${text}`;
      }

      if (res.status === 403) {
        error = 'Signup API is blocked in this deployment (HTTP 403). In Amplify, enable Next.js SSR/Web Compute so /api routes are executed.';
      }

      setMsg(error);
    } catch {
      setMsg('Network error while creating account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Sign up'}</button>
      </form>
      {msg && <p className="text-sm mt-2">{msg}</p>}
    </div>
  );
}
