import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { enrollContacts, setEnrollmentStatus } from '@/lib/outreach';
import { outreachStorage } from '@/lib/outreach-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const ids: string[] = Array.isArray(body.contact_ids) ? body.contact_ids.map(String) : [];
  if (!ids.length) return NextResponse.json({ error: 'no contacts' }, { status: 400 });
  const summary = await enrollContacts(params.id, ids);
  return NextResponse.json({ summary });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const enrollmentId = String(body.enrollment_id ?? '');
  const status = String(body.status ?? '');
  if (!enrollmentId || !status) return NextResponse.json({ error: 'missing args' }, { status: 400 });
  const valid = ['active', 'paused', 'stopped'];
  if (!valid.includes(status)) return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  const en = await outreachStorage.getEnrollment(enrollmentId);
  if (!en || en.sequence_id !== params.id) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const updated = await setEnrollmentStatus(enrollmentId, status as any);
  return NextResponse.json({ enrollment: updated });
}
