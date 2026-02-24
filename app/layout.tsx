
import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import NextAuthProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: { absolute: 'HealinginEast', default: 'HealinginEast – Medical Tourism Aggregator', template: '%s | HealinginEast' },
  description: 'Compare accredited hospitals (NABH/JCI) and manage quotes, visas, and payments with Razorpay integration.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>
          <NavBar />
          <main className="container py-8">{children}</main>
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
