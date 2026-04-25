import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { outreachStorage } from '@/lib/outreach-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const list = await outreachStorage.listTemplates();
  const existing = list.find((t) => t.id === params.id);
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const merged = {
    ...existing,
    name: 'name' in body ? String(body.name) : existing.name,
    subject: 'subject' in body ? String(body.subject) : existing.subject,
    body: 'body' in body ? String(body.body) : existing.body,
    updated_at: Date.now(),
  };
  await outreachStorage.putTemplate(merged);
  return NextResponse.json({ template: merged });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const ok = await outreachStorage.deleteTemplate(params.id);
  return NextResponse.json({ ok });
}
