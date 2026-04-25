import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyCookie } from '@/lib/admin-auth';
import { importContacts, parseBulkInput } from '@/lib/outreach';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function POST(req: Request) {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyCookie(c)) return unauthorized();
  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const text = String(body.text ?? '');
  const rowsArg = Array.isArray(body.rows) ? body.rows : null;
  const rows = rowsArg ?? parseBulkInput(text);
  const summary = await importContacts(rows, body.source || 'import');
  return NextResponse.json({ summary });
}
