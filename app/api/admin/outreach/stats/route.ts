import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { outreachStorage } from '@/lib/outreach-storage';
import { computeGlobalStats } from '@/lib/outreach';
import { isEmailConfigured, fromAddress } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET() {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const [contacts, sequences, enrollments, stats] = await Promise.all([
    outreachStorage.listContacts(),
    outreachStorage.listSequences(),
    outreachStorage.listAllEnrollments(),
    computeGlobalStats(),
  ]);
  return NextResponse.json({
    contacts: contacts.length,
    unsubscribed: contacts.filter((c) => c.unsubscribed).length,
    bounced: contacts.filter((c) => c.bounced).length,
    sequences: sequences.length,
    active_sequences: sequences.filter((s) => s.status === 'active').length,
    enrollments: enrollments.length,
    active_enrollments: enrollments.filter((e) => e.status === 'active').length,
    stats,
    email_configured: isEmailConfigured(),
    from: fromAddress(),
  });
}
