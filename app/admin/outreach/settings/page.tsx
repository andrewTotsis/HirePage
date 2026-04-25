import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { isAdminFromCookies } from '@/lib/admin-auth';
import SettingsView from '@/components/outreach/SettingsView';

export const dynamic = 'force-dynamic';

export default function OutreachSettingsPage() {
  if (!isAdminFromCookies(cookies())) redirect('/admin/login');
  return (
    <Suspense fallback={<main className="px-6 pt-10 text-white/55">Loading…</main>}>
      <SettingsView />
    </Suspense>
  );
}
