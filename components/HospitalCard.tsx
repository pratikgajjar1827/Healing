
export default function HospitalCard({ data }: { data: any }) {
  return (
    <div className="border rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{data.orgName}</h3>
        {data.verified && <span className="badge bg-green-100 text-green-700">Verified</span>}
      </div>
      <p className="text-sm text-slate-600">{data.city}, {data.country}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        {data.accreditations.split(',').map((a: string) => (
          <span key={a} className="bg-slate-100 px-2 py-1 rounded">{a}</span>
        ))}
      </div>
      <div className="text-sm">Specialties: {data.specialties}</div>
      <div className="text-sm">Languages: {data.languages}</div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-sm">⭐ {data.rating} ({data.reviewCount})</div>
      </div>
    </div>
  );
}
