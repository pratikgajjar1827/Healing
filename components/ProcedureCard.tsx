
import { currency } from '@/lib/utils';
export default function ProcedureCard({ p }: { p: any }) {
  return (
    <div className="border rounded-2xl p-4">
      <h3 className="font-semibold">{p.name}</h3>
      <p className="text-sm text-slate-600">Specialty: {p.specialty}</p>
      <p className="mt-2">Starting at <strong>{currency(p.basePrice, p.currency)}</strong></p>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer">Inclusions/Exclusions</summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <ul className="list-disc ml-5">{p.inclusions.split(',').map((i: string) => <li key={i}>{i}</li>)}</ul>
          <ul className="list-disc ml-5">{p.exclusions.split(',').map((e: string) => <li key={e}>{e}</li>)}</ul>
        </div>
      </details>
    </div>
  );
}
