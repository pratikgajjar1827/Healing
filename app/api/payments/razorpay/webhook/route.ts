
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const signature = req.headers.get('x-razorpay-signature');
  const rawBody = await req.text();
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  if (expected !== signature) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  const event = JSON.parse(rawBody);
  // TODO: update Payment/Booking based on event.entity.status
  return NextResponse.json({ received: true });
}
