import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { outreachStorage } from '@/lib/outreach-storage';
import { generateIntro, isAIConfigured } from '@/lib/anthropic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); }

export async function POST(req: Request) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  if (!isAIConfigured()) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 412 });
  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const ids: string[] = Array.isArray(body.contact_ids) ? body.contact_ids.map(String) : [];
  if (!ids.length) return NextResponse.json({ error: 'no contacts' }, { status: 400 });
  const overwrite = !!body.overwrite;

  let generated = 0, skipped = 0, errors = 0;
  const details: Array<{ contact_id: string; result: string }> = [];
  for (const id of ids.slice(0, 50)) {
    const contact = await outreachStorage.getContact(id);
    if (!contact) { skipped++; details.push({ contact_id: id, result: 'not found' }); continue; }
    if (!overwrite && contact.custom?.ai_intro) { skipped++; details.push({ contact_id: id, result: 'already has intro' }); continue; }
    try {
      const intro = await generateIntro({ contact });
      await outreachStorage.patchContact(contact.id, {
        custom: { ...(contact.custom ?? {}), ai_intro: intro },
      });
      generated++;
      details.push({ contact_id: id, result: 'ok' });
    } catch (e) {
      errors++;
      details.push({ contact_id: id, result: e instanceof Error ? e.message : 'failed' });
    }
  }
  return NextResponse.json({ generated, skipped, errors, details });
}
