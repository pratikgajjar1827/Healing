import type { Metadata } from 'next';
import VisaPageClient from './VisaPageClient';

export const metadata: Metadata = { title: 'Medical Visa' };

export default function VisaPage() {
  return <VisaPageClient />;
}
