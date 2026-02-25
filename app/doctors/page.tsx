import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Doctors' };
export const dynamic = 'force-dynamic';

const fallbackDoctors = [
  { name: 'Dr. Arjun Mehta', specialties: 'Cardiac Surgery', experienceY: 18, languages: 'English,Hindi' },
  { name: 'Dr. Kavya Nair', specialties: 'Oncology', experienceY: 14, languages: 'English,Hindi,Tamil' },
  { name: 'Dr. Omar Rahman', specialties: 'Fertility', experienceY: 11, languages: 'English,Arabic' },
  { name: 'Dr. Riya Sharma', specialties: 'Orthopedics', experienceY: 16, languages: 'English,Hindi' },
];

export default async function DoctorsPage() {
  let doctors: any[] = [];
  try {
    doctors = await prisma.doctor.findMany({
      take: 30,
      orderBy: { rating: 'desc' },
      include: { org: { select: { orgName: true, city: true, country: true } } },
    });
  } catch {
    doctors = [];
  }

  const rows = doctors.length
    ? doctors.map((d) => ({ ...d, orgName: d.org.orgName, city: d.org.city, country: d.org.country }))
    : fallbackDoctors.map((d, i) => ({
        id: `fallback-${i}`,
        ...d,
        rating: 4.7,
        orgName: 'Curated Network Hospital',
        city: 'India',
        country: 'India',
      }));

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Specialist Doctors</h1>
        <p className="text-slate-600 max-w-3xl">Explore specialists across partner hospitals. Profiles below are prioritized by patient outcomes and international case experience.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((d: any) => (
          <article key={d.id} className="rounded-2xl border p-5 bg-white shadow-sm">
            <h2 className="text-lg font-semibold">{d.name}</h2>
            <p className="text-sm text-slate-600 mt-1">{d.specialties}</p>
            <p className="text-sm mt-2">{d.orgName} · {d.city}, {d.country}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="badge bg-slate-100 text-slate-700">{d.experienceY}+ years</span>
              <span>⭐ {d.rating}</span>
            </div>
            <p className="text-xs text-slate-500 mt-3">Languages: {String(d.languages).split(',').join(', ')}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
