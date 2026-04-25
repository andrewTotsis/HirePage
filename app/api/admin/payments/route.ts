import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { getPaymentsSummary } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET() {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  try {
    const data = await getPaymentsSummary();
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'stripe error';
    return NextResponse.json({ configured: false, error: msg, total_cents: 0, total_count: 0, currency: 'cad', payments: [] }, { status: 200 });
  }
}
