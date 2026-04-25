import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { outreachStorage, Contact } from '@/lib/outreach-storage';
import { personalize, newId, newToken } from '@/lib/outreach';
import { sendOutreachEmail, isEmailConfigured } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const stepIdx = Number(body.step_idx ?? 0);
  const toEmail = String(body.to ?? '').trim();
  if (!toEmail) return NextResponse.json({ error: 'missing to' }, { status: 400 });
  if (!isEmailConfigured()) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 412 });
  const seq = await outreachStorage.getSequence(params.id);
  if (!seq) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const step = seq.steps[stepIdx];
  if (!step) return NextResponse.json({ error: 'step out of range' }, { status: 400 });

  // Build a stub contact representing the requester
  const stub: Contact = {
    id: 'preview',
    email: toEmail,
    first_name: 'Preview',
    last_name: '',
    linkedin: '',
    company: 'HirePage',
    title: 'Founder',
    tags: [],
    custom: {},
    source: 'test',
    unsubscribed: false,
    bounced: false,
    notes: '',
    unsub_token: newToken(),
    created_at: Date.now(),
    updated_at: Date.now(),
  };
  const subject = '[TEST] ' + personalize(step.subject, stub);
  const bodyText = personalize(step.body, stub);
  const result = await sendOutreachEmail({
    contact: stub,
    enrollmentId: 'preview_' + newId(),
    sequenceId: seq.id,
    stepIdx,
    subject,
    body: bodyText,
  });
  return NextResponse.json({ ok: !result.draft, providerId: result.providerId ?? null, draft: result.draft });
}
