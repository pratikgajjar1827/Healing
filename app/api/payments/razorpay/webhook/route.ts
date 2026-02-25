import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function isValidSignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const providedBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing webhook signature header' }, { status: 401 });
  }

  const rawBody = await req.text();
  if (!isValidSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  // TODO: update Payment/Booking based on event.entity.status
  return NextResponse.json({ received: true, eventType: event.event ?? 'unknown' });
}
