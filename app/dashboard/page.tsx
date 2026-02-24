import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Your Dashboard</h1>
      <p className="text-slate-600">Signed in as {session?.user?.email}</p>
      <section>
        <h2 className="text-lg font-semibold mb-2">Payments</h2>
        <p className="text-sm">Proceed to pay deposit using Razorpay once your quote is finalized.</p>
      </section>
    </div>
  );
}
