import { NextResponse } from 'next/server';
import { upsertLead, type Lead } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isUuid(v: unknown): v is string {
  return typeof v === 'string' && /^[a-z0-9-]{8,64}$/i.test(v);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id?: string } & Partial<Lead>;
    if (!isUuid(body.id)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    }
    const lead = await upsertLead(body.id, body);
    return NextResponse.json({ ok: true, id: lead.id, progress: lead.progress });
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
}
