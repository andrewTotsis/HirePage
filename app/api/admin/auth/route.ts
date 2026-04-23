import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { checkPassword, issueCookie } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: 'invalid' }, { status: 401 });
  }
  const c = issueCookie();
  cookies().set(c.name, c.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: c.maxAge,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  cookies().delete('hp_admin');
  return NextResponse.json({ ok: true });
}
