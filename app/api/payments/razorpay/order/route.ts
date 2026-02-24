
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { amount, currency = 'INR', receipt = 'rcpt_'+Date.now() } = await req.json();
  if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  const key = process.env.RAZORPAY_KEY_ID!;
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  if (!key || !secret) return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
  const body = JSON.stringify({ amount: Math.round(amount), currency, receipt }); // amount already in subunits expected by caller
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const r = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST', headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' }, body
  });
  const data = await r.json();
  if (!r.ok) return NextResponse.json({ error: data.error?.description || 'Razorpay error' }, { status: r.status });
  return NextResponse.json(data);
}
