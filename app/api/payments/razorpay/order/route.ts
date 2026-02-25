import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createOrderSchema = z.object({
  amount: z.number().finite().positive().max(1_000_000_000),
  currency: z.string().trim().length(3).optional(),
  receipt: z.string().trim().min(1).max(100).optional(),
});

export async function POST(req: NextRequest) {
  const payload = createOrderSchema.safeParse(await req.json().catch(() => null));
  if (!payload.success) {
    return NextResponse.json({ error: 'Invalid order payload', issues: payload.error.issues }, { status: 400 });
  }

  const amount = payload.data.amount;
  const currency = (payload.data.currency || 'INR').toUpperCase();
  const receipt = payload.data.receipt || `rcpt_${Date.now()}`;

  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key || !secret) {
    return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
  }

  const body = JSON.stringify({ amount: Math.round(amount), currency, receipt });
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body,
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMessage =
      (data && typeof data === 'object' && 'error' in data && (data as { error?: { description?: string } }).error?.description) ||
      'Razorpay error';

    return NextResponse.json({ error: errorMessage }, { status: response.status });
  }

  return NextResponse.json(data);
}
