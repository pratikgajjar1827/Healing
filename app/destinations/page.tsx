export const metadata = { title: 'Destinations' };

const destinations = [
  {
    country: 'India',
    cities: ['New Delhi', 'Mumbai', 'Chennai', 'Bengaluru'],
    strengths: ['Cardiac care', 'Oncology', 'Transplants', 'Orthopedics'],
    visa: 'e-Medical visa available for many nationalities',
  },
  {
    country: 'UAE',
    cities: ['Dubai', 'Abu Dhabi'],
    strengths: ['Cosmetic surgery', 'Fertility', 'Preventive health'],
    visa: 'Medical entry permits supported with hospital sponsorship',
  },
  {
    country: 'Nepal',
    cities: ['Kathmandu'],
    strengths: ['Recovery stays', 'Affordable diagnostics'],
    visa: 'Visa-on-arrival for eligible passports',
  },
  {
    country: 'Russia',
    cities: ['Moscow', 'St. Petersburg'],
    strengths: ['Advanced oncology', 'Specialized surgical programs'],
    visa: 'Invitation-based medical visa process',
  },
];

export default function DestinationsPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Medical Travel Destinations</h1>
        <p className="text-slate-600 max-w-3xl">Plan by destination with city-level strengths, visa pathways, and commonly requested specialties.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {destinations.map((d) => (
          <article key={d.country} className="rounded-2xl border p-5 bg-white shadow-sm">
            <h2 className="text-xl font-semibold">{d.country}</h2>
            <p className="mt-2 text-sm text-slate-600">Cities: {d.cities.join(', ')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {d.strengths.map((s) => (
                <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-700">{d.visa}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
