
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const quotePayloadSchema = z.object({
  patientName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  nationality: z.string().trim().min(1).max(100),
  procedureId: z.string().trim().min(1).max(100),
  preferredDate: z.string().datetime().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const payload = quotePayloadSchema.parse(await req.json());
    const preferredDate = payload.preferredDate ? new Date(payload.preferredDate) : null;
    const quote = await prisma.quote.create({
      data: {
        patientName: payload.patientName,
        email: payload.email,
        nationality: payload.nationality,
        procedureId: payload.procedureId,
        preferredDate,
        notes: payload.notes || null,
      },
    });

    return NextResponse.json({ ok: true, id: quote.id });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid quote payload', issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Could not submit quote right now' }, { status: 500 });
  }
}
