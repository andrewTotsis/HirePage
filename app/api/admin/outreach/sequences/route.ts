import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { outreachStorage } from '@/lib/outreach-storage';
import { createSequence, computeSequenceStats } from '@/lib/outreach';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET() {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const sequences = await outreachStorage.listSequences();
  const stats = await Promise.all(
    sequences.map(async (s) => ({ id: s.id, stats: await computeSequenceStats(s.id), enrollments: (await outreachStorage.listEnrollmentsBySequence(s.id)).length })),
  );
  return NextResponse.json({ sequences, stats });
}

export async function POST(req: Request) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const name = String(body.name ?? '').trim() || 'Untitled sequence';
  const seq = await createSequence(name);
  return NextResponse.json({ sequence: seq });
}
