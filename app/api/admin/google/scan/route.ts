import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { scanForReplies } from '@/lib/gmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch {}
  const lookback = Math.max(1, Math.min(720, Number(body.lookback_hours) || 48));
  const result = await scanForReplies(lookback);
  return NextResponse.json(result);
}
