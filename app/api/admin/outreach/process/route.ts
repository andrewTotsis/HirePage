import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { processDueEnrollments } from '@/lib/outreach';
import { getBaseUrl } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const result = await processDueEnrollments(Date.now(), getBaseUrl(req.url));
  return NextResponse.json(result);
}
