import { NextResponse } from 'next/server';
import { processDueEnrollments } from '@/lib/outreach';
import { getBaseUrl } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Vercel cron entry. Fires every 15 min via vercel.json. We accept either:
 *  - a Vercel cron request (header `x-vercel-cron`)
 *  - a manual trigger with `?key=$CRON_SECRET` (or `Authorization: Bearer …`)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.CRON_SECRET;
  const fromVercelCron = !!req.headers.get('x-vercel-cron');
  const auth = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || url.searchParams.get('key') || '';
  if (!fromVercelCron) {
    if (!secret || auth !== secret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }
  const result = await processDueEnrollments(Date.now(), getBaseUrl(req.url));
  return NextResponse.json(result);
}
