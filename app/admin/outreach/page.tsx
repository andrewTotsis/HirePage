import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminFromCookies } from '@/lib/admin-auth';
import OutreachOverview from '@/components/outreach/OutreachOverview';

export const dynamic = 'force-dynamic';

export default function OutreachPage() {
  if (!isAdminFromCookies(cookies())) redirect('/admin/login');
  return <OutreachOverview />;
}
