import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminFromCookies } from '@/lib/admin-auth';
import ContactDetailView from '@/components/outreach/ContactDetailView';

export const dynamic = 'force-dynamic';

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  if (!isAdminFromCookies(cookies())) redirect('/admin/login');
  return <ContactDetailView id={params.id} />;
}
