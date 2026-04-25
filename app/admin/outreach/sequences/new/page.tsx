import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminFromCookies } from '@/lib/admin-auth';
import NewSequenceForm from '@/components/outreach/NewSequenceForm';

export const dynamic = 'force-dynamic';

export default function NewSequencePage() {
  if (!isAdminFromCookies(cookies())) redirect('/admin/login');
  return <NewSequenceForm />;
}
