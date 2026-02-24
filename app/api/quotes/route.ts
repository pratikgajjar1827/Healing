
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  if (!payload.patientName || !payload.email || !payload.nationality || !payload.procedureId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const preferredDate = payload.preferredDate ? new Date(payload.preferredDate) : null;
  const quote = await prisma.quote.create({ data: {
    patientName: payload.patientName,
    email: payload.email,
    nationality: payload.nationality,
    procedureId: payload.procedureId,
    preferredDate,
    notes: payload.notes || null,
  }});
  return NextResponse.json({ ok: true, id: quote.id });
}
