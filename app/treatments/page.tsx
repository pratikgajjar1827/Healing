import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Treatments' };
export const dynamic = 'force-dynamic';

const fallbackTreatments = [
  { name: 'Cardiac Bypass (CABG)', specialty: 'Cardiology', basePrice: 850000, currency: 'INR', avgLOSDays: 7 },
  { name: 'Total Knee Replacement', specialty: 'Orthopedics', basePrice: 420000, currency: 'INR', avgLOSDays: 5 },
  { name: 'IVF Cycle', specialty: 'Fertility', basePrice: 180000, currency: 'INR', avgLOSDays: 2 },
  { name: 'Oncology Chemotherapy Package', specialty: 'Oncology', basePrice: 250000, currency: 'INR', avgLOSDays: 3 },
  { name: 'Rhinoplasty', specialty: 'Cosmetic Surgery', basePrice: 210000, currency: 'INR', avgLOSDays: 2 },
  { name: 'Liver Transplant Evaluation', specialty: 'Transplant', basePrice: 1200000, currency: 'INR', avgLOSDays: 10 },
];

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export default async function TreatmentsPage() {
  let procedures: any[] = [];
  try {
    procedures = await prisma.procedure.findMany({
      take: 24,
      orderBy: { basePrice: 'asc' },
      include: { org: { select: { orgName: true, city: true, country: true } } },
    });
  } catch {
    procedures = [];
  }

  const rows = procedures.length
    ? procedures.map((p) => ({
        id: p.id,
        name: p.name,
        specialty: p.specialty,
        basePrice: p.basePrice,
        currency: p.currency,
        avgLOSDays: p.avgLOSDays,
        orgName: p.org.orgName,
        city: p.org.city,
        country: p.org.country,
      }))
    : fallbackTreatments.map((p, i) => ({ ...p, id: `fallback-${i}`, orgName: 'Curated Network Hospital', city: 'India', country: 'India' }));

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Treatment Packages</h1>
        <p className="text-slate-600 max-w-3xl">
          Compare common procedure packages, expected length of stay, and provider network coverage. Final pricing depends on clinical profile and diagnostics.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((t) => (
          <article key={t.id} className="rounded-2xl border p-5 bg-white shadow-sm">
            <p className="text-xs uppercase tracking-wide text-brand-700 font-semibold">{t.specialty}</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{t.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{t.orgName} · {t.city}, {t.country}</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">Starting from</p>
                <p className="text-xl font-bold text-slate-900">{formatMoney(t.basePrice, t.currency)}</p>
              </div>
              <span className="badge bg-slate-100 text-slate-700">LOS: {t.avgLOSDays} days</span>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
        Need a personalized quote? <Link className="text-brand-700 font-semibold" href="/">Start with hospital search</Link> and submit your treatment details.
      </div>
    </div>
  );
}
