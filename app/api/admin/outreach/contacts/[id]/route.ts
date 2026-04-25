import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { outreachStorage } from '@/lib/outreach-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const contact = await outreachStorage.getContact(params.id);
  if (!contact) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const enrollments = await outreachStorage.listEnrollmentsByContact(contact.id);
  const events = await outreachStorage.listEventsByContact(contact.id, 200);
  return NextResponse.json({ contact, enrollments, events });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const allow = ['email', 'first_name', 'last_name', 'linkedin', 'company', 'title', 'tags', 'notes', 'unsubscribed', 'bounced'];
  const patch: Record<string, unknown> = {};
  for (const k of allow) if (k in body) patch[k] = body[k];
  const updated = await outreachStorage.patchContact(params.id, patch as any);
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ contact: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const ok = await outreachStorage.deleteContact(params.id);
  return NextResponse.json({ ok });
}
