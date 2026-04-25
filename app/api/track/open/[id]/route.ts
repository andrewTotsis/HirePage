import { logEvent } from '@/lib/outreach';
import { PIXEL_GIF, pixelHeaders } from '@/lib/email';
import { outreachStorage } from '@/lib/outreach-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function pixel(): Response {
  return new Response(PIXEL_GIF, { status: 200, headers: pixelHeaders() });
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // tracking id format: enrollmentId_stepIdx
  const id = params.id;
  const [enrollmentId, stepStr] = id.split('_');
  if (!enrollmentId) return pixel();
  try {
    const en = await outreachStorage.getEnrollment(enrollmentId);
    if (en) {
      await logEvent({
        contact_id: en.contact_id,
        enrollment_id: en.id,
        sequence_id: en.sequence_id,
        step_idx: stepStr ? Number(stepStr) : null,
        type: 'opened',
        meta: { ua: req.headers.get('user-agent')?.slice(0, 200) ?? null },
      });
    }
  } catch {}
  return pixel();
}
