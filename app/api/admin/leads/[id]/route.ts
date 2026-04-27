import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { AdminPatch, deleteLead, getLead, patchAdminLead } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

const STATUS_VALUES = new Set([
  'lead',
  'in_progress',
  'complete',
  'paid',
  'delivered',
  'abandoned',
]);

const PACKAGE_VALUES = new Set(['basic', 'monthly', 'unlimited']);

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
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: AdminPatch = {};

  if (typeof body.name === 'string') patch.name = body.name.slice(0, 200);
  if (typeof body.email === 'string') patch.email = body.email.trim().slice(0, 320);
  if (typeof body.phone === 'string') patch.phone = body.phone.slice(0, 50);
  if (typeof body.phone_country === 'string') patch.phone_country = body.phone_country.slice(0, 8);
  if (typeof body.notes === 'string') patch.notes = body.notes.slice(0, 10_000);
  if (typeof body.contacted === 'boolean') patch.contacted = body.contacted;
  if (typeof body.paid === 'boolean') patch.paid = body.paid;
  if (typeof body.delivered === 'boolean') patch.delivered = body.delivered;
  if (typeof body.progress === 'number') patch.progress = body.progress;
  if (typeof body.last_step === 'string') patch.last_step = body.last_step.slice(0, 60);
  if (typeof body.linkedin === 'string') patch.linkedin = body.linkedin.slice(0, 500);
  if (typeof body.github === 'string') patch.github = body.github.slice(0, 500);
  if (typeof body.custom_requests === 'string') patch.custom_requests = body.custom_requests.slice(0, 10_000);
  if (typeof body.style === 'string') patch.style = body.style.slice(0, 60);
  if (Array.isArray(body.role)) patch.role = (body.role as unknown[]).map(String).slice(0, 30);
  if (Array.isArray(body.colors)) patch.colors = (body.colors as unknown[]).map(String).slice(0, 30);

  if (body.showcase === null) patch.showcase = null;
  else if (typeof body.showcase === 'boolean') patch.showcase = body.showcase;

  if (body.package === null) patch.package = undefined;
  else if (typeof body.package === 'string' && PACKAGE_VALUES.has(body.package)) {
    patch.package = body.package as 'basic' | 'monthly' | 'unlimited';
  }

  if (body.status_override === null) patch.status_override = null;
  else if (typeof body.status_override === 'string' && STATUS_VALUES.has(body.status_override)) {
    patch.status_override = body.status_override as AdminPatch['status_override'];
  }

  const lead = await patchAdminLead(ctx.params.id, patch);
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
