import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { outreachStorage } from '@/lib/outreach-storage';
import { createContact, isEmail } from '@/lib/outreach';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET() {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const contacts = await outreachStorage.listContacts();
  return NextResponse.json({ contacts });
}

export async function POST(req: Request) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const email = String(body.email ?? '').trim();
  if (email && !isEmail(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  }
  if (email) {
    const existing = await outreachStorage.getContactByEmail(email);
    if (existing) {
      return NextResponse.json({ contact: existing, created: false });
    }
  }
  const contact = await createContact({
    email,
    first_name: body.first_name,
    last_name: body.last_name,
    linkedin: body.linkedin,
    company: body.company,
    title: body.title,
    tags: Array.isArray(body.tags) ? body.tags : undefined,
    source: body.source || 'manual',
  });
  return NextResponse.json({ contact, created: true });
}
