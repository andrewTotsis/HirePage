import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { disconnectGmail } from '@/lib/gmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  await disconnectGmail();
  return NextResponse.json({ ok: true });
}
