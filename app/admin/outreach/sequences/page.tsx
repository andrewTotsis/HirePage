import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminFromCookies } from '@/lib/admin-auth';
import SequencesView from '@/components/outreach/SequencesView';

export const dynamic = 'force-dynamic';

export default function SequencesPage() {
  if (!isAdminFromCookies(cookies())) redirect('/admin/login');
  return <SequencesView />;
}
