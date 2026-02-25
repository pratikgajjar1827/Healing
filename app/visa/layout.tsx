import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical Visa',
};

export default function VisaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
