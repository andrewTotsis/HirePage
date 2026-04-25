import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { outreachStorage } from '@/lib/outreach-storage';
import { newId } from '@/lib/outreach';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET() {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const templates = await outreachStorage.listTemplates();
  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const now = Date.now();
  const t = {
    id: String(body.id ?? newId()),
    name: String(body.name ?? '').trim() || 'Untitled template',
    subject: String(body.subject ?? ''),
    body: String(body.body ?? ''),
    created_at: now,
    updated_at: now,
  };
  await outreachStorage.putTemplate(t);
  return NextResponse.json({ template: t });
}
