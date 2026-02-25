import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getHospitalById } from '@/lib/hospitals';

export default async function HospitalDetailsPage({ params }: { params: { id: string } }) {
  const hospital = await getHospitalById(params.id);

  if (!hospital) {
    notFound();
  }

  const mapUrl = `https://www.google.com/maps?q=${hospital.latitude},${hospital.longitude}`;

  return (
    <div className="space-y-6">
      <Link href="/hospitals" className="inline-block text-sm font-medium text-emerald-700 hover:underline">
        ← Back to Hospitals
      </Link>

      <section className="rounded-2xl border p-6">
        <h1 className="text-2xl font-bold">{hospital.orgName}</h1>
        <p className="mt-1 text-slate-600">
          {hospital.city}, {hospital.country}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {hospital.accreditations.split(',').map((accreditation) => (
            <span key={accreditation} className="rounded bg-slate-100 px-2 py-1">
              {accreditation}
            </span>
          ))}
          {hospital.verified && <span className="rounded bg-green-100 px-2 py-1 text-green-700">Verified</span>}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-5">
          <h2 className="text-lg font-semibold">Address & Location</h2>
          <p className="mt-3 text-sm text-slate-700">{hospital.address}</p>
          <p className="mt-2 text-sm text-slate-700">
            Coordinates: {hospital.latitude}, {hospital.longitude}
          </p>
          <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline">
            Open in Google Maps
          </a>
        </div>

        <div className="rounded-2xl border p-5">
          <h2 className="text-lg font-semibold">Service Profile</h2>
          <p className="mt-3 text-sm text-slate-700">Specialties: {hospital.specialties}</p>
          <p className="mt-2 text-sm text-slate-700">Languages: {hospital.languages}</p>
          <p className="mt-2 text-sm text-slate-700">24x7 Emergency: {hospital.emergency24x7 ? 'Available' : 'Not listed'}</p>
        </div>
      </section>

      <section className="rounded-2xl border p-5">
        <h2 className="text-lg font-semibold">Track Record & Key Parameters</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2">
          <p>
            <span className="font-medium">Rating:</span> {hospital.rating} ({hospital.reviewCount} reviews)
          </p>
          <p>
            <span className="font-medium">Established:</span> {hospital.establishedYear ?? 'Not listed'}
          </p>
          <p>
            <span className="font-medium">Bed Capacity:</span> {hospital.bedCount ?? 'Not listed'}
          </p>
          <p>
            <span className="font-medium">Annual Patients:</span> {hospital.annualPatients ?? 'Not listed'}
          </p>
          <p>
            <span className="font-medium">Clinical Outcome:</span> {hospital.successRate ?? 'Not listed'}
          </p>
          <p>
            <span className="font-medium">Infection Control:</span> {hospital.infectionRate ?? 'Not listed'}
          </p>
          <p>
            <span className="font-medium">Avg. Admission Wait:</span> {hospital.avgWaitDays ? `${hospital.avgWaitDays} days` : 'Not listed'}
          </p>
        </div>
      </section>
    </div>
  );
}
