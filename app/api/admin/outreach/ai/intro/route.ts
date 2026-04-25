import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { outreachStorage } from '@/lib/outreach-storage';
import { generateIntro, isAIConfigured } from '@/lib/anthropic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function POST(req: Request) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  if (!isAIConfigured()) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 412 });

  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const contactId = String(body.contact_id ?? '');
  const extraContext = String(body.extra_context ?? '');
  const persist = body.persist !== false;
  const contact = await outreachStorage.getContact(contactId);
  if (!contact) return NextResponse.json({ error: 'contact not found' }, { status: 404 });
  try {
    const intro = await generateIntro({ contact, extraContext: extraContext || undefined });
    if (persist) {
      await outreachStorage.patchContact(contact.id, {
        custom: { ...(contact.custom ?? {}), ai_intro: intro },
      });
    }
    return NextResponse.json({ intro });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
