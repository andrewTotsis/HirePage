import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { outreachStorage } from '@/lib/outreach-storage';
import { isAIConfigured } from '@/lib/anthropic';
import { getGmailSettings } from '@/lib/gmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET() {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const [contacts, gmail, allEvents] = await Promise.all([
    outreachStorage.listContacts(),
    getGmailSettings(),
    outreachStorage.listEventsAll(2000),
  ]);
  const sent = allEvents.filter((e) => e.type === 'sent').length;
  const sentToday = allEvents.filter((e) => e.type === 'sent' && e.ts >= startOfTodayMs()).length;
  return NextResponse.json({
    contacts: contacts.length,
    sendable: contacts.filter((c) => !c.unsubscribed && !c.bounced && !!c.email).length,
    unsubscribed: contacts.filter((c) => c.unsubscribed).length,
    bounced: contacts.filter((c) => c.bounced).length,
    sent_total: sent,
    sent_today: sentToday,
    ai_configured: isAIConfigured(),
    google_oauth_configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    gmail_connected: !!gmail,
    gmail_email: gmail?.email ?? null,
  });
}

function startOfTodayMs(): number {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}
