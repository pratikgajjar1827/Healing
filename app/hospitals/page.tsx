
import { prisma } from '@/lib/prisma';
import HospitalCard from '@/components/HospitalCard';

export const metadata = { title: 'Hospitals' };

function isAccredited(acc: string) {
  return acc.includes('JCI') || acc.includes('NABH');
}

export default async function HospitalsPage({ searchParams }: { searchParams: { q?: string; city?: string; specialty?: string } }) {
  type Org = Awaited<ReturnType<typeof prisma.providerOrg.findMany>>[number];
  const { q, city, specialty } = searchParams;
  let orgs = await prisma.providerOrg.findMany({ take: 20, orderBy: { rating: 'desc' } });
  orgs = orgs.filter((o: Org) => isAccredited(o.accreditations));
  if (city) orgs = orgs.filter((o: Org) => o.city.toLowerCase().includes(city.toLowerCase()));
  if (specialty) orgs = orgs.filter((o: Org) => o.specialties.toLowerCase().includes(specialty.toLowerCase()));
  if (q) orgs = orgs.filter((o: Org) => o.orgName.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hospitals (NABH/JCI)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orgs.map((o: Org) => <HospitalCard key={o.id} data={o} />)}
      </div>
    </div>
  );
}
