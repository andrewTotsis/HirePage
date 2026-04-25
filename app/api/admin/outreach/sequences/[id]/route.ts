import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { outreachStorage } from '@/lib/outreach-storage';
import { computeSequenceStats, patchSequence } from '@/lib/outreach';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const seq = await outreachStorage.getSequence(params.id);
  if (!seq) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const enrollments = await outreachStorage.listEnrollmentsBySequence(seq.id);
  const stats = await computeSequenceStats(seq.id);
  return NextResponse.json({ sequence: seq, enrollments, stats });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const allow = ['name', 'description', 'status', 'steps'];
  const patch: Record<string, unknown> = {};
  for (const k of allow) if (k in body) patch[k] = body[k];
  const updated = await patchSequence(params.id, patch as any);
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ sequence: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const ok = await outreachStorage.deleteSequence(params.id);
  return NextResponse.json({ ok });
}
