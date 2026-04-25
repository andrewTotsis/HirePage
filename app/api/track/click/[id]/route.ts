import { NextResponse } from 'next/server';
import { logEvent } from '@/lib/outreach';
import { outreachStorage } from '@/lib/outreach-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const target = url.searchParams.get('u') || 'https://hirepage.app';
  const id = params.id;
  const [enrollmentId, stepStr] = id.split('_');
  try {
    if (enrollmentId) {
      const en = await outreachStorage.getEnrollment(enrollmentId);
      if (en) {
        await logEvent({
          contact_id: en.contact_id,
          enrollment_id: en.id,
          sequence_id: en.sequence_id,
          step_idx: stepStr ? Number(stepStr) : null,
          type: 'clicked',
          meta: { url: target.slice(0, 500) },
        });
      }
    }
  } catch {}
  // Validate target is an absolute URL
  let safeUrl = 'https://hirepage.app';
  try {
    const u = new URL(target);
    if (u.protocol === 'http:' || u.protocol === 'https:') safeUrl = u.toString();
  } catch {}
  return NextResponse.redirect(safeUrl, 302);
}
