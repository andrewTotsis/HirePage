import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { getWarmup, putWarmup, warmupStatus } from '@/lib/warmup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); }

export async function GET() {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  const config = await getWarmup();
  const status = await warmupStatus();
  return NextResponse.json({ config, status });
}

export async function PATCH(req: Request) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const allow = ['enabled', 'start_date_ms', 'day_one_cap', 'daily_increment', 'daily_max'];
  const patch: Record<string, unknown> = {};
  for (const k of allow) if (k in body) patch[k] = body[k];
  const updated = await putWarmup(patch as any);
  return NextResponse.json({ config: updated, status: await warmupStatus() });
}
