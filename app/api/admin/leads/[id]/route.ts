import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { deleteLead, getLead, patchAdminFields } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const lead = await getLead(ctx.params.id);
  if (!lead) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { notes?: string; contacted?: boolean };
  const patch: { notes?: string; contacted?: boolean } = {};
  if (typeof body.notes === 'string') patch.notes = body.notes.slice(0, 10_000);
  if (typeof body.contacted === 'boolean') patch.contacted = body.contacted;
  const lead = await patchAdminFields(ctx.params.id, patch);
  if (!lead) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const ok = await deleteLead(ctx.params.id);
  if (!ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
