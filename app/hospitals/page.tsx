import HospitalCard from '@/components/HospitalCard';
import { filterHospitals, getHospitalsWithFallback } from '@/lib/hospitals';

export const metadata = { title: 'Hospitals' };

export default async function HospitalsPage({ searchParams }: { searchParams: { q?: string; city?: string; specialty?: string } }) {
  const { q, city, specialty } = searchParams;

  const sourceHospitals = await getHospitalsWithFallback();
  const orgs = filterHospitals(sourceHospitals, q, city, specialty);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hospitals (NABH/JCI)</h1>
      <p className="text-sm text-slate-600">Click any hospital tile to view detailed profile, address, location, and track record.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {orgs.map((o) => (
          <HospitalCard key={o.id} data={o} />
        ))}
      </div>
    </div>
  );
}
