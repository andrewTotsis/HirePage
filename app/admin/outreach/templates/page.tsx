import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminFromCookies } from '@/lib/admin-auth';
import TemplatesView from '@/components/outreach/TemplatesView';

export const dynamic = 'force-dynamic';

export default function TemplatesPage() {
  if (!isAdminFromCookies(cookies())) redirect('/admin/login');
  return <TemplatesView />;
}
