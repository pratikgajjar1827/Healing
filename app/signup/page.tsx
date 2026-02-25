'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      let payload: any = null;
      const text = await res.text();
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = null;
      }

      if (res.ok) {
        setMsg('Account created. You can sign in now.');
        setTimeout(() => router.push('/signin'), 1000);
        return;
      }

      setMsg(payload?.error || `Signup failed (${res.status}). Please check server logs.`);
    } catch {
      setMsg('Network error while signing up. Please try again.');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn">Sign up</button>
      </form>
      {msg && <p className="text-sm mt-2">{msg}</p>}
    </div>
  );
}
