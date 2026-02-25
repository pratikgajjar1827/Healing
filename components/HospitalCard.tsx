import Link from 'next/link';
import { HospitalItem } from '@/lib/hospitals';

export default function HospitalCard({ data }: { data: HospitalItem }) {
  return (
    <Link href={`/hospitals/${data.id}`} className="block rounded-2xl border p-4 transition hover:border-emerald-500 hover:shadow-md">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">{data.orgName}</h3>
          {data.verified && <span className="badge bg-green-100 text-green-700">Verified</span>}
        </div>
        <p className="text-sm text-slate-600">
          {data.city}, {data.country}
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          {data.accreditations.split(',').map((a) => (
            <span key={a} className="rounded bg-slate-100 px-2 py-1">
              {a}
            </span>
          ))}
        </div>
        <div className="text-sm">Specialties: {data.specialties}</div>
        <div className="text-sm">Languages: {data.languages}</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm">
            ⭐ {data.rating} ({data.reviewCount})
          </div>
          <span className="text-sm font-medium text-emerald-700">View details →</span>
        </div>
      </div>
    </Link>
  );
}
