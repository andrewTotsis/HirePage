import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminFromCookies } from '@/lib/admin-auth';
import ContactsView from '@/components/outreach/ContactsView';

export const dynamic = 'force-dynamic';

export default function ContactsPage() {
  if (!isAdminFromCookies(cookies())) redirect('/admin/login');
  return <ContactsView />;
}
