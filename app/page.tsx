
import SearchBar from '@/components/SearchBar';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">HealinginEast — Accredited care, organised end-to-end</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">Compare NABH/JCI hospitals in India, Nepal, UAE, and Russia. Get help with medical visas, stays, and payments via Razorpay.</p>
        <div className="max-w-3xl mx-auto"><SearchBar /></div>
      </section>
    </div>
  );}
