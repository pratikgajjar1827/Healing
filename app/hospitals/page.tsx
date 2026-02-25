import { prisma } from '@/lib/prisma';
import HospitalCard from '@/components/HospitalCard';

export const metadata = { title: 'Hospitals' };

type HospitalItem = {
  id: string;
  orgName: string;
  accreditations: string;
  country: string;
  city: string;
  specialties: string;
  languages: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
};

const topIndianHospitals: HospitalItem[] = [
  {
    id: 'apollo-chennai',
    orgName: 'Apollo Hospitals, Greams Road',
    accreditations: 'NABH,JCI',
    country: 'India',
    city: 'Chennai',
    specialties: 'Cardiac Sciences, Oncology, Transplants, Neurosciences',
    languages: 'English,Hindi,Tamil',
    rating: 4.8,
    reviewCount: 250,
    verified: true,
  },
  {
    id: 'fortis-mulund',
    orgName: 'Fortis Hospital, Mulund',
    accreditations: 'NABH,JCI',
    country: 'India',
    city: 'Mumbai',
    specialties: 'Cardiology, Orthopedics, Neurology, Gastroenterology',
    languages: 'English,Hindi,Marathi',
    rating: 4.7,
    reviewCount: 200,
    verified: true,
  },
  {
    id: 'medanta-gurugram',
    orgName: 'Medanta - The Medicity',
    accreditations: 'NABH,JCI',
    country: 'India',
    city: 'Gurugram',
    specialties: 'Cardiac Surgery, Oncology, Liver Transplant, Neurosurgery',
    languages: 'English,Hindi',
    rating: 4.8,
    reviewCount: 280,
    verified: true,
  },
  {
    id: 'max-saket',
    orgName: 'Max Super Speciality Hospital, Saket',
    accreditations: 'NABH,JCI',
    country: 'India',
    city: 'New Delhi',
    specialties: 'Oncology, Cardiac Care, Neurosciences, Orthopedics',
    languages: 'English,Hindi',
    rating: 4.7,
    reviewCount: 190,
    verified: true,
  },
  {
    id: 'manipal-old-airport',
    orgName: 'Manipal Hospital, Old Airport Road',
    accreditations: 'NABH,JCI',
    country: 'India',
    city: 'Bengaluru',
    specialties: 'Oncology, Urology, Cardiac Sciences, Nephrology',
    languages: 'English,Hindi,Kannada',
    rating: 4.6,
    reviewCount: 165,
    verified: true,
  },
  {
    id: 'kokilaben-mumbai',
    orgName: 'Kokilaben Dhirubhai Ambani Hospital',
    accreditations: 'NABH,JCI',
    country: 'India',
    city: 'Mumbai',
    specialties: 'Cancer Care, Robotic Surgery, Neurosciences, Organ Transplant',
    languages: 'English,Hindi,Marathi',
    rating: 4.7,
    reviewCount: 210,
    verified: true,
  },
  {
    id: 'narayana-bengaluru',
    orgName: 'Narayana Health City',
    accreditations: 'NABH,JCI',
    country: 'India',
    city: 'Bengaluru',
    specialties: 'Cardiac Sciences, Pediatrics, Nephrology, Oncology',
    languages: 'English,Hindi,Kannada',
    rating: 4.6,
    reviewCount: 170,
    verified: true,
  },
  {
    id: 'amrita-kochi',
    orgName: 'Amrita Institute of Medical Sciences',
    accreditations: 'NABH,JCI',
    country: 'India',
    city: 'Kochi',
    specialties: 'Transplants, Cardiology, Neurology, Oncology',
    languages: 'English,Hindi,Malayalam',
    rating: 4.7,
    reviewCount: 180,
    verified: true,
  },
  {
    id: 'aiims-delhi',
    orgName: 'AIIMS New Delhi',
    accreditations: 'NABH',
    country: 'India',
    city: 'New Delhi',
    specialties: 'Multi-Specialty, Trauma, Oncology, Cardiology',
    languages: 'English,Hindi',
    rating: 4.6,
    reviewCount: 300,
    verified: true,
  },
  {
    id: 'hcg-bengaluru',
    orgName: 'HCG Cancer Centre, Bengaluru',
    accreditations: 'NABH',
    country: 'India',
    city: 'Bengaluru',
    specialties: 'Oncology, Radiation Therapy, Surgical Oncology',
    languages: 'English,Hindi,Kannada',
    rating: 4.5,
    reviewCount: 140,
    verified: true,
  },
];

function isAccredited(acc: string) {
  return acc.includes('JCI') || acc.includes('NABH');
}

function filterHospitals(orgs: HospitalItem[], q?: string, city?: string, specialty?: string) {
  let filtered = orgs.filter((o) => isAccredited(o.accreditations));

  if (city) filtered = filtered.filter((o) => o.city.toLowerCase().includes(city.toLowerCase()));
  if (specialty) filtered = filtered.filter((o) => o.specialties.toLowerCase().includes(specialty.toLowerCase()));
  if (q) filtered = filtered.filter((o) => o.orgName.toLowerCase().includes(q.toLowerCase()));

  return filtered;
}

export default async function HospitalsPage({ searchParams }: { searchParams: { q?: string; city?: string; specialty?: string } }) {
  const { q, city, specialty } = searchParams;

  let normalizedDbHospitals: HospitalItem[] = [];

  try {
    const dbHospitals = await prisma.providerOrg.findMany({
      take: 20,
      orderBy: { rating: 'desc' },
    });

    normalizedDbHospitals = dbHospitals.map((o) => ({
      id: o.id,
      orgName: o.orgName,
      accreditations: o.accreditations,
      country: o.country,
      city: o.city,
      specialties: o.specialties,
      languages: o.languages,
      rating: o.rating,
      reviewCount: o.reviewCount,
      verified: o.verified,
    }));
  } catch {
    normalizedDbHospitals = [];
  }

  const sourceHospitals = normalizedDbHospitals.length > 0 ? normalizedDbHospitals : topIndianHospitals;
  const orgs = filterHospitals(sourceHospitals, q, city, specialty);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hospitals (NABH/JCI)</h1>
      <p className="text-sm text-slate-600">Showing top hospitals in India with NABH/JCI accreditations.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {orgs.map((o) => (
          <HospitalCard key={o.id} data={o} />
        ))}
      </div>
    </div>
  );
}
