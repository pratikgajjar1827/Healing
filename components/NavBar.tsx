'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import { cn } from '@/lib/utils';
import AuthButtons from '@/components/AuthButtons';

const links: Array<{ href: Route; label: string }> = [
  { href: '/', label: 'Home' },
  { href: '/treatments', label: 'Treatments' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/hospitals', label: 'Hospitals' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/visa', label: 'Medical Visa' },
  { href: '/insurance', label: 'Insurance' },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="container flex items-center justify-between py-3">
        <Link href="/" className="font-extrabold text-xl text-brand-700">HealinginEast</Link>
        <nav className="hidden md:flex gap-6 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={cn('hover:text-brand-700', pathname === l.href && 'text-brand-700 font-medium')}>
              {l.label}
            </Link>
          ))}
        </nav>
        <AuthButtons />
      </div>
    </header>
  );
}
