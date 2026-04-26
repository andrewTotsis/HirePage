import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { outreachStorage } from '@/lib/outreach-storage';
import { fullName, logEvent, personalize } from '@/lib/outreach';
import { getGmailSettings, sendViaGmail } from '@/lib/gmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function unauthorized() { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); }

export async function POST(req: Request) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();

  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const subjectTpl = String(body.subject ?? '').trim();
  const bodyTpl = String(body.body ?? '');
  const contactIds: string[] = Array.isArray(body.contact_ids) ? body.contact_ids.map(String) : [];
  const fromName = String(body.from_name ?? '').trim() || undefined;
  const replyTo = String(body.reply_to ?? '').trim() || undefined;

  if (!subjectTpl || !bodyTpl) return NextResponse.json({ error: 'subject and body required' }, { status: 400 });
  if (!contactIds.length) return NextResponse.json({ error: 'no contacts selected' }, { status: 400 });

  const settings = await getGmailSettings();
  if (!settings) return NextResponse.json({ error: 'Gmail not connected' }, { status: 412 });

  const fromEmail = settings.email;
  const results: Array<{ contact_id: string; ok: boolean; error?: string; message_id?: string }> = [];
  let sent = 0, skipped = 0, errors = 0;

  for (const id of contactIds.slice(0, 200)) {
    const contact = await outreachStorage.getContact(id);
    if (!contact) { skipped++; results.push({ contact_id: id, ok: false, error: 'not found' }); continue; }
    if (!contact.email) { skipped++; results.push({ contact_id: id, ok: false, error: 'no email' }); continue; }
    if (contact.unsubscribed) { skipped++; results.push({ contact_id: id, ok: false, error: 'unsubscribed' }); continue; }
    if (contact.bounced) { skipped++; results.push({ contact_id: id, ok: false, error: 'bounced' }); continue; }

    const subject = personalize(subjectTpl, contact);
    const bodyText = personalize(bodyTpl, contact);

    try {
      const r = await sendViaGmail({
        toEmail: contact.email,
        toName: fullName(contact) || undefined,
        fromEmail,
        fromName,
        subject,
        body: bodyText,
        replyTo,
      });
      if (r.ok) {
        sent++;
        await logEvent({
          contact_id: contact.id,
          enrollment_id: null,
          sequence_id: null,
          step_idx: null,
          type: 'sent',
          meta: { gmail_id: r.message_id, gmail_thread: r.thread_id, subject, via: 'gmail' },
        });
        results.push({ contact_id: contact.id, ok: true, message_id: r.message_id });
      } else {
        errors++;
        await logEvent({
          contact_id: contact.id,
          enrollment_id: null,
          sequence_id: null,
          step_idx: null,
          type: 'note',
          meta: { error: r.error, subject, via: 'gmail' },
        });
        results.push({ contact_id: contact.id, ok: false, error: r.error });
      }
    } catch (e) {
      errors++;
      const msg = e instanceof Error ? e.message : 'send failed';
      results.push({ contact_id: contact.id, ok: false, error: msg });
    }
  }

  return NextResponse.json({ sent, skipped, errors, total: contactIds.length, results });
}
