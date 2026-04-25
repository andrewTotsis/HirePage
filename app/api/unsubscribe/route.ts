import { NextResponse } from 'next/server';
import { outreachStorage } from '@/lib/outreach-storage';
import { logEvent } from '@/lib/outreach';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function applyUnsub(token: string): Promise<boolean> {
  const c = await outreachStorage.getContactByUnsubToken(token);
  if (!c) return false;
  if (!c.unsubscribed) {
    await outreachStorage.patchContact(c.id, { unsubscribed: true });
    await logEvent({ contact_id: c.id, enrollment_id: null, sequence_id: null, step_idx: null, type: 'unsubscribed' });
  }
  // Stop any active enrollments for this contact
  const ens = await outreachStorage.listEnrollmentsByContact(c.id);
  for (const en of ens) {
    if (en.status === 'active' || en.status === 'paused') {
      await outreachStorage.putEnrollment({ ...en, status: 'unsubscribed', next_send_at: null, updated_at: Date.now() });
    }
  }
  return true;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('t') || '';
  const ok = await applyUnsub(token);
  return NextResponse.redirect(`${url.origin}/unsubscribe?ok=${ok ? '1' : '0'}`, 302);
}

// One-click unsubscribe per RFC 8058
export async function POST(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('t') || '';
  const ok = await applyUnsub(token);
  return NextResponse.json({ ok });
}
