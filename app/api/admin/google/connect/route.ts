import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { buildAuthUrl, getDefaultBaseUrl } from '@/lib/gmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not configured' }, { status: 412 });
  }
  const url = new URL(req.url);
  const baseUrl = `${url.protocol}//${url.host}` || getDefaultBaseUrl();
  const state = Math.random().toString(36).slice(2);
  const target = buildAuthUrl(baseUrl, state);
  return NextResponse.redirect(target, 302);
}
