import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { exchangeCode, getProfile, putGmailSettings } from '@/lib/gmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return NextResponse.redirect(new URL('/admin/login', req.url));
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const baseUrl = `${url.protocol}//${url.host}`;
  if (error) {
    return NextResponse.redirect(`${baseUrl}/admin/outreach/settings?gmail_error=${encodeURIComponent(error)}`);
  }
  if (!code) return NextResponse.redirect(`${baseUrl}/admin/outreach/settings?gmail_error=no_code`);
  try {
    const tok = await exchangeCode(code, baseUrl);
    if (!tok.refresh_token) {
      return NextResponse.redirect(`${baseUrl}/admin/outreach/settings?gmail_error=no_refresh_token`);
    }
    const profile = await getProfile(tok.access_token);
    await putGmailSettings({
      email: profile.emailAddress.toLowerCase(),
      refresh_token: tok.refresh_token,
      access_token: tok.access_token,
      expires_at: Date.now() + tok.expires_in * 1000,
      last_history_id: profile.historyId,
      connected_at: Date.now(),
    });
    return NextResponse.redirect(`${baseUrl}/admin/outreach/settings?gmail=connected`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'oauth_failed';
    return NextResponse.redirect(`${baseUrl}/admin/outreach/settings?gmail_error=${encodeURIComponent(msg)}`);
  }
}
