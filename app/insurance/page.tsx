export const metadata = { title: 'Insurance' };

const products = [
  {
    name: 'Cross-Border Surgery Cover',
    coverage: 'In-patient surgery, ICU, diagnostics, and 1 attendant stay support',
    bestFor: 'Planned procedures and second-opinion approved surgeries',
  },
  {
    name: 'International Critical Illness Plan',
    coverage: 'Fixed payout for listed conditions with treatment destination flexibility',
    bestFor: 'Oncology, cardiac emergencies, and high-cost interventions',
  },
  {
    name: 'Travel + Medical Complication Add-on',
    coverage: 'Trip disruption, emergency extension, and post-op complication events',
    bestFor: 'Medical tourists requiring itinerary protection',
  },
];

export default function InsurancePage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Insurance & Financial Protection</h1>
        <p className="text-slate-600 max-w-3xl">Evaluate protection options for international treatment journeys. Final policy issuance depends on underwriting and destination rules.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <article key={p.name} className="rounded-2xl border p-5 bg-white shadow-sm">
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="mt-3 text-sm text-slate-700">{p.coverage}</p>
            <p className="mt-3 text-sm"><span className="font-medium">Best for:</span> {p.bestFor}</p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
        Coverage terms vary by nationality and destination. Share your plan details during quote intake for insurer compatibility checks.
      </div>
    </div>
  );
}
